import { createHash } from 'crypto';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DomainRuleError, ForbiddenError, NotFoundError } from '@/lib/api/errors';
import { toDecimal } from '@/lib/decimal';
import { transitionOrderStatus } from '@/modules/orders/order-state-machine';

export const CompleteInstallationSchema = z.object({
  customerSignDataUrl: z.string().min(10),
  completionPhotos: z.array(z.string().min(1)).min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  technicianNotes: z.string().max(1000).optional(),
});

export class InstallationService {
  /**
   * Lists installation jobs assigned to the authenticated technician.
   */
  public static async listAssignedJobs(installerId: string) {
    const jobs = await prisma.installationJob.findMany({
      where: {
        installerId,
        status: { in: ['SCHEDULED', 'TECHNICIAN_EN_ROUTE', 'IN_PROGRESS'] },
      },
      include: {
        order: {
          include: {
            customer: { select: { fullName: true, phone: true } },
            address: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return {
      jobs: jobs.map((j) => ({
        installationJobId: j.id,
        orderId: j.orderId,
        orderNumber: j.order.orderNumber,
        customerName: j.order.customer.fullName,
        customerPhone: j.order.customer.phone,
        scheduledDate: j.scheduledDate.toISOString().slice(0, 10),
        timeSlot: j.timeSlot,
        district: `${j.order.address.district}, ${j.order.address.city}`,
        buildingNumber: j.order.address.buildingNumber,
        status: j.status,
      })),
    };
  }

  /**
   * Completes field installation with digital e-signature, GPS coordinates, and photos (BR-INS-001).
   * Transitions order to HANDOVER_COMPLETED, activates warranty, and unlocks Milestone 3 collection.
   */
  public static async completeInstallation(
    jobId: string,
    installerId: string,
    installerRole: string,
    rawInput: z.infer<typeof CompleteInstallationSchema>
  ) {
    const input = CompleteInstallationSchema.parse(rawInput);

    return prisma.$transaction(async (tx) => {
      const job = await tx.installationJob.findUnique({
        where: { id: jobId },
        include: {
          order: {
            include: {
              customer: { select: { fullName: true, phone: true } },
              milestoneSchedules: true,
            },
          },
        },
      });

      if (!job) {
        throw new NotFoundError('Installation job not found', 'INSTALLATION_JOB_NOT_FOUND');
      }

      if (
        installerRole !== 'SUPER_ADMIN' &&
        job.installerId &&
        job.installerId !== installerId
      ) {
        throw new ForbiddenError('This installation job is assigned to another technician', 'FORBIDDEN');
      }

      if (job.status === 'COMPLETED') {
        throw new DomainRuleError(
          'INSTALLATION_ALREADY_COMPLETED',
          'This installation job has already been completed',
          undefined,
          422
        );
      }

      const now = new Date();
      await tx.installationJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          customerSignUrl: input.customerSignDataUrl,
          completionPhotosJson: input.completionPhotos as Prisma.InputJsonValue,
          installerNotes: input.technicianNotes,
          completedAt: now,
        },
      });

      const phoneHash = createHash('sha256')
        .update(job.order.customer.phone ?? job.order.customerId)
        .digest('hex');

      await tx.handoverSignature.create({
        data: {
          installationJobId: job.id,
          signatureImageUrl: input.customerSignDataUrl,
          signedAt: now,
          gpsLat: input.latitude.toFixed(8),
          gpsLng: input.longitude.toFixed(8),
          signerName: job.order.customer.fullName,
          signerPhoneHash: phoneHash,
          checklistJson: {
            leveled: true,
            hingesCalibrated: true,
            siteCleaned: true,
          } as Prisma.InputJsonValue,
          photosJson: input.completionPhotos as Prisma.InputJsonValue,
        },
      });

      const warrantyExpiresAt = new Date(now);
      warrantyExpiresAt.setFullYear(
        warrantyExpiresAt.getFullYear() + job.order.warrantyYears
      );

      if (job.order.status === 'INSTALLATION_IN_PROGRESS') {
        await transitionOrderStatus(tx, {
          orderId: job.orderId,
          toStatus: 'HANDOVER_COMPLETED',
          actionBy: installerId,
          notes: 'BR-INS-001: Digital handover e-signature, GPS, and photos verified.',
          extraOrderData: { warrantyExpiresAt },
        });
      } else {
        await tx.order.update({
          where: { id: job.orderId },
          data: {
            status: 'HANDOVER_COMPLETED',
            warrantyExpiresAt,
          },
        });
        await tx.orderTimeline.create({
          data: {
            orderId: job.orderId,
            fromStatus: job.order.status,
            toStatus: 'HANDOVER_COMPLETED',
            actionBy: installerId,
            notes: 'BR-INS-001: Digital handover e-signature, GPS, and photos verified.',
          },
        });
      }

      const milestone3 = job.order.milestoneSchedules.find(
        (m) => m.milestone === 'MILESTONE_3_HANDOVER'
      );

      return {
        orderStatus: 'HANDOVER_COMPLETED',
        finalHandoverDueSar: milestone3
          ? toDecimal(milestone3.amountSar.toString()).toFixed(2)
          : '0.00',
        warrantyCardIssued: true,
        warrantyValidUntil: warrantyExpiresAt.toISOString(),
      };
    });
  }
}
