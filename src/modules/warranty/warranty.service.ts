import { z } from 'zod';
import { Prisma, UserRole, WarrantyClaimStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DomainRuleError, ForbiddenError, NotFoundError } from '@/lib/api/errors';

export const SubmitWarrantyClaimSchema = z.object({
  orderId: z.string().uuid(),
  bomItemId: z.string().uuid().optional(),
  defectDescription: z.string().min(10).max(2000),
  defectPhotos: z.array(z.string().url()).max(5).default([]),
});

export const ResolveWarrantyClaimSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'APPROVED_REMAKE', 'RESOLVED', 'REJECTED']),
  rmaProductionJobId: z.string().uuid().optional(),
});

export class WarrantyService {
  public static async listClaims(userId: string, role: UserRole) {
    const where = role === 'CUSTOMER' ? { customerId: userId } : {};
    const claims = await prisma.warrantyClaim.findMany({
      where,
      include: {
        order: { select: { orderNumber: true, warrantyExpiresAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { claims };
  }

  public static async submitClaim(
    customerId: string,
    rawInput: z.infer<typeof SubmitWarrantyClaimSchema>
  ) {
    const input = SubmitWarrantyClaimSchema.parse(rawInput);

    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      select: { id: true, customerId: true, status: true, warrantyExpiresAt: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenError('You do not own this order', 'FORBIDDEN');
    }

    if (order.status !== 'HANDOVER_COMPLETED') {
      throw new DomainRuleError(
        'WARRANTY_NOT_ACTIVE',
        'Warranty claims can only be filed after installation handover completion.',
        undefined,
        422
      );
    }

    if (order.warrantyExpiresAt && order.warrantyExpiresAt < new Date()) {
      throw new DomainRuleError(
        'WARRANTY_EXPIRED',
        'Warranty period for this order has expired.',
        undefined,
        422
      );
    }

    return prisma.warrantyClaim.create({
      data: {
        orderId: order.id,
        customerId,
        bomItemId: input.bomItemId ?? null,
        defectDescription: input.defectDescription,
        defectPhotosJson: input.defectPhotos as Prisma.InputJsonValue,
        status: 'OPEN',
      },
    });
  }

  public static async resolveClaim(
    claimId: string,
    rawInput: z.infer<typeof ResolveWarrantyClaimSchema>
  ) {
    const input = ResolveWarrantyClaimSchema.parse(rawInput);

    const existing = await prisma.warrantyClaim.findUnique({ where: { id: claimId } });
    if (!existing) {
      throw new NotFoundError('Warranty claim not found', 'WARRANTY_CLAIM_NOT_FOUND');
    }

    return prisma.warrantyClaim.update({
      where: { id: claimId },
      data: {
        status: input.status as WarrantyClaimStatus,
        rmaProductionJobId: input.rmaProductionJobId ?? existing.rmaProductionJobId,
        resolvedAt: input.status === 'RESOLVED' || input.status === 'REJECTED' ? new Date() : null,
      },
    });
  }
}
