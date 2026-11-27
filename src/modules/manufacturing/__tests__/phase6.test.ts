import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signAccessToken } from '@/modules/auth/jwt.service';
import { POST as generateBomHandler } from '@/app/api/v1/manufacturing/orders/[orderId]/generate-bom/route';
import { POST as nestJobHandler } from '@/app/api/v1/manufacturing/jobs/nest/route';
import { GET as pollBridgeHandler } from '@/app/api/v1/cnc-bridge/poll/route';
import { GET as programBridgeHandler } from '@/app/api/v1/cnc-bridge/jobs/[jobId]/program/route';
import { POST as statusBridgeHandler } from '@/app/api/v1/cnc-bridge/jobs/[jobId]/status/route';
import { NestingOptimizerService } from '@/modules/manufacturing/nesting-optimizer.service';

const mockTx = {
  order: { findUnique: jest.fn() },
  bOMRevision: { create: jest.fn() },
  materialSheet: { findUnique: jest.fn() },
  edgeBanding: { findUnique: jest.fn() },
  bOMItem: { create: jest.fn() },
  cuttingJob: { create: jest.fn(), update: jest.fn() },
  cNCMachineJob: { create: jest.fn(), update: jest.fn() },
};

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
    materialSheet: { findUnique: jest.fn() },
    bOMItem: { findMany: jest.fn() },
    cNCMachineJob: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const ORDER_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const SHEET_ID = '11111111-1111-4111-8111-111111111111';
const STAFF_ID = '22222222-2222-4222-8222-222222222222';
const CNC_JOB_ID = '33333333-3333-4333-8333-333333333333';

function factoryManagerToken() {
  return signAccessToken({
    sub: STAFF_ID,
    role: 'FACTORY_MANAGER',
    email: 'factory@satco.sa',
    companyId: 'comp-1',
  }).accessToken;
}

describe('Phase 6: BOM Generator, Guillotine-2D Nesting & Homag CNC Bridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FACTORY_BRIDGE_API_KEY = 'test-bridge-secret';
  });

  it('6.1: generates >= 14 BOM parts with opaque UUID tokens for a 1200x2400x600mm wardrobe', async () => {
    const token = factoryManagerToken();
    mockTx.order.findUnique.mockResolvedValue({
      id: ORDER_ID,
      status: 'PAID_DEPOSIT',
      bomRevisions: [],
      items: [
        {
          id: 'oi-1',
          configuredWidthMm: 1200,
          configuredHeightMm: 2400,
          configuredDepthMm: 600,
          quantity: 1,
          configurationJson: {
            carcass: 'EGG-H1180-ST37',
            shutter: 'EGG-W1000-PM',
            edgeBanding: 'REHAU-OAK-2MM',
            doors: 2,
            drawers: 2,
          },
          template: { slug: 'wardrobe' },
        },
      ],
    });
    mockTx.bOMRevision.create.mockResolvedValue({ id: 'rev-1', version: 1 });
    mockTx.materialSheet.findUnique.mockResolvedValue({ id: SHEET_ID });
    mockTx.edgeBanding.findUnique.mockResolvedValue({ id: 'eb-1' });
    mockTx.bOMItem.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: `bom-${Math.random().toString(36).slice(2, 8)}`,
      partLabel: data.partLabel,
      barcodeOpaqueToken: data.barcodeOpaqueToken,
    }));

    const req = new NextRequest(
      `http://localhost:3000/api/v1/manufacturing/orders/${ORDER_ID}/generate-bom`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      }
    );

    const res = await generateBomHandler(req, {
      params: Promise.resolve({ orderId: ORDER_ID }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.totalPartsCount).toBeGreaterThanOrEqual(14);
    expect(body.data.bomItems[0].barcodeOpaqueToken).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('6.1: enforces BR-SEC-005 by rejecting BOM generation for PENDING_DEPOSIT orders', async () => {
    const token = factoryManagerToken();
    mockTx.order.findUnique.mockResolvedValue({
      id: ORDER_ID,
      status: 'PENDING_DEPOSIT',
      bomRevisions: [],
      items: [],
    });

    const req = new NextRequest(
      `http://localhost:3000/api/v1/manufacturing/orders/${ORDER_ID}/generate-bom`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      }
    );

    const res = await generateBomHandler(req, {
      params: Promise.resolve({ orderId: ORDER_ID }),
    });
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.code).toBe('DEPOSIT_NOT_VERIFIED');
  });

  it('6.2: packs standard sheet panels with waste <= 12% and never rotates grain-locked panels', () => {
    const panels = [
      { id: 'p1', partLabel: 'GABLE_L', barcodeOpaqueToken: 't1', lengthMm: 2320, widthMm: 580, grainLocked: true },
      { id: 'p2', partLabel: 'GABLE_R', barcodeOpaqueToken: 't2', lengthMm: 2320, widthMm: 580, grainLocked: true },
      { id: 'p3', partLabel: 'SHELF_1', barcodeOpaqueToken: 't3', lengthMm: 1160, widthMm: 560, grainLocked: true },
      { id: 'p4', partLabel: 'SHELF_2', barcodeOpaqueToken: 't4', lengthMm: 1160, widthMm: 560, grainLocked: true },
      { id: 'p5', partLabel: 'TOP', barcodeOpaqueToken: 't5', lengthMm: 1160, widthMm: 580, grainLocked: true },
      { id: 'p6', partLabel: 'BOT', barcodeOpaqueToken: 't6', lengthMm: 1160, widthMm: 580, grainLocked: true },
    ];

    const result = NestingOptimizerService.computeGuillotine2D(panels, 2440, 1220, 4.5, 10);

    expect(result.totalSheetsUsed).toBe(2);
    expect(result.wastePercentage).toBeLessThanOrEqual(0.12);
    expect(result.placements.every((p) => p.rotated === false)).toBe(true);
  });

  it('6.2: POST /api/v1/manufacturing/jobs/nest persists CuttingJob and queues CNCMachineJob', async () => {
    const token = factoryManagerToken();
    (prisma.materialSheet.findUnique as jest.Mock).mockResolvedValue({
      id: SHEET_ID,
      code: 'EGG-H1180-ST37',
      lengthMm: 2440,
      widthMm: 1220,
    });
    (prisma.bOMItem.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'bom-1',
        partLabel: 'GABLE_LEFT_1',
        barcodeOpaqueToken: 'tok-1',
        materialSheetId: SHEET_ID,
        cutLengthMm: '2320.00',
        cutWidthMm: '580.00',
        grainDirection: 'LENGTHWISE',
        quantity: 1,
      },
    ]);
    mockTx.cuttingJob.create.mockResolvedValue({
      id: 'cut-991823',
      status: 'NESTED',
    });
    mockTx.cNCMachineJob.create.mockResolvedValue({
      id: CNC_JOB_ID,
    });

    const req = new NextRequest('http://localhost:3000/api/v1/manufacturing/jobs/nest', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        orderId: ORDER_ID,
        sheetMaterialId: SHEET_ID,
        bladeKerfMm: 4.5,
        trimMarginMm: 10,
      }),
    });

    const res = await nestJobHandler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.cuttingJobId).toBe('cut-991823');
    expect(body.data.cncJobId).toBe(CNC_JOB_ID);
    expect(body.data.status).toBe('NESTED');
  });

  it('6.3: CNC Bridge enforces X-Bridge-Key, polls queued jobs, streams .mpr binary, and updates status', async () => {
    const unauthReq = new NextRequest('http://localhost:3000/api/v1/cnc-bridge/poll');
    const unauthRes = await pollBridgeHandler(unauthReq, { params: Promise.resolve({}) });
    expect(unauthRes.status).toBe(401);

    (prisma.cNCMachineJob.findMany as jest.Mock).mockResolvedValue([
      {
        id: CNC_JOB_ID,
        cuttingJobId: 'cut-991823',
        machineModel: 'Homag Centateq / Sawteq',
        programNumber: 'SATCO_PRG_01',
      },
    ]);
    (prisma.cNCMachineJob.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const pollReq = new NextRequest('http://localhost:3000/api/v1/cnc-bridge/poll', {
      headers: { 'x-bridge-key': 'test-bridge-secret' },
    });
    const pollRes = await pollBridgeHandler(pollReq, { params: Promise.resolve({}) });
    const pollBody = await pollRes.json();

    expect(pollRes.status).toBe(200);
    expect(pollBody.data.pendingJobs).toHaveLength(1);

    (prisma.cNCMachineJob.findUnique as jest.Mock).mockResolvedValue({
      id: CNC_JOB_ID,
      cuttingJobId: 'cut-991823',
      programNumber: 'SATCO_PRG_01',
      status: 'QUEUED',
      mprWoodwopCode: '[H\nVERSION="4.0 Alpha"\n!',
    });

    const progReq = new NextRequest(
      `http://localhost:3000/api/v1/cnc-bridge/jobs/${CNC_JOB_ID}/program`,
      { headers: { 'x-bridge-key': 'test-bridge-secret' } }
    );
    const progRes = await programBridgeHandler(progReq, {
      params: Promise.resolve({ jobId: CNC_JOB_ID }),
    });
    expect(progRes.status).toBe(200);
    expect(progRes.headers.get('content-type')).toBe('application/octet-stream');
    expect(progRes.headers.get('content-disposition')).toContain('SATCO_PRG_01.mpr');

    const statusReq = new NextRequest(
      `http://localhost:3000/api/v1/cnc-bridge/jobs/${CNC_JOB_ID}/status`,
      {
        method: 'POST',
        headers: {
          'x-bridge-key': 'test-bridge-secret',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          executionDurationSeconds: 314,
          cycleCount: 1,
          errorLog: null,
        }),
      }
    );
    const statusRes = await statusBridgeHandler(statusReq, {
      params: Promise.resolve({ jobId: CNC_JOB_ID }),
    });
    const statusBody = await statusRes.json();

    expect(statusRes.status).toBe(200);
    expect(statusBody.code).toBe('STATUS_ACKNOWLEDGED');
    expect(mockTx.cuttingJob.update).toHaveBeenCalledWith({
      where: { id: 'cut-991823' },
      data: { status: 'COMPLETED' },
    });
  });
});
