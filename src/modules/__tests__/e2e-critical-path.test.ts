import { createHmac } from 'crypto';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { signAccessToken } from '@/modules/auth/jwt.service';
import { GET as healthHandler } from '@/app/api/health/route';
import { GET as googleFeedHandler } from '@/app/api/feeds/google-merchant.xml/route';
import { GET as metaFeedHandler } from '@/app/api/feeds/meta-catalog.xml/route';
import { GET as templatesHandler } from '@/app/api/v1/configurator/templates/route';
import { POST as calcPriceHandler } from '@/app/api/v1/configurator/calculate-price/route';
import { POST as addCartItemHandler } from '@/app/api/v1/cart/items/route';
import { POST as checkoutHandler } from '@/app/api/v1/orders/checkout/route';
import { POST as initPayHandler } from '@/app/api/v1/payments/initialize/route';
import { POST as webhookHandler } from '@/app/api/v1/payments/webhook/route';
import { POST as generateBomHandler } from '@/app/api/v1/manufacturing/orders/[orderId]/generate-bom/route';
import { POST as nestHandler } from '@/app/api/v1/manufacturing/jobs/nest/route';
import { GET as cncPollHandler } from '@/app/api/v1/cnc-bridge/poll/route';
import { POST as issueInvoiceHandler } from '@/app/api/v1/invoices/[id]/issue/route';
import { POST as completeInstallHandler } from '@/app/api/v1/installations/[jobId]/complete/route';
import {
  GET as listReviewsHandler,
  POST as submitReviewHandler,
} from '@/app/api/v1/reviews/route';
import { PATCH as moderateReviewHandler } from '@/app/api/v1/admin/reviews/[reviewId]/moderate/route';

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
  bOMRevision: { create: jest.fn() },
  materialSheet: { findUnique: jest.fn() },
  edgeBanding: { findUnique: jest.fn() },
  bOMItem: { create: jest.fn() },
  cuttingJob: { create: jest.fn(), update: jest.fn() },
  cNCMachineJob: { create: jest.fn(), update: jest.fn() },
  installationJob: { findUnique: jest.fn(), update: jest.fn() },
  handoverSignature: { create: jest.fn() },
};

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
    productTemplate: { findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn() },
    pricingRule: { findFirst: jest.fn() },
    materialSheet: { findUnique: jest.fn() },
    edgeBanding: { findUnique: jest.fn() },
    hardwareItem: { findMany: jest.fn() },
    cart: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    cartItem: { create: jest.fn() },
    order: { findUnique: jest.fn() },
    paymentTransaction: { create: jest.fn() },
    bOMItem: { findMany: jest.fn() },
    cNCMachineJob: { findMany: jest.fn(), updateMany: jest.fn() },
    company: { findFirst: jest.fn() },
    invoice: { findFirst: jest.fn(), create: jest.fn() },
    review: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  },
}));

const CUSTOMER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const STAFF_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const TEMPLATE_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const ADDRESS_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const CART_ID = '11111111-1111-4111-8111-111111111111';
const ORDER_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const SHEET_ID = '22222222-2222-4222-8222-222222222222';
const JOB_ID = '33333333-3333-4333-8333-333333333333';
const REVIEW_ID = '44444444-4444-4444-8444-444444444444';

describe('Phase 8: Feeds, Reviews, Healthcheck & E2E Critical Path', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MOYASAR_MOCK_MODE = 'true';
    process.env.MOYASAR_WEBHOOK_SECRET = 'e2e-webhook-secret';
    process.env.FACTORY_BRIDGE_API_KEY = 'e2e-bridge-key';
  });

  it('8.2 & 8.5: serves Google Merchant XML, Meta Catalog XML, and /api/health', async () => {
    (prisma.productTemplate.findMany as jest.Mock).mockResolvedValue([
      {
        id: TEMPLATE_ID,
        slug: 'luxury-wardrobe',
        nameEn: 'Luxury Wardrobe',
        nameAr: 'خزانة فاخرة',
        defaultWidthMm: 1600,
        defaultHeightMm: 2400,
        defaultDepthMm: 600,
        basePriceSar: '2500.0000',
        category: { nameEn: 'Wardrobes', nameAr: 'خزائن', slug: 'wardrobes' },
      },
    ]);

    const gRes = await googleFeedHandler(new NextRequest('http://localhost:3000/api/feeds/google-merchant.xml'), { params: Promise.resolve({}) });
    const gXml = await gRes.text();
    expect(gRes.status).toBe(200);
    expect(gRes.headers.get('content-type')).toContain('application/xml');
    expect(gXml).toContain('<g:price>2500.00 SAR</g:price>');

    const mRes = await metaFeedHandler(new NextRequest('http://localhost:3000/api/feeds/meta-catalog.xml'), { params: Promise.resolve({}) });
    expect(mRes.status).toBe(200);

    const hRes = await healthHandler();
    const hBody = await hRes.json();
    expect(hRes.status).toBe(200);
    expect(hBody.status).toBe('ok');
  });

  it('8.4: executes full critical path end-to-end from Catalog -> Checkout -> Pay -> BOM -> Nest -> CNC -> ZATCA -> Install -> Review', async () => {
    const customerJwt = signAccessToken({
      sub: CUSTOMER_ID,
      role: 'CUSTOMER',
      phone: '+966501234567',
    }).accessToken;

    const adminJwt = signAccessToken({
      sub: STAFF_ID,
      role: 'SUPER_ADMIN',
      email: 'admin@satco.sa',
    }).accessToken;

    // 1. Browse Catalog
    (prisma.productTemplate.findMany as jest.Mock).mockResolvedValue([
      {
        id: TEMPLATE_ID,
        slug: 'luxury-wardrobe',
        nameAr: 'خزانة',
        nameEn: 'Luxury Wardrobe',
        minWidthMm: 800,
        maxWidthMm: 2400,
        minHeightMm: 1800,
        maxHeightMm: 3000,
        minDepthMm: 450,
        maxDepthMm: 750,
        defaultWidthMm: 1600,
        defaultHeightMm: 2400,
        defaultDepthMm: 600,
        parametricRules: {},
        basePriceSar: { toFixed: (d: number) => (2500).toFixed(d) },
        category: { id: 'cat-1', slug: 'wardrobes', nameAr: 'خزائن', nameEn: 'Wardrobes' },
      },
    ]);
    (prisma.productTemplate.count as jest.Mock).mockResolvedValue(1);
    const tplRes = await templatesHandler(new NextRequest('http://localhost:3000/api/v1/configurator/templates'), { params: Promise.resolve({}) });
    expect(tplRes.status).toBe(200);

    // 2. Calculate Price & Add to Cart
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
      id: 'rule-1',
      cuttingPerMeterSar: '5.00',
      edgeBandingPerMeterSar: '4.00',
      cncPerHoleSar: '0.50',
      laborMarkupRate: '0.18',
      marginRate: '0.22',
      vatPercentage: '15.0000',
    });
    (prisma.materialSheet.findUnique as jest.Mock).mockResolvedValue({ id: SHEET_ID, sellingPricePerSqmSar: '125.00' });
    (prisma.edgeBanding.findUnique as jest.Mock).mockResolvedValue({ id: 'eb-1', sellingPricePerMeterSar: '6.00' });
    (prisma.hardwareItem.findMany as jest.Mock).mockResolvedValue([
      { unitType: 'hinge', sellingPriceSar: '18.00' },
      { unitType: 'drawer_runner', sellingPriceSar: '85.00' },
    ]);

    const priceRes = await calcPriceHandler(
      new NextRequest('http://localhost:3000/api/v1/configurator/calculate-price', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          templateId: TEMPLATE_ID,
          widthMm: 1600,
          heightMm: 2400,
          depthMm: 600,
          carcassMaterialCode: 'EGG-H1180-ST37',
          shutterMaterialCode: 'EGG-W1000-PM',
          edgeBandingCode: 'REHAU-OAK-2MM',
          shelvesCount: 5,
          drawersCount: 2,
          doorsCount: 2,
        }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(priceRes.status).toBe(200);

    (prisma.cart.findFirst as jest.Mock).mockResolvedValue({ id: CART_ID, sessionId: 's1', userId: CUSTOMER_ID, items: [] });
    (prisma.cartItem.create as jest.Mock).mockResolvedValue({ id: 'ci-1', quantity: 1 });
    const cartRes = await addCartItemHandler(
      new NextRequest('http://localhost:3000/api/v1/cart/items', {
        method: 'POST',
        headers: { authorization: `Bearer ${customerJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          templateId: TEMPLATE_ID,
          configuredWidthMm: 1600,
          configuredHeightMm: 2400,
          configuredDepthMm: 600,
          configurationJson: { carcass: 'EGG-H1180-ST37', shutter: 'EGG-W1000-PM', edgeBanding: 'REHAU-OAK-2MM', shelves: 5, drawers: 2, doors: 2 },
          quantity: 1,
        }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(cartRes.status).toBe(201);

    // 3. Checkout
    (redis.get as jest.Mock).mockResolvedValue(null);
    (redis.set as jest.Mock).mockResolvedValue('OK');
    mockTx.cart.findUnique.mockResolvedValue({
      id: CART_ID,
      userId: CUSTOMER_ID,
      items: [{ templateId: TEMPLATE_ID, configuredWidthMm: 1600, configuredHeightMm: 2400, configuredDepthMm: 600, configurationJson: {}, quantity: 1, unitPriceSar: '4000.0000', totalPriceSar: '4000.0000' }],
    });
    mockTx.address.findUnique.mockResolvedValue({ id: ADDRESS_ID, userId: CUSTOMER_ID });
    mockTx.pricingRule.findFirst.mockResolvedValue({ id: 'rule-1', vatPercentage: '15.0000' });
    mockTx.materialSampleBoxOrder.findFirst.mockResolvedValue(null);
    mockTx.order.create.mockResolvedValue({ id: ORDER_ID, orderNumber: 'ORD-E2E-1', status: 'PENDING_DEPOSIT', warrantyYears: 2 });
    mockTx.company.findFirst.mockResolvedValue({ id: 'comp-1' });

    const checkoutRes = await checkoutHandler(
      new NextRequest('http://localhost:3000/api/v1/orders/checkout', {
        method: 'POST',
        headers: { authorization: `Bearer ${customerJwt}`, 'x-idempotency-key': 'e2e-chk-1', 'content-type': 'application/json' },
        body: JSON.stringify({ cartId: CART_ID, addressId: ADDRESS_ID, warrantyYears: 2 }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(checkoutRes.status).toBe(201);

    // 4. Initialize Payment + Pay Deposit Webhook
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({
      id: ORDER_ID,
      customerId: CUSTOMER_ID,
      status: 'PENDING_DEPOSIT',
      milestoneSchedules: [{ milestone: 'MILESTONE_1_DEPOSIT', amountSar: '2300.0000', status: 'PENDING' }],
      invoices: [{ id: 'inv-1' }],
    });
    (prisma.paymentTransaction.create as jest.Mock).mockResolvedValue({ id: 'tx-1', gatewayReference: 'moyasar_e2e_1' });

    const payInitRes = await initPayHandler(
      new NextRequest('http://localhost:3000/api/v1/payments/initialize', {
        method: 'POST',
        headers: { authorization: `Bearer ${customerJwt}`, 'x-idempotency-key': 'e2e-pay-1', 'content-type': 'application/json' },
        body: JSON.stringify({ orderId: ORDER_ID, milestone: 'MILESTONE_1_DEPOSIT', paymentMethod: 'MADA', callbackUrl: 'https://satco.sa/return' }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(payInitRes.status).toBe(200);

    const rawWh = JSON.stringify({ gatewayReference: 'moyasar_e2e_1', status: 'paid' });
    const whSig = createHmac('sha256', 'e2e-webhook-secret').update(rawWh).digest('hex');
    mockTx.paymentTransaction.findUnique.mockResolvedValue({
      id: 'tx-1',
      orderId: ORDER_ID,
      milestone: 'MILESTONE_1_DEPOSIT',
      amountSar: '2300.0000',
      status: 'PENDING',
      order: { id: ORDER_ID, status: 'PENDING_DEPOSIT', paidAmountSar: '0.0000', grandTotalSar: '4600.0000', warrantyYears: 2 },
    });
    mockTx.order.findUnique.mockResolvedValue({ id: ORDER_ID, status: 'PENDING_DEPOSIT' });
    mockTx.order.update.mockResolvedValue({ id: ORDER_ID, status: 'PAID_DEPOSIT' });

    const whRes = await webhookHandler(
      new NextRequest('http://localhost:3000/api/v1/payments/webhook', {
        method: 'POST',
        headers: { 'x-signature': whSig, 'content-type': 'application/json' },
        body: rawWh,
      }),
      { params: Promise.resolve({}) }
    );
    expect(whRes.status).toBe(200);

    // 5. Generate BOM -> Nest -> CNC Poll
    mockTx.order.findUnique.mockResolvedValue({
      id: ORDER_ID,
      status: 'PAID_DEPOSIT',
      bomRevisions: [],
      items: [{ id: 'oi-1', configuredWidthMm: 1600, configuredHeightMm: 2400, configuredDepthMm: 600, quantity: 1, configurationJson: { carcass: 'EGG-H1180-ST37', shutter: 'EGG-W1000-PM', edgeBanding: 'REHAU-OAK-2MM', doors: 2, drawers: 2 }, template: { slug: 'luxury-wardrobe' } }],
    });
    mockTx.bOMRevision.create.mockResolvedValue({ id: 'rev-1', revisionTag: 'REV-1' });
    mockTx.materialSheet.findUnique.mockResolvedValue({ id: SHEET_ID });
    mockTx.edgeBanding.findUnique.mockResolvedValue({ id: 'eb-1' });
    mockTx.bOMItem.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'bom-1', partLabel: data.partLabel, barcodeOpaqueToken: data.barcodeOpaqueToken }));

    const bomRes = await generateBomHandler(
      new NextRequest(`http://localhost:3000/api/v1/manufacturing/orders/${ORDER_ID}/generate-bom`, {
        method: 'POST',
        headers: { authorization: `Bearer ${adminJwt}` },
      }),
      { params: Promise.resolve({ id: ORDER_ID }) }
    );
    expect(bomRes.status).toBe(200);

    (prisma.materialSheet.findUnique as jest.Mock).mockResolvedValue({ id: SHEET_ID, code: 'EGG-H1180-ST37', lengthMm: 2440, widthMm: 1220 });
    (prisma.bOMItem.findMany as jest.Mock).mockResolvedValue([{ id: 'bom-1', partLabel: 'GABLE_L', barcodeOpaqueToken: 'tok-1', materialSheetId: SHEET_ID, cutLengthMm: '2320', cutWidthMm: '580', grainDirection: 'LENGTHWISE', quantity: 1 }]);
    mockTx.cuttingJob.create.mockResolvedValue({ id: 'cut-1', status: 'NESTED' });
    mockTx.cNCMachineJob.create.mockResolvedValue({ id: 'cnc-1' });

    const nestRes = await nestHandler(
      new NextRequest('http://localhost:3000/api/v1/manufacturing/jobs/nest', {
        method: 'POST',
        headers: { authorization: `Bearer ${adminJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({ orderId: ORDER_ID, sheetMaterialId: SHEET_ID }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(nestRes.status).toBe(200);

    (prisma.cNCMachineJob.findMany as jest.Mock).mockResolvedValue([{ id: 'cnc-1', cuttingJobId: 'cut-1', machineModel: 'Homag', programNumber: 'SATCO_PRG_1' }]);
    (prisma.cNCMachineJob.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    const pollRes = await cncPollHandler(
      new NextRequest('http://localhost:3000/api/v1/cnc-bridge/poll', { headers: { 'x-bridge-key': 'e2e-bridge-key' } }),
      { params: Promise.resolve({}) }
    );
    expect(pollRes.status).toBe(200);

    // 6. Issue ZATCA Invoice -> Complete Installation -> Submit & Moderate Review
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({ id: ORDER_ID, netSubtotalSar: '4000.0000', discountSar: '0.0000', vatAmountSar: '600.0000', grandTotalSar: '4600.0000' });
    (prisma.company.findFirst as jest.Mock).mockResolvedValue({ id: 'comp-1', legalNameEn: 'SATCO Co', vatRegistrationNumber: '310294857200003' });
    (prisma.invoice.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.invoice.create as jest.Mock).mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'inv-e2e', ...data }));

    const invRes = await issueInvoiceHandler(
      new NextRequest(`http://localhost:3000/api/v1/invoices/${ORDER_ID}/issue`, {
        method: 'POST',
        headers: { authorization: `Bearer ${adminJwt}` },
      }),
      { params: Promise.resolve({ id: ORDER_ID }) }
    );
    expect(invRes.status).toBe(201);

    mockTx.installationJob.findUnique.mockResolvedValue({
      id: JOB_ID,
      orderId: ORDER_ID,
      status: 'IN_PROGRESS',
      order: { id: ORDER_ID, status: 'INSTALLATION_IN_PROGRESS', warrantyYears: 2, customer: { fullName: 'Faisal', phone: '+966501234567' }, milestoneSchedules: [{ milestone: 'MILESTONE_3_HANDOVER', amountSar: '460.0000' }] },
    });
    mockTx.order.findUnique.mockResolvedValue({ id: ORDER_ID, status: 'INSTALLATION_IN_PROGRESS' });

    const instRes = await completeInstallHandler(
      new NextRequest(`http://localhost:3000/api/v1/installations/${JOB_ID}/complete`, {
        method: 'POST',
        headers: { authorization: `Bearer ${adminJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({ customerSignDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANS', completionPhotos: ['https://satco.sa/p1.jpg'], latitude: 24.7136, longitude: 46.6753 }),
      }),
      { params: Promise.resolve({ jobId: JOB_ID }) }
    );
    expect(instRes.status).toBe(200);

    (prisma.order.findUnique as jest.Mock).mockResolvedValue({ id: ORDER_ID, customerId: CUSTOMER_ID, status: 'HANDOVER_COMPLETED' });
    (prisma.review.create as jest.Mock).mockResolvedValue({ id: REVIEW_ID, rating: 5, status: 'PENDING_MODERATION' });

    const revRes = await submitReviewHandler(
      new NextRequest('http://localhost:3000/api/v1/reviews', {
        method: 'POST',
        headers: { authorization: `Bearer ${customerJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({ orderId: ORDER_ID, rating: 5, commentEn: 'Precision fit in Jeddah!' }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(revRes.status).toBe(201);

    (prisma.review.findUnique as jest.Mock).mockResolvedValue({ id: REVIEW_ID, status: 'PENDING_MODERATION' });
    (prisma.review.update as jest.Mock).mockResolvedValue({ id: REVIEW_ID, status: 'APPROVED' });

    const modRes = await moderateReviewHandler(
      new NextRequest(`http://localhost:3000/api/v1/admin/reviews/${REVIEW_ID}/moderate`, {
        method: 'PATCH',
        headers: { authorization: `Bearer ${adminJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      }),
      { params: Promise.resolve({ reviewId: REVIEW_ID }) }
    );
    expect(modRes.status).toBe(200);

    (prisma.review.findMany as jest.Mock).mockResolvedValue([{ id: REVIEW_ID, rating: 5, status: 'APPROVED' }]);
    const pubRevRes = await listReviewsHandler(new NextRequest('http://localhost:3000/api/v1/reviews'), { params: Promise.resolve({}) });
    expect(pubRevRes.status).toBe(200);
  });
});
