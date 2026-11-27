import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signAccessToken } from '@/modules/auth/jwt.service';
import { decodeZatcaTlvQr } from '@/modules/invoicing/zatca.service';
import { POST as issueInvoiceHandler } from '@/app/api/v1/invoices/[id]/issue/route';
import { GET as downloadPdfHandler } from '@/app/api/v1/invoices/[id]/pdf/route';
import { GET as assignedJobsHandler } from '@/app/api/v1/installations/assigned/route';
import { POST as completeJobHandler } from '@/app/api/v1/installations/[jobId]/complete/route';
import { GET as agingReportHandler } from '@/app/api/v1/admin/due-manager/aging/route';
import {
  GET as listBlacklistHandler,
  POST as addBlacklistHandler,
} from '@/app/api/v1/admin/fraud/blacklist/route';

const mockTx = {
  installationJob: { findUnique: jest.fn(), update: jest.fn() },
  handoverSignature: { create: jest.fn() },
  order: { findUnique: jest.fn(), update: jest.fn() },
  orderTimeline: { create: jest.fn() },
};

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
    order: { findUnique: jest.fn() },
    company: { findFirst: jest.fn() },
    invoice: { findFirst: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    installationJob: { findMany: jest.fn() },
    milestonePayment: { findMany: jest.fn() },
    blacklistEntry: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    user: { findUnique: jest.fn() },
  },
}));

const ORDER_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const INVOICE_ID = '11111111-1111-4111-8111-111111111111';
const ADMIN_ID = '22222222-2222-4222-8222-222222222222';
const INSTALLER_ID = '33333333-3333-4333-8333-333333333333';
const JOB_ID = '44444444-4444-4444-8444-444444444444';

function staffToken(role: 'SUPER_ADMIN' | 'INSTALLER_TECHNICIAN', sub = ADMIN_ID) {
  return signAccessToken({
    sub,
    role,
    email: 'staff@satco.sa',
    companyId: 'comp-1',
  }).accessToken;
}

describe('Phase 7: ZATCA e-Invoicing, Installation PWA, Due Manager & Fraud Shield', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('7.1: issues ZATCA Phase 2 invoice with 8-tag TLV QR & streams valid PDF', async () => {
    const token = staffToken('SUPER_ADMIN');
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({
      id: ORDER_ID,
      orderNumber: 'ORD-2026-00452',
      netSubtotalSar: '4168.6900',
      discountSar: '0.0000',
      vatAmountSar: '625.3000',
      grandTotalSar: '4793.9900',
    });
    (prisma.company.findFirst as jest.Mock).mockResolvedValue({
      id: 'comp-1',
      legalNameEn: 'SATCO Co Ltd',
      legalNameAr: 'شركة ساتكو',
      vatRegistrationNumber: '310294857200003',
    });
    (prisma.invoice.findFirst as jest.Mock).mockResolvedValue({
      zatcaInvoiceHash: 'prevHash123==',
    });
    (prisma.invoice.create as jest.Mock).mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: INVOICE_ID,
      ...data,
    }));

    const issueReq = new NextRequest(`http://localhost:3000/api/v1/invoices/${ORDER_ID}/issue`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });
    const issueRes = await issueInvoiceHandler(issueReq, {
      params: Promise.resolve({ id: ORDER_ID }),
    });
    const issueBody = await issueRes.json();

    expect(issueRes.status).toBe(201);
    expect(issueBody.data.status).toBe('CLEARED_BY_ZATCA');
    expect(issueBody.data.zatcaPreviousHash).toBe('prevHash123==');

    const decodedTags = decodeZatcaTlvQr(issueBody.data.zatcaTlvQrBase64);
    expect(decodedTags[1]).toBe('SATCO Co Ltd');
    expect(decodedTags[2]).toBe('310294857200003');
    expect(decodedTags[4]).toBe('4793.99');
    expect(decodedTags[5]).toBe('625.30');
    expect(decodedTags[6]).toBe(issueBody.data.zatcaInvoiceHash);
    expect(decodedTags[7]).toBeTruthy();
    expect(decodedTags[8]).toBeTruthy();

    // PDF download
    (prisma.invoice.findUnique as jest.Mock).mockResolvedValue({
      id: INVOICE_ID,
      invoiceNumber: 'INV-2026-00452',
      status: 'CLEARED_BY_ZATCA',
      issueDate: new Date('2026-11-26T09:05:00Z'),
      subtotalSar: '4168.6900',
      vatAmountSar: '625.3000',
      totalWithVatSar: '4793.9900',
      zatcaUuid: 'uuid-1',
      zatcaTlvQrBase64: issueBody.data.zatcaTlvQrBase64,
      company: {
        legalNameEn: 'SATCO Co Ltd',
        legalNameAr: 'شركة ساتكو',
        vatRegistrationNumber: '310294857200003',
      },
      order: {
        customerId: 'cust-1',
        orderNumber: 'ORD-2026-00452',
      },
    });

    const pdfReq = new NextRequest(`http://localhost:3000/api/v1/invoices/${INVOICE_ID}/pdf`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const pdfRes = await downloadPdfHandler(pdfReq, {
      params: Promise.resolve({ id: INVOICE_ID }),
    });
    expect(pdfRes.status).toBe(200);
    expect(pdfRes.headers.get('content-type')).toBe('application/pdf');
    const pdfText = Buffer.from(await pdfRes.arrayBuffer()).toString('utf8');
    expect(pdfText.startsWith('%PDF-1.4')).toBe(true);
  });

  it('7.2: lists assigned installer jobs and completes handover with e-signature & GPS (BR-INS-001)', async () => {
    const token = staffToken('INSTALLER_TECHNICIAN', INSTALLER_ID);
    (prisma.installationJob.findMany as jest.Mock).mockResolvedValue([
      {
        id: JOB_ID,
        orderId: ORDER_ID,
        scheduledDate: new Date('2026-11-28T09:00:00Z'),
        timeSlot: '09:00 - 13:00',
        status: 'SCHEDULED',
        order: {
          orderNumber: 'ORD-2026-00452',
          customer: { fullName: 'Faisal Al-Otaibi', phone: '+966501234567' },
          address: { district: 'Al Olaya', city: 'Riyadh', buildingNumber: '3244' },
        },
      },
    ]);

    const listReq = new NextRequest('http://localhost:3000/api/v1/installations/assigned', {
      headers: { authorization: `Bearer ${token}` },
    });
    const listRes = await assignedJobsHandler(listReq, { params: Promise.resolve({}) });
    const listBody = await listRes.json();
    expect(listRes.status).toBe(200);
    expect(listBody.data.jobs).toHaveLength(1);

    mockTx.installationJob.findUnique.mockResolvedValue({
      id: JOB_ID,
      orderId: ORDER_ID,
      installerId: INSTALLER_ID,
      status: 'IN_PROGRESS',
      order: {
        id: ORDER_ID,
        status: 'INSTALLATION_IN_PROGRESS',
        warrantyYears: 2,
        customer: { fullName: 'Faisal Al-Otaibi', phone: '+966501234567' },
        milestoneSchedules: [
          { milestone: 'MILESTONE_3_HANDOVER', amountSar: '479.3900' },
        ],
      },
    });
    mockTx.order.findUnique.mockResolvedValue({
      id: ORDER_ID,
      status: 'INSTALLATION_IN_PROGRESS',
    });

    const completeReq = new NextRequest(
      `http://localhost:3000/api/v1/installations/${JOB_ID}/complete`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          customerSignDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA',
          completionPhotos: ['https://satco-assets.sa/photo1.jpg'],
          latitude: 24.7136,
          longitude: 46.6753,
          technicianNotes: 'Leveled and calibrated.',
        }),
      }
    );

    const completeRes = await completeJobHandler(completeReq, {
      params: Promise.resolve({ jobId: JOB_ID }),
    });
    const completeBody = await completeRes.json();

    expect(completeRes.status).toBe(200);
    expect(completeBody.code).toBe('HANDOVER_COMPLETED');
    expect(completeBody.data.finalHandoverDueSar).toBe('479.39');
    expect(mockTx.handoverSignature.create).toHaveBeenCalled();
  });

  it('7.3: computes 30/60/90+ day accounts receivable aging report', async () => {
    const token = staffToken('SUPER_ADMIN');
    const now = Date.now();
    const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000);

    (prisma.milestonePayment.findMany as jest.Mock).mockResolvedValue([
      { amountSar: '1000.0000', dueDate: daysAgo(10) },
      { amountSar: '2500.0000', dueDate: daysAgo(45) },
      { amountSar: '4000.0000', dueDate: daysAgo(75) },
      { amountSar: '6000.0000', dueDate: daysAgo(110) },
    ]);

    const req = new NextRequest('http://localhost:3000/api/v1/admin/due-manager/aging', {
      headers: { authorization: `Bearer ${token}` },
    });
    const res = await agingReportHandler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.totalOverdueSar).toBe('13500.00');
    expect(body.data.buckets.currentUnder30Days.totalDueSar).toBe('1000.00');
    expect(body.data.buckets.aging31To60Days.totalDueSar).toBe('2500.00');
    expect(body.data.buckets.aging61To90Days.totalDueSar).toBe('4000.00');
    expect(body.data.buckets.agingOver90Days.totalDueSar).toBe('6000.00');
  });

  it('7.4: manages fraud blacklist with Saudi phone normalization', async () => {
    const token = staffToken('SUPER_ADMIN');
    (prisma.blacklistEntry.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.blacklistEntry.create as jest.Mock).mockResolvedValue({
      id: 'bl-1',
      phone: '+966555999888',
      reason: 'REPEATED_FAKE_ORDERS',
    });

    const postReq = new NextRequest('http://localhost:3000/api/v1/admin/fraud/blacklist', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        phone: '0555999888',
        reason: 'REPEATED_FAKE_ORDERS',
        notes: 'Fake COD orders',
      }),
    });

    const postRes = await addBlacklistHandler(postReq, { params: Promise.resolve({}) });
    const postBody = await postRes.json();

    expect(postRes.status).toBe(201);
    expect(postBody.code).toBe('BLACKLIST_ADDED');
    expect(postBody.data.entry.phone).toBe('+966555999888');

    (prisma.blacklistEntry.findMany as jest.Mock).mockResolvedValue([
      { id: 'bl-1', phone: '+966555999888', reason: 'REPEATED_FAKE_ORDERS' },
    ]);

    const getReq = new NextRequest('http://localhost:3000/api/v1/admin/fraud/blacklist', {
      headers: { authorization: `Bearer ${token}` },
    });
    const getRes = await listBlacklistHandler(getReq, { params: Promise.resolve({}) });
    const getBody = await getRes.json();
    expect(getRes.status).toBe(200);
    expect(getBody.data.entries).toHaveLength(1);
  });
});
