import { z } from 'zod';

export const RoomTypeEnum = z.enum([
  'BEDROOM',
  'LIVING_ROOM',
  'MAJLIS',
  'KITCHEN',
  'DINING_ROOM',
  'HOME_OFFICE',
  'WALK_IN_CLOSET',
]);
export type RoomType = z.infer<typeof RoomTypeEnum>;

export const InteriorStyleEnum = z.enum([
  'MODERN_MINIMALIST',
  'NEOCLASSICAL_SAUDI',
  'SCANDINAVIAN',
  'JAPANDI',
  'CONTEMPORARY_LUXURY',
  'TRADITIONAL_NAJDI_FUSION',
]);
export type InteriorStyle = z.infer<typeof InteriorStyleEnum>;

export const FurnitureCategoryEnum = z.enum([
  'WARDROBE',
  'CABINET',
  'TV_UNIT',
  'DRESSING_TABLE',
  'BOOKSHELF',
  'KITCHEN_PANTRY',
  'SHOE_RACK',
]);
export type FurnitureCategory = z.infer<typeof FurnitureCategoryEnum>;

export const MatchedCatalogItemSchema = z.object({
  templateId: z.string().optional(),
  nameAr: z.string(),
  nameEn: z.string(),
  category: FurnitureCategoryEnum,
  suggestedWidthMm: z.number().min(300).max(6000),
  suggestedHeightMm: z.number().min(400).max(3200),
  suggestedDepthMm: z.number().min(200).max(1200),
  recommendedMaterial: z.string(),
  finishColorHex: z.string().regex(/^#([A-Fa-f0-9]{6})$/),
  estimatedBasePriceSar: z.number().positive(),
  parametricConfigUrl: z.string().optional(),
});
export type MatchedCatalogItem = z.infer<typeof MatchedCatalogItemSchema>;

export const GenerateConceptInputSchema = z.object({
  roomType: RoomTypeEnum,
  interiorStyle: InteriorStyleEnum,
  userPrompt: z.string().min(5).max(1000).optional(),
  budgetTier: z.enum(['ECONOMY', 'PREMIUM', 'LUXURY']).default('PREMIUM'),
  roomDimensions: z
    .object({
      widthMm: z.number().min(1500).max(20000).optional(),
      lengthMm: z.number().min(1500).max(20000).optional(),
      heightMm: z.number().min(2000).max(6000).optional(),
    })
    .optional(),
  base64RoomPhoto: z.string().optional(),
});
export type GenerateConceptInput = z.infer<typeof GenerateConceptInputSchema>;

export const GeneratedConceptResultSchema = z.object({
  conceptId: z.string().uuid(),
  roomType: RoomTypeEnum,
  interiorStyle: InteriorStyleEnum,
  titleAr: z.string(),
  titleEn: z.string(),
  descriptionAr: z.string(),
  descriptionEn: z.string(),
  advisoryDisclaimerAr: z.string(),
  advisoryDisclaimerEn: z.string(),
  watermarkText: z.string(),
  colorPalette: z.array(
    z.object({
      name: z.string(),
      hex: z.string(),
    })
  ),
  visualizationImageUri: z.string(),
  matchedFurnitureItems: z.array(MatchedCatalogItemSchema),
  estimatedTotalSar: z.number().positive(),
  mandatoryMeasurementConfirmationRequired: z.literal(true),
  createdAt: z.string().datetime(),
});
export type GeneratedConceptResult = z.infer<typeof GeneratedConceptResultSchema>;

export const RoomMeasurementConfirmationSchema = z.object({
  conceptId: z.string().uuid(),
  confirmedByCustomer: z.literal(true),
  wallWidthMm: z.number().min(1000).max(20000),
  wallLengthMm: z.number().min(1000).max(20000),
  ceilingHeightMm: z.number().min(2000).max(5000),
  obstructions: z.array(
    z.object({
      type: z.enum(['DOOR', 'WINDOW', 'AC_VENT', 'COLUMN', 'SOCKET']),
      positionFromLeftMm: z.number().nonnegative(),
      widthMm: z.number().positive(),
      heightMm: z.number().positive(),
    })
  ).default([]),
  notes: z.string().max(500).optional(),
});
export type RoomMeasurementConfirmation = z.infer<typeof RoomMeasurementConfirmationSchema>;
