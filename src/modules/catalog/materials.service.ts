import { prisma } from '@/lib/prisma';

export class MaterialsService {
  /**
   * Returns active Egger/Kronospan material sheets, Rehau edge-bandings,
   * and Blum/Hafele hardware items for the 3D configurator.
   */
  public static async getActiveMaterialsCatalog() {
    const [materialSheets, edgeBandings, hardwareItems] = await Promise.all([
      prisma.materialSheet.findMany({
        where: { isActive: true },
        orderBy: [{ brand: 'asc' }, { nameEn: 'asc' }],
      }),
      prisma.edgeBanding.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
      }),
      prisma.hardwareItem.findMany({
        where: { isActive: true },
        orderBy: [{ brand: 'asc' }, { nameEn: 'asc' }],
      }),
    ]);

    return {
      materialSheets: materialSheets.map((s) => ({
        id: s.id,
        code: s.code,
        brand: s.brand,
        finishCode: s.finishCode,
        nameAr: s.nameAr,
        nameEn: s.nameEn,
        thicknessMm: s.thicknessMm.toFixed(2),
        lengthMm: s.lengthMm.toFixed(2),
        widthMm: s.widthMm.toFixed(2),
        coreType: s.coreType,
        sellingPricePerSqmSar: s.sellingPricePerSqmSar.toFixed(4),
        textureUrl: s.textureUrl,
        roughness: s.roughness ? Number(s.roughness) : 0.4,
        inStock: s.inStockSheets > 0,
        inStockSheets: s.inStockSheets,
      })),
      edgeBandings: edgeBandings.map((e) => ({
        id: e.id,
        code: e.code,
        materialType: e.materialType,
        thicknessMm: e.thicknessMm.toFixed(2),
        widthMm: e.widthMm.toFixed(2),
        finishCodeMatch: e.finishCodeMatch,
        sellingPricePerMeterSar: e.sellingPricePerMeterSar.toFixed(4),
        inStock: Number(e.inStockMeters) > 0,
      })),
      hardwareItems: hardwareItems.map((h) => ({
        id: h.id,
        sku: h.sku,
        brand: h.brand,
        nameAr: h.nameAr,
        nameEn: h.nameEn,
        unitType: h.unitType,
        sellingPriceSar: h.sellingPriceSar.toFixed(4),
        inStock: h.inStockQty > 0,
      })),
    };
  }
}
