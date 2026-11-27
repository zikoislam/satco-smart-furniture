import { randomUUID } from 'crypto';
import { z } from 'zod';
import { ProductionJobStatus, ProductionStage } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DomainRuleError, NotFoundError } from '@/lib/api/errors';

export const CreateProductionJobSchema = z.object({
  orderId: z.string().uuid(),
  assignedToId: z.string().uuid().optional(),
  isRmaRemake: z.boolean().default(false),
});

export const AdvanceProductionStageSchema = z.object({
  toStage: z.enum([
    'CUTTING',
    'EDGE_BANDING',
    'MACHINING',
    'ASSEMBLY',
    'QC',
    'PACKED',
  ]),
  notes: z.string().max(1000).optional(),
});

export class ProductionService {
  public static async listProductionJobs() {
    const jobs = await prisma.productionJob.findMany({
      include: {
        order: { select: { orderNumber: true, status: true } },
        stageLogs: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { jobs };
  }

  public static async createProductionJob(
    rawInput: z.infer<typeof CreateProductionJobSchema>
  ) {
    const input = CreateProductionJobSchema.parse(rawInput);

    const order = await prisma.order.findUnique({ where: { id: input.orderId } });
    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    if (order.status === 'DRAFT' || order.status === 'PENDING_DEPOSIT') {
      throw new DomainRuleError(
        'DEPOSIT_NOT_VERIFIED',
        'BR-SEC-005: Cannot create production job before deposit verification.',
        undefined,
        422
      );
    }

    const jobNumber = `PRD-${new Date().getFullYear()}-${randomUUID().slice(0, 6).toUpperCase()}`;

    return prisma.productionJob.create({
      data: {
        orderId: order.id,
        jobNumber,
        currentStage: 'CUTTING',
        status: 'READY_FOR_PRODUCTION',
        isRmaRemake: input.isRmaRemake,
        assignedToId: input.assignedToId ?? null,
      },
    });
  }

  public static async advanceStage(
    jobId: string,
    actorId: string,
    rawInput: z.infer<typeof AdvanceProductionStageSchema>
  ) {
    const input = AdvanceProductionStageSchema.parse(rawInput);

    return prisma.$transaction(async (tx) => {
      const job = await tx.productionJob.findUnique({ where: { id: jobId } });
      if (!job) {
        throw new NotFoundError('Production job not found', 'PRODUCTION_JOB_NOT_FOUND');
      }

      const now = new Date();
      const nextStatus: ProductionJobStatus =
        input.toStage === 'PACKED' ? 'COMPLETED' : 'IN_PROGRESS';

      const updated = await tx.productionJob.update({
        where: { id: job.id },
        data: {
          currentStage: input.toStage as ProductionStage,
          status: nextStatus,
          startedAt: job.startedAt ?? now,
          completedAt: nextStatus === 'COMPLETED' ? now : null,
          version: { increment: 1 },
        },
      });

      await tx.productionStageLog.create({
        data: {
          productionJobId: job.id,
          fromStage: job.currentStage,
          toStage: input.toStage as ProductionStage,
          actorId,
          notes: input.notes,
        },
      });

      return updated;
    });
  }
}
