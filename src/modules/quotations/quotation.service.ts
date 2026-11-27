import { randomUUID } from 'crypto';
import { z } from 'zod';
import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  Decimal,
  toDecimal,
  calculateZatcaVat,
  calculateGrandTotal,
} from '@/lib/decimal';
import { SaudiPhoneSchema } from '@/lib/validation/saudi-validators';
import { DomainRuleError, ForbiddenError, NotFoundError } from '@/lib/api/errors';

export const CreateEnquirySchema = z.object({
  contactPhone: SaudiPhoneSchema,
  contactName: z.string().min(2).max(255).optional(),
  source: z.string().max(50).default('WEB_CONFIGURATOR'),
  configSnapshotJson: z.record(z.unknown()),
});

export const CreateQuotationSchema = z.object({
  enquiryId: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  discountPercent: z.number().min(0).max(50).default(0),
  validDays: z.number().int().min(1).max(60).default(14),
  items: z
    .array(
      z.object({
        templateId: z.string().uuid(),
        configuredWidthMm: z.number().int().positive(),
        configuredHeightMm: z.number().int().positive(),
        configuredDepthMm: z.number().int().positive(),
        configurationJson: z.record(z.unknown()),
        quantity: z.number().int().min(1).default(1),
        unitPriceSar: z.string().regex(/^\d+(\.\d{1,4})?$/),
      })
    )
    .min(1),
});

const ROLE_MAX_DISCOUNT_PERCENT: Partial<Record<UserRole, number>> = {
  ESTIMATOR: 5,
  DESIGNER: 5,
  FACTORY_MANAGER: 15,
  SUPER_ADMIN: 50,
};

export class QuotationService {
  public static async createEnquiry(
    rawInput: z.infer<typeof CreateEnquirySchema>,
    customerId?: string
  ) {
    const input = CreateEnquirySchema.parse(rawInput);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    return prisma.enquiry.create({
      data: {
        customerId: customerId ?? null,
        contactPhone: input.contactPhone,
        contactName: input.contactName,
        source: input.source,
        configSnapshotJson: input.configSnapshotJson as Prisma.InputJsonValue,
        recoveryToken: randomUUID(),
        status: customerId ? 'OTP_VERIFIED' : 'NEW',
        otpVerified: Boolean(customerId),
        expiresAt,
      },
    });
  }

  public static async listEnquiries() {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { enquiries };
  }

  /**
   * Creates a formal sales quotation enforcing BR-PRICE-004 discount authority ceiling.
   */
  public static async createQuotation(
    staffId: string,
    staffRole: UserRole,
    rawInput: z.infer<typeof CreateQuotationSchema>
  ) {
    const input = CreateQuotationSchema.parse(rawInput);

    const maxAllowed = ROLE_MAX_DISCOUNT_PERCENT[staffRole] ?? 0;
    if (input.discountPercent > maxAllowed) {
      throw new ForbiddenError(
        `BR-PRICE-004: Role ${staffRole} cannot apply discount above ${maxAllowed}%`,
        'DISCOUNT_AUTHORITY_EXCEEDED'
      );
    }

    const [company, activeRule] = await Promise.all([
      prisma.company.findFirst(),
      prisma.pricingRule.findFirst({
        where: {
          effectiveFrom: { lte: new Date() },
          OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }],
        },
        orderBy: { effectiveFrom: 'desc' },
      }),
    ]);

    if (!company || !activeRule) {
      throw new DomainRuleError(
        'REQUIRES_MANUAL_QUOTE',
        'Company or active PricingRule not configured',
        undefined,
        422
      );
    }

    let netSubtotal = new Decimal(0);
    const itemRows = input.items.map((item) => {
      const unit = toDecimal(item.unitPriceSar);
      const total = unit.times(item.quantity).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      netSubtotal = netSubtotal.plus(total);
      return { ...item, unitPriceSar: unit.toFixed(4), totalPriceSar: total.toFixed(4) };
    });

    const discountSar = netSubtotal
      .times(input.discountPercent)
      .dividedBy(100)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const discountedNet = netSubtotal.minus(discountSar);
    const vatAmountSar = calculateZatcaVat(
      discountedNet,
      toDecimal(activeRule.vatPercentage.toString())
    ).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const grandTotalSar = calculateGrandTotal(discountedNet, vatAmountSar);

    const quoteNumber = `QT-${new Date().getFullYear()}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + input.validDays * 24 * 60 * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.create({
        data: {
          companyId: company.id,
          enquiryId: input.enquiryId ?? null,
          customerId: input.customerId,
          pricingRuleId: activeRule.id,
          quoteNumber,
          status: 'ISSUED',
          netSubtotalSar: netSubtotal.toFixed(4),
          discountPercent: input.discountPercent.toFixed(2),
          discountSar: discountSar.toFixed(4),
          vatAmountSar: vatAmountSar.toFixed(4),
          grandTotalSar: grandTotalSar.toFixed(4),
          discountApprovedBy: input.discountPercent > 0 ? staffId : null,
          pricingSnapshotJson: {
            vatPercentage: activeRule.vatPercentage.toString(),
          } as Prisma.InputJsonValue,
          portalTokenSignature: randomUUID(),
          expiresAt,
        },
      });

      for (const row of itemRows) {
        await tx.quotationItem.create({
          data: {
            quotationId: quotation.id,
            templateId: row.templateId,
            configuredWidthMm: row.configuredWidthMm,
            configuredHeightMm: row.configuredHeightMm,
            configuredDepthMm: row.configuredDepthMm,
            configurationJson: row.configurationJson as Prisma.InputJsonValue,
            quantity: row.quantity,
            unitPriceSar: row.unitPriceSar,
            totalPriceSar: row.totalPriceSar,
          },
        });
      }

      if (input.enquiryId) {
        await tx.enquiry.update({
          where: { id: input.enquiryId },
          data: { status: 'CONVERTED_TO_QUOTE' },
        });
      }

      return quotation;
    });
  }

  public static async listQuotations(userId: string, role: UserRole) {
    const where = role === 'CUSTOMER' ? { customerId: userId } : {};
    const quotations = await prisma.quotation.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { quotations };
  }

  public static async acceptQuotation(customerId: string, quotationId: string) {
    const quotation = await prisma.quotation.findUnique({ where: { id: quotationId } });
    if (!quotation) {
      throw new NotFoundError('Quotation not found', 'QUOTATION_NOT_FOUND');
    }
    if (quotation.customerId !== customerId) {
      throw new ForbiddenError('You do not own this quotation', 'FORBIDDEN');
    }
    if (quotation.status !== 'ISSUED') {
      throw new DomainRuleError(
        'QUOTATION_NOT_ACCEPTABLE',
        `Quotation in status ${quotation.status} cannot be accepted`,
        undefined,
        422
      );
    }

    return prisma.quotation.update({
      where: { id: quotationId },
      data: { status: 'CUSTOMER_ACCEPTED' },
    });
  }
}
