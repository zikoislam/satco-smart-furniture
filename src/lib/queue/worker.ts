import { Worker, type ConnectionOptions, type Job } from 'bullmq';
import { redis } from '@/lib/redis';
import { QUEUE_NAMES, type QueueName } from '@/lib/queue';
import { sendSmsOtp } from '@/modules/auth/sms.adapter';
import { ZatcaService } from '@/modules/invoicing/zatca.service';

export type QueueJobHandler = (job: Job) => Promise<unknown>;

export const queueHandlers: Record<QueueName, QueueJobHandler> = {
  [QUEUE_NAMES.SMS_OTP]: async (job) => {
    const { phoneNumber, otpCode } = job.data as {
      phoneNumber: string;
      otpCode: string;
    };
    await sendSmsOtp(phoneNumber, otpCode);
    return { delivered: true };
  },

  [QUEUE_NAMES.PAYMENT_WEBHOOK]: async (job) => {
    return { acknowledged: true, jobId: job.id, payload: job.data };
  },

  [QUEUE_NAMES.ZATCA_CLEARANCE]: async (job) => {
    const { orderId } = job.data as { orderId: string };
    return ZatcaService.issueInvoice(orderId);
  },

  [QUEUE_NAMES.INSTALLATION_NOTIFICATION]: async (job) => {
    return { notified: true, jobId: job.id, data: job.data };
  },
};

/**
 * Starts BullMQ workers for all SATCO background queues.
 */
export function startAllWorkers(): Worker[] {
  const connection = redis as unknown as ConnectionOptions;
  return (Object.keys(queueHandlers) as QueueName[]).map((queueName) => {
    return new Worker(queueName, queueHandlers[queueName], {
      connection,
      concurrency: 5,
    });
  });
}

if (require.main === module) {
  const workers = startAllWorkers();
  console.info(`[BullMQ] Started ${workers.length} SATCO background workers.`);
}
