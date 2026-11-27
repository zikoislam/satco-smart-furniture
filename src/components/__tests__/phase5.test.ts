import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signAccessToken } from '@/modules/auth/jwt.service';
import { GET as listOrdersHandler } from '@/app/api/v1/orders/route';
import { GET as getOrderDetailHandler } from '@/app/api/v1/orders/[orderId]/route';
import { computeAutoShelvesCount } from '@/components/3d/wardrobe-math';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const CUSTOMER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OTHER_USER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ORDER_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

describe('Phase 5: 3D Configurator Formula & Customer Dashboard Orders API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('5.1: computeAutoShelvesCount matches Math.floor(heightMm / 400) - 1', () => {
    expect(computeAutoShelvesCount(2400)).toBe(5);
    expect(computeAutoShelvesCount(2000)).toBe(4);
    expect(computeAutoShelvesCount(1800)).toBe(3);
    expect(computeAutoShelvesCount(1200)).toBe(2);
    expect(computeAutoShelvesCount(400)).toBe(0);
  });

  it('5.3: lists authenticated customer orders and enforces RBAC 401/403', async () => {
    const unauthReq = new NextRequest('http://localhost:3000/api/v1/orders');
    const unauthRes = await listOrdersHandler(unauthReq, { params: Promise.resolve({}) });
    expect(unauthRes.status).toBe(401);

    const token = signAccessToken({
      sub: CUSTOMER_ID,
      role: 'CUSTOMER',
      phone: '+966501234567',
      email: null,
      companyId: null,
    }).accessToken;

    (prisma.order.findMany as jest.Mock).mockResolvedValue([
      {
        id: ORDER_ID,
        orderNumber: 'ORD-2026-001',
        status: 'PAID_DEPOSIT',
        warrantyYears: 2,
        warrantyExpiresAt: null,
        grandTotalSar: '4793.9900',
        paidAmountSar: '2397.0000',
        dueAmountSar: '2396.9900',
        createdAt: new Date('2026-11-26T10:00:00Z'),
        items: [{ quantity: 1 }],
        milestoneSchedules: [],
        invoices: [],
      },
    ]);

    const listReq = new NextRequest('http://localhost:3000/api/v1/orders', {
      headers: { authorization: `Bearer ${token}` },
    });
    const listRes = await listOrdersHandler(listReq, { params: Promise.resolve({}) });
    const listBody = await listRes.json();

    expect(listRes.status).toBe(200);
    expect(listBody.data.orders).toHaveLength(1);
    expect(listBody.data.orders[0].orderNumber).toBe('ORD-2026-001');

    // Detail endpoint rejects access to another customer's order with 403
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({
      id: ORDER_ID,
      customerId: OTHER_USER_ID,
      items: [],
      timeline: [],
      milestoneSchedules: [],
      invoices: [],
    });

    const detailReq = new NextRequest(`http://localhost:3000/api/v1/orders/${ORDER_ID}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const detailRes = await getOrderDetailHandler(detailReq, {
      params: Promise.resolve({ orderId: ORDER_ID }),
    });
    expect(detailRes.status).toBe(403);
  });
});
