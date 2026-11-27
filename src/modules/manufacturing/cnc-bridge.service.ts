import { timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { CNCJobStatus, CuttingJobStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AuthError, NotFoundError } from '@/lib/api/errors';

export const CncStatusUpdateSchema = z.object({
  status: z.enum(['RUNNING', 'COMPLETED', 'ERROR']),
  executionDurationSeconds: z.number().int().nonnegative().optional(),
  cycleCount: z.number().int().positive().optional(),
  errorLog: z.string().nullable().optional(),
});

export class CncBridgeService {
  /**
   * Validates `X-Bridge-Key` header using timing-safe comparison (not JWT).
   */
  public static assertBridgeKey(bridgeKeyHeader: string | null): void {
    if (!bridgeKeyHeader) {
      throw new AuthError('Missing X-Bridge-Key header', 'BRIDGE_UNAUTHORIZED');
    }

    const expected = process.env.FACTORY_BRIDGE_API_KEY || 'satco-dev-bridge-key';
    const providedBuf = Buffer.from(bridgeKeyHeader.trim(), 'utf8');
    const expectedBuf = Buffer.from(expected, 'utf8');

    if (
      providedBuf.length !== expectedBuf.length ||
      !timingSafeEqual(providedBuf, expectedBuf)
    ) {
      throw new AuthError('Invalid X-Bridge-Key', 'BRIDGE_UNAUTHORIZED');
    }
  }

  /**
   * Returns all QUEUED CNC jobs waiting for Homag Centateq / Sawteq download.
   */
  public static async pollPendingJobs() {
    const jobs = await prisma.cNCMachineJob.findMany({
      where: { status: 'QUEUED' },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    if (jobs.length > 0) {
      await prisma.cNCMachineJob.updateMany({
        where: { id: { in: jobs.map((j) => j.id) } },
        data: { bridgePolledAt: new Date() },
      });
    }

    return {
      pendingJobs: jobs.map((job, idx) => ({
        cncJobId: job.id,
        cuttingJobId: job.cuttingJobId,
        machineModel: job.machineModel,
        programNumber: job.programNumber,
        sheetIndex: idx + 1,
        downloadUrl: `/api/v1/cnc-bridge/jobs/${job.id}/program`,
      })),
    };
  }

  /**
   * Streams binary woodWOP `.mpr` program and marks job as DOWNLOADED_BY_BRIDGE.
   */
  public static async getProgramBinary(jobId: string) {
    const job = await prisma.cNCMachineJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundError('CNC machine job not found', 'CNC_JOB_NOT_FOUND');
    }

    if (job.status === 'QUEUED') {
      await prisma.cNCMachineJob.update({
        where: { id: job.id },
        data: { status: 'DOWNLOADED_BY_BRIDGE' },
      });
    }

    const mprContent =
      job.mprWoodwopCode ??
      `[H\nVERSION="4.0 Alpha"\nPROGRAM="${job.programNumber}"\n!\n`;

    return {
      filename: `${job.programNumber}.mpr`,
      buffer: Buffer.from(mprContent, 'utf8'),
    };
  }

  /**
   * Records machine execution status callback and syncs parent CuttingJob status.
   */
  public static async updateJobStatus(
    jobId: string,
    rawInput: z.infer<typeof CncStatusUpdateSchema>
  ) {
    const input = CncStatusUpdateSchema.parse(rawInput);

    const job = await prisma.cNCMachineJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundError('CNC machine job not found', 'CNC_JOB_NOT_FOUND');
    }

    const now = new Date();
    const cuttingStatusMap: Record<string, CuttingJobStatus> = {
      RUNNING: 'IN_PROGRESS',
      COMPLETED: 'COMPLETED',
      ERROR: 'IN_PROGRESS',
    };

    await prisma.$transaction(async (tx) => {
      await tx.cNCMachineJob.update({
        where: { id: job.id },
        data: {
          status: input.status as CNCJobStatus,
          ...(input.status === 'RUNNING' ? { executionStartedAt: now } : {}),
          ...(input.status === 'COMPLETED' ? { executionCompletedAt: now } : {}),
          ...(input.errorLog !== undefined ? { errorLog: input.errorLog } : {}),
        },
      });

      await tx.cuttingJob.update({
        where: { id: job.cuttingJobId },
        data: { status: cuttingStatusMap[input.status] },
      });
    });

    return {
      cncJobId: job.id,
      status: input.status,
      acknowledgedAt: now.toISOString(),
    };
  }
}
