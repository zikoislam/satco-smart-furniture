import { z } from 'zod';
import { StockMovementType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DomainRuleError, NotFoundError } from '@/lib/api/errors';

export const RecordStockMovementSchema = z.object({
  materialSheetId: z.string().uuid(),
  movementType: z.enum([
    'RECEIPT',
    'ISSUE_TO_JOB',
    'RETURN_FROM_JOB',
    'ADJUSTMENT',
  ]),
  quantityDelta: z.number().int().refine((n) => n !== 0, 'quantityDelta cannot be 0'),
  referenceId: z.string().min(1).max(100),
  notes: z.string().max(500).optional(),
});

export const ReserveMaterialSchema = z.object({
  productionJobId: z.string().uuid(),
  materialSheetId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export class InventoryService {
  public static async listStockBalances() {
    const balances = await prisma.stockBalance.findMany({
      include: {
        materialSheet: {
          select: { id: true, code: true, nameEn: true, nameAr: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return { balances };
  }

  public static async recordMovement(
    actorId: string,
    rawInput: z.infer<typeof RecordStockMovementSchema>
  ) {
    const input = RecordStockMovementSchema.parse(rawInput);

    return prisma.$transaction(async (tx) => {
      const company = await tx.company.findFirst();
      if (!company) {
        throw new NotFoundError('Company not configured', 'COMPANY_NOT_FOUND');
      }

      const existing = await tx.stockBalance.findUnique({
        where: {
          companyId_materialSheetId: {
            companyId: company.id,
            materialSheetId: input.materialSheetId,
          },
        },
      });

      const currentAvailable = existing?.availableQty ?? 0;
      const newAvailable = currentAvailable + input.quantityDelta;

      if (newAvailable < 0) {
        throw new DomainRuleError(
          'INSUFFICIENT_STOCK',
          `Insufficient available stock (${currentAvailable}) for delta ${input.quantityDelta}`,
          undefined,
          422
        );
      }

      const balance = existing
        ? await tx.stockBalance.update({
            where: { id: existing.id },
            data: {
              availableQty: newAvailable,
              version: { increment: 1 },
            },
          })
        : await tx.stockBalance.create({
            data: {
              companyId: company.id,
              materialSheetId: input.materialSheetId,
              availableQty: newAvailable,
              reservedQty: 0,
            },
          });

      const movement = await tx.stockMovement.create({
        data: {
          companyId: company.id,
          materialSheetId: input.materialSheetId,
          movementType: input.movementType as StockMovementType,
          quantityDelta: input.quantityDelta,
          balanceAfter: newAvailable,
          referenceId: input.referenceId,
          actorId,
          notes: input.notes,
        },
      });

      return { balance, movement };
    });
  }

  public static async reserveForProductionJob(
    actorId: string,
    rawInput: z.infer<typeof ReserveMaterialSchema>
  ) {
    const input = ReserveMaterialSchema.parse(rawInput);

    return prisma.$transaction(async (tx) => {
      const company = await tx.company.findFirst();
      if (!company) {
        throw new NotFoundError('Company not configured', 'COMPANY_NOT_FOUND');
      }

      const balance = await tx.stockBalance.findUnique({
        where: {
          companyId_materialSheetId: {
            companyId: company.id,
            materialSheetId: input.materialSheetId,
          },
        },
      });

      if (!balance || balance.availableQty < input.quantity) {
        throw new DomainRuleError(
          'INSUFFICIENT_STOCK',
          'Insufficient available sheets to reserve for production job',
          { available: balance?.availableQty ?? 0, requested: input.quantity },
          422
        );
      }

      const newAvailable = balance.availableQty - input.quantity;
      const newReserved = balance.reservedQty + input.quantity;

      await tx.stockBalance.update({
        where: { id: balance.id },
        data: {
          availableQty: newAvailable,
          reservedQty: newReserved,
          version: { increment: 1 },
        },
      });

      const reservation = await tx.materialReservation.create({
        data: {
          productionJobId: input.productionJobId,
          materialSheetId: input.materialSheetId,
          reservedQty: input.quantity,
          status: 'RESERVED',
        },
      });

      await tx.stockMovement.create({
        data: {
          companyId: company.id,
          materialSheetId: input.materialSheetId,
          movementType: 'ISSUE_TO_JOB',
          quantityDelta: -input.quantity,
          balanceAfter: newAvailable,
          referenceId: input.productionJobId,
          actorId,
        },
      });

      return reservation;
    });
  }
}
