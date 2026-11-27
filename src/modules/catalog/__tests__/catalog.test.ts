import { NextRequest } from 'next/server';
import { GET as listTemplatesHandler } from '@/app/api/v1/configurator/templates/route';
import { GET as listMaterialsHandler } from '@/app/api/v1/configurator/materials/route';
import { POST as calculatePriceHandler } from '@/app/api/v1/configurator/calculate-price/route';
import { CouponService } from '@/modules/pricing/coupon.service';
import { toDecimal } from '@/lib/decimal';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    productTemplate: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    materialSheet: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    edgeBanding: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    hardwareItem: {
      findMany: jest.fn(),
    },
    pricingRule: {
      findFirst: jest.fn(),
    },
    coupon: {
      findUnique: jest.fn(),
    },
    order: {
      count: jest.fn(),
    },
  },
}));

describe('Phase 3: Catalog, Materials, Parametric Pricing & Coupon Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists public templates with dimension bounds and basePriceSar', async () => {
    (prisma.productTemplate.findMany as jest.Mock).mockResolvedValue([
      {
        id: '11111111-1111-4111-8111-111111111111',
        slug: 'luxury-2door-wardrobe',
        nameAr: 'خزانة ملابس',
        nameEn: 'Luxury 2-Door Wardrobe',
        minWidthMm: 800,
        maxWidthMm: 2400,
        minHeightMm: 1800,
        maxHeightMm: 3000,
        minDepthMm: 450,
        maxDepthMm: 750,
        defaultWidthMm: 1200,
        defaultHeightMm: 2400,
        defaultDepthMm: 600,
        parametricRules: {},
        basePriceSar: { toFixed: (d: number) => (1850).toFixed(d) },
        category: { id: 'cat-1', slug: 'wardrobes', nameAr: 'خزائن', nameEn: 'Wardrobes' },
      },
    ]);
    (prisma.productTemplate.count as jest.Mock).mockResolvedValue(1);

    const req = new NextRequest('http://localhost:3000/api/v1/configurator/templates');
    const res = await listTemplatesHandler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.templates).toHaveLength(1);
    expect(body.data.templates[0].basePriceSar).toBe('1850.0000');
  });

  it('returns active grouped materials catalog', async () => {
    (prisma.materialSheet.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'ms-1',
        code: 'EGG-H1180-ST37',
        brand: 'Egger',
        finishCode: 'ST37',
        nameAr: 'ايجر',
        nameEn: 'Egger Halifax Oak',
        thicknessMm: { toFixed: () => '18.00' },
        lengthMm: { toFixed: () => '2440.00' },
        widthMm: { toFixed: () => '1220.00' },
        coreType: 'MFC',
        sellingPricePerSqmSar: { toFixed: () => '125.0000' },
        textureUrl: 'https://satco-assets.sa/egg.jpg',
        roughness: 0.35,
        inStockSheets: 20,
      },
    ]);
    (prisma.edgeBanding.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.hardwareItem.findMany as jest.Mock).mockResolvedValue([]);

    const req = new NextRequest('http://localhost:3000/api/v1/configurator/materials');
    const res = await listMaterialsHandler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.materialSheets[0].code).toBe('EGG-H1180-ST37');
    expect(body.data.materialSheets[0].inStock).toBe(true);
  });

  it('enforces BR-PRICE-003 (REQUIRES_MANUAL_QUOTE) when PricingRule is missing', async () => {
    (prisma.productTemplate.findUnique as jest.Mock).mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      isActive: true,
      minWidthMm: 800,
      maxWidthMm: 2400,
      minHeightMm: 1800,
      maxHeightMm: 3000,
      minDepthMm: 450,
      maxDepthMm: 750,
    });
    (prisma.pricingRule.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.materialSheet.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.edgeBanding.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.hardwareItem.findMany as jest.Mock).mockResolvedValue([]);

    const req = new NextRequest('http://localhost:3000/api/v1/configurator/calculate-price', {
      method: 'POST',
      body: JSON.stringify({
        templateId: '11111111-1111-4111-8111-111111111111',
        widthMm: 1600,
        heightMm: 2400,
        depthMm: 600,
        carcassMaterialCode: 'EGG-H1180',
        shutterMaterialCode: 'EGG-W1000',
        edgeBandingCode: 'REHAU-1MM',
      }),
    });

    const res = await calculatePriceHandler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.code).toBe('REQUIRES_MANUAL_QUOTE');
  });

  it('calculates exact ZATCA 15% VAT and zero-penny milestone sum', async () => {
    (prisma.productTemplate.findUnique as jest.Mock).mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
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
      cuttingPerMeterSar: '4.5000',
      edgeBandingPerMeterSar: '2.0000',
      cncPerHoleSar: '1.2500',
      laborMarkupRate: '0.1800',
      marginRate: '0.2200',
      vatPercentage: '15.0000',
    });
    (prisma.materialSheet.findUnique as jest.Mock).mockResolvedValue({
      sellingPricePerSqmSar: '125.0000',
    });
    (prisma.edgeBanding.findUnique as jest.Mock).mockResolvedValue({
      sellingPricePerMeterSar: '3.5000',
    });
    (prisma.hardwareItem.findMany as jest.Mock).mockResolvedValue([
      { unitType: 'Hinge', sellingPriceSar: '18.0000' },
      { unitType: 'Drawer Runner', sellingPriceSar: '85.0000' },
    ]);

    const req = new NextRequest('http://localhost:3000/api/v1/configurator/calculate-price', {
      method: 'POST',
      body: JSON.stringify({
        templateId: '11111111-1111-4111-8111-111111111111',
        widthMm: 1600,
        heightMm: 2400,
        depthMm: 600,
        carcassMaterialCode: 'EGG-H1180',
        shutterMaterialCode: 'EGG-W1000',
        edgeBandingCode: 'REHAU-1MM',
        shelvesCount: 4,
        drawersCount: 2,
        doorsCount: 2,
      }),
    });

    const res = await calculatePriceHandler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.code).toBe('PRICE_CALCULATED');
    const m1 = toDecimal(body.data.milestones.milestone1Deposit50);
    const m2 = toDecimal(body.data.milestones.milestone2PreDispatch40);
    const m3 = toDecimal(body.data.milestones.milestone3Handover10);
    const grandTotal = toDecimal(body.data.totals.grandTotalSar);
    expect(m1.plus(m2).plus(m3).equals(grandTotal)).toBe(true);
  });

  it('rejects coupon stacking with discretionary discount (BR-PRICE-005)', async () => {
    await expect(
      CouponService.validateAndComputeDiscount({
        code: 'RAMADAN10',
        netSubtotalSar: toDecimal('2000.00'),
        hasDiscretionaryDiscount: true,
      })
    ).rejects.toMatchObject({
      statusCode: 422,
      code: 'COUPON_NOT_STACKABLE_WITH_DISCOUNT',
    });
  });

  it('computes valid percentage coupon discount within budget cap', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue({
      id: 'cp-1',
      code: 'SATCO10',
      discountType: 'PERCENTAGE',
      discountValue: '10.0000',
      minOrderSar: { toFixed: () => '1000.00', toString: () => '1000.0000' },
      maxDiscountSar: '500.0000',
      budgetCapSar: '10000.0000',
      budgetUsedSar: '100.0000',
      maxUsesTotal: 100,
      maxUsesPerCustomer: 1,
      usedCount: 5,
      validFrom: new Date(Date.now() - 86400000),
      validUntil: new Date(Date.now() + 86400000),
      isActive: true,
    });
    (prisma.order.count as jest.Mock).mockResolvedValue(0);

    const res = await CouponService.validateAndComputeDiscount({
      code: 'satco10',
      netSubtotalSar: toDecimal('2000.00'),
      customerId: 'cust-1',
    });

    expect(res.discountSar.toFixed(2)).toBe('200.00');
    expect(res.discountedNetSubtotalSar.toFixed(2)).toBe('1800.00');
  });
});
