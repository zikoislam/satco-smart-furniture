import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signAccessToken } from '@/modules/auth/jwt.service';
import {
  GET as listAddressesHandler,
  POST as createAddressHandler,
} from '@/app/api/v1/addresses/route';
import { DELETE as deleteAddressHandler } from '@/app/api/v1/addresses/[addressId]/route';
import { POST as createEnquiryHandler } from '@/app/api/v1/enquiries/route';
import { POST as createQuotationHandler } from '@/app/api/v1/quotations/route';
import { POST as acceptQuotationHandler } from '@/app/api/v1/quotations/[quotationId]/accept/route';
import { POST as stockMovementHandler } from '@/app/api/v1/inventory/stock/route';
import { POST as reserveMaterialHandler } from '@/app/api/v1/inventory/reserve/route';
import { POST as createProdJobHandler } from '@/app/api/v1/production/jobs/route';
import { PATCH as advanceStageHandler } from '@/app/api/v1/production/jobs/[jobId]/stage/route';
import { POST as submitClaimHandler } from '@/app/api/v1/warranty-claims/route';
import { PATCH as resolveClaimHandler } from '@/app/api/v1/admin/warranty-claims/[claimId]/resolve/route';

const mockTx = {
  address: { updateMany: jest.fn(), create: jest.fn() },
  quotation: { create: jest.fn() },
  quotationItem: { create: jest.fn() },
  enquiry: { update: jest.fn() },
  company: { findFirst: jest.fn() },
  stockBalance: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  stockMovement: { create: jest.fn() },
  materialReservation: { create: jest.fn() },
  productionJob: { findUnique: jest.fn(), update: jest.fn() },
  productionStageLog: { create: jest.fn() },
};

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
    address: { findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
    enquiry: { create: jest.fn() },
    company: { findFirst: jest.fn() },
    pricingRule: { findFirst: jest.fn() },
    quotation: { findUnique: jest.fn(), update: jest.fn() },
    order: { findUnique: jest.fn() },
    productionJob: { create: jest.fn() },
    warrantyClaim: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  },
}));

const CUSTOMER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ESTIMATOR_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const MANAGER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const TEMPLATE_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const SHEET_ID = '11111111-1111-4111-8111-111111111111';
const ORDER_ID = '22222222-2222-4222-8222-222222222222';
const JOB_ID = '33333333-3333-4333-8333-333333333333';
const QUOTE_ID = '44444444-4444-4444-8444-444444444444';
const CLAIM_ID = '55555555-5555-4555-8555-555555555555';
const ADDRESS_ID = '66666666-6666-4666-8666-666666666666';

describe('Extended Enterprise Backend Modules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Addresses: lists, creates Saudi National Address, and deletes owned address', async () => {
    const token = signAccessToken({ sub: CUSTOMER_ID, role: 'CUSTOMER' }).accessToken;
    mockTx.address.create.mockResolvedValue({ id: ADDRESS_ID, city: 'Jeddah' });

    const postRes = await createAddressHandler(
      new NextRequest('http://localhost:3000/api/v1/addresses', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Villa',
          buildingNumber: '3244',
          streetName: 'King Fahd Road',
          district: 'Al Olaya',
          city: 'Jeddah',
          postalCode: '12211',
          isDefault: true,
        }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(postRes.status).toBe(201);

    (prisma.address.findMany as jest.Mock).mockResolvedValue([{ id: ADDRESS_ID, city: 'Jeddah' }]);
    const listRes = await listAddressesHandler(
      new NextRequest('http://localhost:3000/api/v1/addresses', {
        headers: { authorization: `Bearer ${token}` },
      }),
      { params: Promise.resolve({}) }
    );
    expect(listRes.status).toBe(200);

    (prisma.address.findUnique as jest.Mock).mockResolvedValue({ id: ADDRESS_ID, userId: CUSTOMER_ID });
    const delRes = await deleteAddressHandler(
      new NextRequest(`http://localhost:3000/api/v1/addresses/${ADDRESS_ID}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      }),
      { params: Promise.resolve({ addressId: ADDRESS_ID }) }
    );
    expect(delRes.status).toBe(200);
  });

  it('Enquiries & Quotations: enforces BR-PRICE-004 discount ceiling and customer acceptance', async () => {
    const estimatorJwt = signAccessToken({ sub: ESTIMATOR_ID, role: 'ESTIMATOR' }).accessToken;
    const customerJwt = signAccessToken({ sub: CUSTOMER_ID, role: 'CUSTOMER' }).accessToken;

    (prisma.enquiry.create as jest.Mock).mockResolvedValue({ id: 'enq-1', status: 'NEW' });
    const enqRes = await createEnquiryHandler(
      new NextRequest('http://localhost:3000/api/v1/enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contactPhone: '0501234567',
          contactName: 'Faisal',
          configSnapshotJson: { widthMm: 1600 },
        }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(enqRes.status).toBe(201);

    // Estimator requesting 10% discount (> 5% cap) -> 403 DISCOUNT_AUTHORITY_EXCEEDED
    const deniedRes = await createQuotationHandler(
      new NextRequest('http://localhost:3000/api/v1/quotations', {
        method: 'POST',
        headers: { authorization: `Bearer ${estimatorJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          customerId: CUSTOMER_ID,
          discountPercent: 10,
          items: [
            {
              templateId: TEMPLATE_ID,
              configuredWidthMm: 1600,
              configuredHeightMm: 2400,
              configuredDepthMm: 600,
              configurationJson: {},
              quantity: 1,
              unitPriceSar: '3000.00',
            },
          ],
        }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(deniedRes.status).toBe(403);

    (prisma.company.findFirst as jest.Mock).mockResolvedValue({ id: 'comp-1' });
    (prisma.pricingRule.findFirst as jest.Mock).mockResolvedValue({ id: 'rule-1', vatPercentage: '15.0000' });
    mockTx.quotation.create.mockResolvedValue({ id: QUOTE_ID, quoteNumber: 'QT-2026-1', status: 'ISSUED' });

    const okRes = await createQuotationHandler(
      new NextRequest('http://localhost:3000/api/v1/quotations', {
        method: 'POST',
        headers: { authorization: `Bearer ${estimatorJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          customerId: CUSTOMER_ID,
          discountPercent: 5,
          items: [
            {
              templateId: TEMPLATE_ID,
              configuredWidthMm: 1600,
              configuredHeightMm: 2400,
              configuredDepthMm: 600,
              configurationJson: {},
              quantity: 1,
              unitPriceSar: '3000.00',
            },
          ],
        }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(okRes.status).toBe(201);

    (prisma.quotation.findUnique as jest.Mock).mockResolvedValue({ id: QUOTE_ID, customerId: CUSTOMER_ID, status: 'ISSUED' });
    (prisma.quotation.update as jest.Mock).mockResolvedValue({ id: QUOTE_ID, status: 'CUSTOMER_ACCEPTED' });
    const acceptRes = await acceptQuotationHandler(
      new NextRequest(`http://localhost:3000/api/v1/quotations/${QUOTE_ID}/accept`, {
        method: 'POST',
        headers: { authorization: `Bearer ${customerJwt}` },
      }),
      { params: Promise.resolve({ quotationId: QUOTE_ID }) }
    );
    expect(acceptRes.status).toBe(200);
  });

  it('Inventory, Production & Warranty: records stock, reserves sheets, advances stage, and resolves warranty claim', async () => {
    const managerJwt = signAccessToken({ sub: MANAGER_ID, role: 'FACTORY_MANAGER' }).accessToken;
    const customerJwt = signAccessToken({ sub: CUSTOMER_ID, role: 'CUSTOMER' }).accessToken;

    mockTx.company.findFirst.mockResolvedValue({ id: 'comp-1' });
    mockTx.stockBalance.findUnique.mockResolvedValue({ id: 'sb-1', availableQty: 20, reservedQty: 0 });
    mockTx.stockBalance.update.mockResolvedValue({ id: 'sb-1', availableQty: 30, reservedQty: 0 });
    mockTx.stockMovement.create.mockResolvedValue({ id: 'sm-1' });

    const stockRes = await stockMovementHandler(
      new NextRequest('http://localhost:3000/api/v1/inventory/stock', {
        method: 'POST',
        headers: { authorization: `Bearer ${managerJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          materialSheetId: SHEET_ID,
          movementType: 'RECEIPT',
          quantityDelta: 10,
          referenceId: 'PO-2026-01',
        }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(stockRes.status).toBe(201);

    mockTx.materialReservation.create.mockResolvedValue({ id: 'res-1', reservedQty: 4 });
    const reserveRes = await reserveMaterialHandler(
      new NextRequest('http://localhost:3000/api/v1/inventory/reserve', {
        method: 'POST',
        headers: { authorization: `Bearer ${managerJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          productionJobId: JOB_ID,
          materialSheetId: SHEET_ID,
          quantity: 4,
        }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(reserveRes.status).toBe(201);

    (prisma.order.findUnique as jest.Mock).mockResolvedValue({ id: ORDER_ID, status: 'PAID_DEPOSIT' });
    (prisma.productionJob.create as jest.Mock).mockResolvedValue({ id: JOB_ID, jobNumber: 'PRD-2026-1', currentStage: 'CUTTING' });
    const createJobRes = await createProdJobHandler(
      new NextRequest('http://localhost:3000/api/v1/production/jobs', {
        method: 'POST',
        headers: { authorization: `Bearer ${managerJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({ orderId: ORDER_ID }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(createJobRes.status).toBe(201);

    mockTx.productionJob.findUnique.mockResolvedValue({ id: JOB_ID, currentStage: 'CUTTING', startedAt: null });
    mockTx.productionJob.update.mockResolvedValue({ id: JOB_ID, currentStage: 'EDGE_BANDING', status: 'IN_PROGRESS' });
    const stageRes = await advanceStageHandler(
      new NextRequest(`http://localhost:3000/api/v1/production/jobs/${JOB_ID}/stage`, {
        method: 'PATCH',
        headers: { authorization: `Bearer ${managerJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({ toStage: 'EDGE_BANDING', notes: 'Rehau 2mm applied' }),
      }),
      { params: Promise.resolve({ jobId: JOB_ID }) }
    );
    expect(stageRes.status).toBe(200);

    (prisma.order.findUnique as jest.Mock).mockResolvedValue({
      id: ORDER_ID,
      customerId: CUSTOMER_ID,
      status: 'HANDOVER_COMPLETED',
      warrantyExpiresAt: new Date(Date.now() + 86400000),
    });
    (prisma.warrantyClaim.create as jest.Mock).mockResolvedValue({ id: CLAIM_ID, status: 'OPEN' });
    const claimRes = await submitClaimHandler(
      new NextRequest('http://localhost:3000/api/v1/warranty-claims', {
        method: 'POST',
        headers: { authorization: `Bearer ${customerJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          orderId: ORDER_ID,
          defectDescription: 'Soft-close hinge misalignment on right door.',
        }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(claimRes.status).toBe(201);

    (prisma.warrantyClaim.findUnique as jest.Mock).mockResolvedValue({ id: CLAIM_ID, status: 'OPEN' });
    (prisma.warrantyClaim.update as jest.Mock).mockResolvedValue({ id: CLAIM_ID, status: 'APPROVED_REMAKE' });
    const resolveRes = await resolveClaimHandler(
      new NextRequest(`http://localhost:3000/api/v1/admin/warranty-claims/${CLAIM_ID}/resolve`, {
        method: 'PATCH',
        headers: { authorization: `Bearer ${managerJwt}`, 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED_REMAKE' }),
      }),
      { params: Promise.resolve({ claimId: CLAIM_ID }) }
    );
    expect(resolveRes.status).toBe(200);
  });
});
