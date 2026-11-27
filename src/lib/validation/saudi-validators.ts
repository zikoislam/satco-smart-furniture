import { z } from 'zod';

/**
 * Saudi Mobile Number Regex:
 * Matches:
 *  - +9665xxxxxxxx
 *  - 009665xxxxxxxx
 *  - 05xxxxxxxx
 *  - 5xxxxxxxx
 */
export const SAUDI_MOBILE_REGEX = /^(?:\+966|00966|0)?5[0-9]{8}$/;

/**
 * Normalizes any valid Saudi phone number to canonical E.164 format: +9665xxxxxxxx
 */
export function normalizeSaudiPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (!SAUDI_MOBILE_REGEX.test(cleaned)) {
    throw new Error(`Invalid Saudi mobile number format: ${phone}`);
  }

  if (cleaned.startsWith('+966')) {
    return cleaned;
  }
  if (cleaned.startsWith('00966')) {
    return `+${cleaned.slice(2)}`;
  }
  if (cleaned.startsWith('05')) {
    return `+966${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith('5')) {
    return `+966${cleaned}`;
  }
  return cleaned;
}

/**
 * Saudi National Address & Identity Zod Schemas
 */
export const SaudiPhoneSchema = z
  .string()
  .min(9, 'Mobile number too short')
  .max(16, 'Mobile number too long')
  .regex(SAUDI_MOBILE_REGEX, 'Must be a valid Saudi mobile number starting with 05 / 5 / +9665')
  .transform(normalizeSaudiPhone);

export const SaudiNationalAddressSchema = z.object({
  buildingNumber: z.string().length(4, 'Building number must be exactly 4 digits'),
  streetName: z.string().min(3, 'Street name is required'),
  district: z.string().min(2, 'District is required'),
  city: z.string().min(2, 'City is required').default('Riyadh'),
  postalCode: z.string().length(5, 'Postal code must be exactly 5 digits'),
  additionalNumber: z.string().length(4, 'Additional number must be exactly 4 digits').optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const DimensionRangeSchema = z.object({
  widthMm: z.number().int().positive(),
  heightMm: z.number().int().positive(),
  depthMm: z.number().int().positive(),
});

export const ConfiguratorParametricInputSchema = z.object({
  templateId: z.string().uuid(),
  widthMm: z.number().int().min(400).max(3600),
  heightMm: z.number().int().min(600).max(3200),
  depthMm: z.number().int().min(300).max(1000),
  carcassMaterialCode: z.string().min(1),
  shutterMaterialCode: z.string().min(1),
  edgeBandingCode: z.string().min(1),
  shelvesCount: z.number().int().min(0).max(20).default(3),
  drawersCount: z.number().int().min(0).max(10).default(0),
  doorsCount: z.number().int().min(1).max(6).default(2),
  hasLighting: z.boolean().default(false),
  hasSoftClose: z.boolean().default(true),
});

export type ConfiguratorParametricInput = z.infer<typeof ConfiguratorParametricInputSchema>;
