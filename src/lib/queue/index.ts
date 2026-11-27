import { Queue, type ConnectionOptions } from 'bullmq';
import { redis } from '@/lib/redis';

export const QUEUE_NAMES = {
  SMS_OTP: 'sms-otp',
  PAYMENT_WEBHOOK: 'payment-webhook',
  ZATCA_CLEARANCE: 'zatca-clearance',
  INSTALLATION_NOTIFICATION: 'installation-notification',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const queueCache = new Map<QueueName, Queue>();

/**
 * Lazily returns a BullMQ Queue instance backed by the shared Redis connection.
 */
export function getQueue(name: QueueName): Queue {
  const existing = queueCache.get(name);
  if (existing) return existing;

  const queue = new Queue(name, {
    connection: redis as unknown as ConnectionOptions,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });

  queueCache.set(name, queue);
  return queue;
}

export const queues = {
  get smsOtp() {
    return getQueue(QUEUE_NAMES.SMS_OTP);
  },
  get paymentWebhook() {
    return getQueue(QUEUE_NAMES.PAYMENT_WEBHOOK);
  },
  get zatcaClearance() {
    return getQueue(QUEUE_NAMES.ZATCA_CLEARANCE);
  },
  get installationNotification() {
    return getQueue(QUEUE_NAMES.INSTALLATION_NOTIFICATION);
  },
};
