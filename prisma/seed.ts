import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SATCO Saudi Furniture Platform Database Seeding...');

  // 1. Company
  const company = await prisma.company.upsert({
    where: { crNumber: '1010884920' },
    update: {},
    create: {
      legalNameAr: 'شركة ساتكو للصناعات الخشبية الذكية المحدودة',
      legalNameEn: 'SATCO Smart Wood Industries LLC',
      crNumber: '1010884920',
      vatRegistrationNumber: '310294857200003',
      headquartersAddress: 'Al-Kharj Industrial City, Phase 2, Jeddah, KSA',
      phone: '+966114928000',
      email: 'operations@satco.sa',
    },
  });
  console.log('✅ Company created/updated:', company.legalNameEn);

  // 2. Super Admin User
  const adminUser = await prisma.user.upsert({
    where: { phone: '+966500000001' },
    update: {},
    create: {
      companyId: company.id,
      phone: '+966500000001',
      email: 'admin@satco.sa',
      fullName: 'Tariq Al-Otaibi',
      role: UserRole.SUPER_ADMIN,
      preferredLocale: 'ar',
      isActive: true,
    },
  });

  // 3. In-House Field Installer / Technician
  const installerUser = await prisma.user.upsert({
    where: { phone: '+966555123456' },
    update: {},
    create: {
      companyId: company.id,
      phone: '+966555123456',
      email: 'installer.riyadh1@satco.sa',
      fullName: 'Sultan Mansoor',
      role: UserRole.INSTALLER_TECHNICIAN,
      preferredLocale: 'ar',
      isActive: true,
    },
  });
  console.log('✅ Users seeded: Super Admin & Installer Technician');

  // 4. Categories
  const catWardrobes = await prisma.category.upsert({
    where: { slug: 'custom-wardrobes' },
    update: {},
    create: {
      slug: 'custom-wardrobes',
      nameAr: 'خزائن ملابس مخصصة',
      nameEn: 'Custom Built-in Wardrobes',
      description: 'Floor-to-ceiling modern luxury wardrobes built with German joinery standards.',
      sortOrder: 1,
    },
  });

  const catKitchens = await prisma.category.upsert({
    where: { slug: 'modular-kitchens' },
    update: {},
    create: {
      slug: 'modular-kitchens',
      nameAr: 'مطابخ حديثة',
      nameEn: 'Modern Modular Kitchens',
      description: 'Water-resistant, moisture-tested high pressure laminate kitchen cabinets.',
      sortOrder: 2,
    },
  });
  console.log('✅ Categories seeded: Wardrobes & Kitchens');

  // 5. Material Sheets (Egger / Kronospan)
  const matOak = await prisma.materialSheet.upsert({
    where: { code: 'EGG-H1180-ST37' },
    update: {},
    create: {
      code: 'EGG-H1180-ST37',
      brand: 'Egger',
      finishCode: 'H1180 ST37 Natural Halifax Oak',
      nameAr: 'خشب إيجر هاليفاكس أوك طبيعي 18 ملم',
      nameEn: 'Egger Natural Halifax Oak 18mm MFC',
      thicknessMm: 18.00,
      lengthMm: 2440.00,
      widthMm: 1220.00,
      coreType: 'MDF / Chipboard CARB2 Moisture Resistant',
      costPerSheetSar: 165.0000,
      sellingPricePerSqmSar: 125.0000,
      inStockSheets: 450,
      roughness: 0.35,
    },
  });

  const matGlossWhite = await prisma.materialSheet.upsert({
    where: { code: 'EGG-W1000-PM' },
    update: {},
    create: {
      code: 'EGG-W1000-PM',
      brand: 'Egger',
      finishCode: 'W1000 PM Premium White Matt',
      nameAr: 'خشب إيجر أبيض ناصع مات بريميوم 18 ملم',
      nameEn: 'Egger Premium White Matt 18mm Lacquered',
      thicknessMm: 18.00,
      lengthMm: 2440.00,
      widthMm: 1220.00,
      coreType: 'E1 MDF',
      costPerSheetSar: 195.0000,
      sellingPricePerSqmSar: 145.0000,
      inStockSheets: 320,
      roughness: 0.15,
    },
  });

  const matBacking = await prisma.materialSheet.upsert({
    where: { code: 'EGG-W980-08MM' },
    update: {},
    create: {
      code: 'EGG-W980-08MM',
      brand: 'Egger',
      finishCode: 'W980 White Backing Panel',
      nameAr: 'لوح ظهر أبيض 8 ملم',
      nameEn: 'Egger White Backing Panel 8mm',
      thicknessMm: 8.00,
      lengthMm: 2440.00,
      widthMm: 1220.00,
      coreType: 'HDF High Density Backing',
      costPerSheetSar: 75.0000,
      sellingPricePerSqmSar: 55.0000,
      inStockSheets: 600,
      roughness: 0.20,
    },
  });
  console.log('✅ Material Sheets seeded: Egger Oak, White Matt & Backing');

  // 6. Hardware Items (Blum / Hafele)
  const hwHinge = await prisma.hardwareItem.upsert({
    where: { sku: 'BLUM-CLIP-110-SOFT' },
    update: {},
    create: {
      sku: 'BLUM-CLIP-110-SOFT',
      brand: 'Blum',
      nameAr: 'مفصلة بلوم كليب توب 110 درجة هيدروليك إغلاق ناعم',
      nameEn: 'Blum CLIP top BLUMOTION 110 Degree Soft-Close Hinge',
      unitType: 'PIECE',
      costPriceSar: 14.5000,
      sellingPriceSar: 26.0000,
      inStockQty: 2500,
    },
  });

  const hwRunner = await prisma.hardwareItem.upsert({
    where: { sku: 'BLUM-MOVENTO-500' },
    update: {},
    create: {
      sku: 'BLUM-MOVENTO-500',
      brand: 'Blum',
      nameAr: 'سكة درج بلوم موفينتو 500 ملم مخفية إغلاق ناعم',
      nameEn: 'Blum MOVENTO 500mm Concealed Soft-Close Drawer Runner',
      unitType: 'PAIR',
      costPriceSar: 78.0000,
      sellingPriceSar: 135.0000,
      inStockQty: 800,
    },
  });
  console.log('✅ Hardware seeded: Blum Hinges & Concealed Runners');

  // 7. Edge Banding
  const edgeOak = await prisma.edgeBanding.upsert({
    where: { code: 'REHAU-H1180-22X1' },
    update: {},
    create: {
      code: 'REHAU-H1180-22X1',
      materialType: 'ABS',
      thicknessMm: 1.00,
      widthMm: 22.00,
      finishCodeMatch: 'H1180 ST37 Natural Halifax Oak',
      costPerMeterSar: 1.2000,
      sellingPricePerMeterSar: 3.5000,
      inStockMeters: 5000.00,
    },
  });

  const edgeWhite = await prisma.edgeBanding.upsert({
    where: { code: 'REHAU-W1000-22X1' },
    update: {},
    create: {
      code: 'REHAU-W1000-22X1',
      materialType: 'ABS',
      thicknessMm: 1.00,
      widthMm: 22.00,
      finishCodeMatch: 'W1000 PM Premium White Matt',
      costPerMeterSar: 0.9500,
      sellingPricePerMeterSar: 2.8000,
      inStockMeters: 7500.00,
    },
  });
  console.log('✅ Edge Banding seeded: Rehau ABS 1mm');

  // 8. Product Template: Luxury 2-Door Parametric Wardrobe
  const templateWardrobe = await prisma.productTemplate.upsert({
    where: { slug: 'luxury-2door-wardrobe' },
    update: {},
    create: {
      categoryId: catWardrobes.id,
      slug: 'luxury-2door-wardrobe',
      nameAr: 'خزانة ملابس مودرن درفتين مخصصة',
      nameEn: 'Luxury 2-Door Custom Modular Wardrobe',
      minWidthMm: 800,
      maxWidthMm: 2400,
      minHeightMm: 1800,
      maxHeightMm: 3000,
      minDepthMm: 450,
      maxDepthMm: 750,
      defaultWidthMm: 1200,
      defaultHeightMm: 2400,
      defaultDepthMm: 600,
      basePriceSar: 1850.0000,
      parametricRules: {
        shelvesCalculation: "Math.floor(heightMm / 400) - 1",
        hingesPerDoor: "heightMm > 2200 ? 5 : (heightMm > 1600 ? 4 : 3)",
        recommendedHangingRodWidth: "widthMm - 36",
        backPanelGrooveDepthMm: 8,
      },
      isActive: true,
    },
  });

  // Map Blum Hinge to Template
  await prisma.templateHardwareMap.upsert({
    where: {
      templateId_hardwareId: {
        templateId: templateWardrobe.id,
        hardwareId: hwHinge.id,
      },
    },
    update: {},
    create: {
      templateId: templateWardrobe.id,
      hardwareId: hwHinge.id,
      formulaRule: "doorsCount * (heightMm > 2200 ? 5 : 4)",
      defaultQty: 8,
    },
  });
  console.log('✅ Product Template seeded: 2-Door Custom Wardrobe');

  // 9. Pricing Rule: Official 2026 Production Rule (ZATCA 15%)
  const pricingRule = await prisma.pricingRule.create({
    data: {
      companyId: company.id,
      version: 1,
      ruleName: 'SATCO Jeddah Standard 2026 Rate Card',
      cuttingPerMeterSar: 1.5000,
      edgeBandingPerMeterSar: 3.5000,
      cncPerHoleSar: 0.3500,
      laborMarkupRate: 0.1800, // 18% Factory assembly labor
      marginRate: 0.2200,      // 22% Gross commercial margin
      vatPercentage: 15.0000,  // Exact 15.0000% ZATCA VAT
      effectiveFrom: new Date('2026-01-01T00:00:00Z'),
      createdById: adminUser.id,
    },
  });
  console.log('✅ Active Pricing Rule created with 15% ZATCA VAT');

  console.log('🎉 Seeding successfully completed without error!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
