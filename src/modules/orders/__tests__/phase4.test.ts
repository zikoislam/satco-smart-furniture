import { createHmac } from 'crypto';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { signAccessToken } from '@/modules/auth/jwt.service';
import { GET as getCartHandler } from '@/app/api/v1/cart/route';
import { POST as addCartItemHandler } from '@/app/api/v1/cart/items/route';
import {
  PATCH as patchCartItemHandler,
  DELETE as deleteCartItemHandler,
} from '@/app/api/v1/cart/items/[id]/route';
import { POST as checkoutHandler } from '@/app/api/v1/orders/checkout/route';
import { POST as initializePaymentHandler } from '@/app/api/v1/payments/initialize/route';
import { POST as webhookHandler } from '@/app/api/v1/payments/webhook/route';
import { POST as sampleBoxHandler } from '@/app/api/v1/sample-box/order/route';
import {
  assertValidOrderTransition,
  transitionOrderStatus,
} from '@/modules/orders/order-state-machine';
import { toDecimal } from '@/lib/decimal';

jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

const mockTx = {
  cart: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn(), delete: jest.fn() },
  cartItem: { updateMany: jest.fn(), deleteMany: jest.fn() },
  address: { findUnique: jest.fn() },
  pricingRule: { findFirst: jest.fn() },
  coupon: { findUnique: jest.fn(), update: jest.fn() },
  materialSampleBoxOrder: { findFirst: jest.fn(), update: jest.fn() },
  order: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
  orderItem: { create: jest.fn() },
  orderTimeline: { create: jest.fn() },
  milestonePayment: { create: jest.fn(), update: jest.fn() },
  company: { findFirst: jest.fn() },
  invoice: { create: jest.fn() },
  paymentTransaction: { findUnique: jest.fn(), update: jest.fn() },
};

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
    cart: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
    cartItem: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
    productTemplate: { findUnique: jest.fn() },
    pricingRule: { findFirst: jest.fn() },
    materialSheet: { findUnique: jest.fn() },
    edgeBanding: { findUnique: jest.fn() },
    hardwareItem: { findMany: jest.fn() },
    order: { findUnique: jest.fn() },
    paymentTransaction: { create: jest.fn() },
    materialSampleBoxOrder: { create: jest.fn() },
  },
}));

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const CART_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const TEMPLATE_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const ADDRESS_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const ORDER_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

function customerToken() {
  return signAccessToken({
    sub: USER_ID,
    role: 'CUSTOMER',
    phone: '+966501234567',
    email: null,
    companyId: null,
  }).accessToken;
}

describe('Phase 4: Cart, Orders, State Machine, Payments & Sample Box', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MOYASAR_MOCK_MODE = 'true';
    process.env.MOYASAR_WEBHOOK_SECRET = 'test-webhook-secret';
  });

  it('4.1: retrieves guest cart by X-Session-ID and computes 15% ZATCA VAT', async () => {
    (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
      id: CART_ID,
      sessionId: 'sess-guest-1',
      userId: null,
      items: [
        {
          id: 'item-1',
          configuredWidthMm: 1600,
          configuredHeightMm: 2400,
          configuredDepthMm: 600,
          configurationJson: { carcass: 'EGG-H1180' },
          quantity: 1,
          unitPriceSar: '1000.0000',
          totalPriceSar: '1000.0000',
          template: { slug: 'wardrobe', nameAr: 'خزانة', nameEn: 'Wardrobe' },
        },
      ],
    });

    const req = new NextRequest('http://localhost:3000/api/v1/cart', {
      headers: { 'x-session-id': 'sess-guest-1' },
    });
    const res = await getCartHandler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.netSubtotalSar).toBe('1000.00');
    expect(body.data.vatAmountSar).toBe('150.00');
    expect(body.data.grandTotalSar).toBe('1150.00');
    expect(body.data.items).toHaveLength(1);
  });

  it('4.1: merges guest cart into authenticated user cart on access', async () => {
    const token = customerToken();
    (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
      id: 'guest-cart-id',
      sessionId: 'sess-merge-1',
      userId: null,
      items: [{ id: 'item-1' }],
    });
    mockTx.cart.findFirst.mockResolvedValue({ id: CART_ID, userId: USER_ID });
    (prisma.cart.findFirst as jest.Mock).mockResolvedValue({
      id: CART_ID,
      sessionId: 'user-sess',
      userId: USER_ID,
      items: [],
    });

    const req = new NextRequest('http://localhost:3000/api/v1/cart', {
      headers: {
        authorization: `Bearer ${token}`,
        'x-session-id': 'sess-merge-1',
      },
    });
    const res = await getCartHandler(req, { params: Promise.resolve({}) });

    expect(res.status).toBe(200);
    expect(mockTx.cartItem.updateMany).toHaveBeenCalledWith({
      where: { cartId: 'guest-cart-id' },
      data: { cartId: CART_ID },
    });
    expect(mockTx.cart.delete).toHaveBeenCalledWith({ where: { id: 'guest-cart-id' } });
  });

  it('4.1: adds, updates, and deletes cart item with deterministic pricing', async () => {
    (prisma.productTemplate.findUnique as jest.Mock).mockResolvedValue({
      id: TEMPLATE_ID,
      isActive: true,
      minWidthMm: 800,
      maxWidthMm: 2400,
      minHeightMm: 1800,
      maxHeightMm: 3000,
      minDepthMm: 450,
      maxDepthMm: 750,
    });
    (prisma.pricingRule.findFirst as jest.Mock).mockResolvedValue({
      cuttingPerMeterSar: '5.00',
      edgeBandingPerMeterSar: '4.00',
      cncPerHoleSar: '0.50',
      laborMarkupRate: '0.18',
      marginRate: '0.22',
      vatPercentage: '15.0000',
    });
    (prisma.materialSheet.findUnique as jest.Mock).mockResolvedValue({
      sellingPricePerSqmSar: '125.00',
    });
    (prisma.edgeBanding.findUnique as jest.Mock).mockResolvedValue({
      sellingPricePerMeterSar: '6.00',
    });
    (prisma.hardwareItem.findMany as jest.Mock).mockResolvedValue([
      { unitType: 'hinge', sellingPriceSar: '18.00' },
      { unitType: 'drawer_runner', sellingPriceSar: '85.00' },
    ]);
    (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
      id: CART_ID,
      sessionId: 'sess-1',
      items: [],
    });
    (prisma.cartItem.create as jest.Mock).mockResolvedValue({
      id: 'item-created-1',
      quantity: 1,
    });

    const addReq = new NextRequest('http://localhost:3000/api/v1/cart/items', {
      method: 'POST',
      headers: { 'x-session-id': 'sess-1', 'content-type': 'application/json' },
      body: JSON.stringify({
        templateId: TEMPLATE_ID,
        configuredWidthMm: 1600,
        configuredHeightMm: 2400,
        configuredDepthMm: 600,
        configurationJson: {
          carcass: 'EGG-H1180-ST37',
          shutter: 'EGG-W1000-PM',
          edgeBanding: 'REHAU-OAK-2MM',
          shelves: 4,
          drawers: 2,
          doors: 2,
        },
        quantity: 1,
      }),
    });
    const addRes = await addCartItemHandler(addReq, { params: Promise.resolve({}) });
    expect(addRes.status).toBe(201);

    (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({
      id: 'item-created-1',
      unitPriceSar: '1000.0000',
      cart: { userId: null, sessionId: 'sess-1' },
    });
    (prisma.cartItem.update as jest.Mock).mockResolvedValue({
      id: 'item-created-1',
      quantity: 3,
    });

    const patchReq = new NextRequest('http://localhost:3000/api/v1/cart/items/item-created-1', {
      method: 'PATCH',
      headers: { 'x-session-id': 'sess-1', 'content-type': 'application/json' },
      body: JSON.stringify({ quantity: 3 }),
    });
    const patchRes = await patchCartItemHandler(patchReq, {
      params: Promise.resolve({ id: 'item-created-1' }),
    });
    const patchBody = await patchRes.json();
    expect(patchRes.status).toBe(200);
    expect(patchBody.data.totalPriceSar).toBe('3000.00');

    const delReq = new NextRequest('http://localhost:3000/api/v1/cart/items/item-created-1', {
      method: 'DELETE',
      headers: { 'x-session-id': 'sess-1' },
    });
    const delRes = await deleteCartItemHandler(delReq, {
      params: Promise.resolve({ id: 'item-created-1' }),
    });
    expect(delRes.status).toBe(200);
  });

  it('4.2: checkout enforces X-Idempotency-Key, creates 50/40/10 milestones summing to grandTotal, and applies 100 SAR sample box credit', async () => {
    const token = customerToken();
    (redis.get as jest.Mock).mockResolvedValue(null);
    (redis.set as jest.Mock).mockResolvedValue('OK');

    mockTx.cart.findUnique.mockResolvedValue({
      id: CART_ID,
      userId: USER_ID,
      items: [
        {
          templateId: TEMPLATE_ID,
          configuredWidthMm: 1600,
          configuredHeightMm: 2400,
          configuredDepthMm: 600,
          configurationJson: { carcass: 'EGG-H1180' },
          quantity: 1,
          unitPriceSar: '3000.0000',
          totalPriceSar: '3000.0000',
        },
      ],
    });
    mockTx.address.findUnique.mockResolvedValue({ id: ADDRESS_ID, userId: USER_ID });
    mockTx.pricingRule.findFirst.mockResolvedValue({
      id: 'rule-1',
      vatPercentage: '15.0000',
    });
    mockTx.materialSampleBoxOrder.findFirst.mockResolvedValue({
      id: 'box-1',
      sampleBoxFeeSar: '100.0000',
    });
    mockTx.order.create.mockResolvedValue({
      id: ORDER_ID,
      orderNumber: 'ORD-2026-12345ABCD',
      status: 'PENDING_DEPOSIT',
      warrantyYears: 2,
    });
    mockTx.company.findFirst.mockResolvedValue({ id: 'comp-1' });

    const req = new NextRequest('http://localhost:3000/api/v1/orders/checkout', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'x-idempotency-key': 'idem-checkout-1',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        cartId: CART_ID,
        addressId: ADDRESS_ID,
        warrantyYears: 2,
      }),
    });

    const res = await checkoutHandler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.sampleBoxCredited).toBe(true);
    expect(body.data.discountSar).toBe('100.00');
    // (3000 - 100) * 1.15 = 3335.00
    expect(body.data.grandTotalSar).toBe('3335.00');

    const mSum = body.data.milestones.reduce(
      (acc: ReturnType<typeof toDecimal>, m: { amountSar: string }) =>
        acc.plus(toDecimal(m.amountSar)),
      toDecimal(0)
    );
    expect(mSum.toFixed(2)).toBe(body.data.grandTotalSar);
    expect(mockTx.materialSampleBoxOrder.update).toHaveBeenCalled();
  });

  it('4.2: replays cached response with X-Cache: HIT on duplicate X-Idempotency-Key', async () => {
    const token = customerToken();
    (redis.get as jest.Mock).mockResolvedValue(
      JSON.stringify({
        status: 201,
        body: { success: true, code: 'ORDER_CREATED', data: { orderId: ORDER_ID } },
      })
    );

    const req = new NextRequest('http://localhost:3000/api/v1/orders/checkout', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'x-idempotency-key': 'idem-replay-1',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ cartId: CART_ID, addressId: ADDRESS_ID }),
    });

    const res = await checkoutHandler(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
    expect(res.headers.get('x-cache')).toBe('HIT');
  });

  it('4.3: enforces 15-state order machine and throws 409 STATE_MACHINE_TRANSITION_INVALID', async () => {
    expect(() => assertValidOrderTransition('PENDING_DEPOSIT', 'PAID_DEPOSIT')).not.toThrow();
    expect(() => assertValidOrderTransition('PRODUCTION_QUEUED', 'CANCELLED')).not.toThrow();

    expect(() => assertValidOrderTransition('IN_PRODUCTION', 'CANCELLED')).toThrow(
      /Invalid order state transition/
    );

    try {
      assertValidOrderTransition('DRAFT', 'HANDOVER_COMPLETED');
    } catch (err: unknown) {
      const appErr = err as { statusCode: number; code: string };
      expect(appErr.statusCode).toBe(409);
      expect(appErr.code).toBe('STATE_MACHINE_TRANSITION_INVALID');
    }

    mockTx.order.findUnique.mockResolvedValue({ id: ORDER_ID, status: 'PENDING_DEPOSIT' });
    mockTx.order.update.mockResolvedValue({ id: ORDER_ID, status: 'PAID_DEPOSIT' });

    await transitionOrderStatus(mockTx as never, {
      orderId: ORDER_ID,
      toStatus: 'PAID_DEPOSIT',
      actionBy: USER_ID,
      notes: 'Deposit paid',
    });

    expect(mockTx.orderTimeline.create).toHaveBeenCalledWith({
      data: {
        orderId: ORDER_ID,
        fromStatus: 'PENDING_DEPOSIT',
        toStatus: 'PAID_DEPOSIT',
        actionBy: USER_ID,
        notes: 'Deposit paid',
      },
    });
  });

  it('4.4: initializes Moyasar payment and processes HMAC-signed webhook idempotently (BR-SEC-005)', async () => {
    const token = customerToken();
    (redis.get as jest.Mock).mockResolvedValue(null);
    (redis.set as jest.Mock).mockResolvedValue('OK');

    (prisma.order.findUnique as jest.Mock).mockResolvedValue({
      id: ORDER_ID,
      customerId: USER_ID,
      status: 'PENDING_DEPOSIT',
      milestoneSchedules: [
        { milestone: 'MILESTONE_1_DEPOSIT', amountSar: '1667.5000', status: 'PENDING' },
      ],
      invoices: [{ id: 'inv-1' }],
    });
    (prisma.paymentTransaction.create as jest.Mock).mockResolvedValue({
      id: 'tx-1',
      gatewayReference: 'moyasar_ch_mock123',
    });

    const initReq = new NextRequest('http://localhost:3000/api/v1/payments/initialize', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'x-idempotency-key': 'idem-pay-1',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        orderId: ORDER_ID,
        milestone: 'MILESTONE_1_DEPOSIT',
        paymentMethod: 'MADA',
        callbackUrl: 'https://satco.sa/orders/1/return',
      }),
    });

    const initRes = await initializePaymentHandler(initReq, { params: Promise.resolve({}) });
    const initBody = await initRes.json();
    expect(initRes.status).toBe(200);
    expect(initBody.data.amountSar).toBe('1667.50');

    // Webhook with valid HMAC-SHA256
    const rawWebhook = JSON.stringify({
      gatewayReference: 'moyasar_ch_mock123',
      status: 'paid',
    });
    const sig = createHmac('sha256', 'test-webhook-secret').update(rawWebhook).digest('hex');

    mockTx.paymentTransaction.findUnique.mockResolvedValue({
      id: 'tx-1',
      orderId: ORDER_ID,
      milestone: 'MILESTONE_1_DEPOSIT',
      amountSar: '1667.5000',
      status: 'PENDING',
      order: {
        id: ORDER_ID,
        status: 'PENDING_DEPOSIT',
        paidAmountSar: '0.0000',
        grandTotalSar: '3335.0000',
        warrantyYears: 2,
      },
    });
    mockTx.order.findUnique.mockResolvedValue({ id: ORDER_ID, status: 'PENDING_DEPOSIT' });
    mockTx.order.update.mockResolvedValue({ id: ORDER_ID, status: 'PAID_DEPOSIT' });

    const whReq = new NextRequest('http://localhost:3000/api/v1/payments/webhook', {
      method: 'POST',
      headers: { 'x-signature': sig, 'content-type': 'application/json' },
      body: rawWebhook,
    });
    const whRes = await webhookHandler(whReq, { params: Promise.resolve({}) });
    const whBody = await whRes.json();

    expect(whRes.status).toBe(200);
    expect(whBody.processed).toBe(true);
    expect(mockTx.orderTimeline.create).toHaveBeenCalled();

    // Invalid signature returns 401
    const badWhReq = new NextRequest('http://localhost:3000/api/v1/payments/webhook', {
      method: 'POST',
      headers: { 'x-signature': 'bad-signature', 'content-type': 'application/json' },
      body: rawWebhook,
    });
    const badWhRes = await webhookHandler(badWhReq, { params: Promise.resolve({}) });
    expect(badWhRes.status).toBe(401);
  });

  it('4.5: orders 100 SAR refundable material sample box', async () => {
    const token = customerToken();
    (prisma.materialSampleBoxOrder.create as jest.Mock).mockResolvedValue({
      id: 'box-991823',
      status: 'ORDERED',
    });

    const req = new NextRequest('http://localhost:3000/api/v1/sample-box/order', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        shippingAddress: {
          buildingNumber: '3244',
          streetName: 'King Fahd Road',
          district: 'Al Olaya',
          city: 'Jeddah',
          postalCode: '12211',
        },
        preferredFinishes: ['EGG-H1180-ST37', 'EGG-W1000-PM'],
      }),
    });

    const res = await sampleBoxHandler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.code).toBe('SAMPLE_BOX_ORDERED');
    expect(body.data.feeSar).toBe('100.00');
  });
});
