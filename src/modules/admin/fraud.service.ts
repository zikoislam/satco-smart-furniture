import { z } from 'zod';
import { BlacklistReason } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { SaudiPhoneSchema } from '@/lib/validation/saudi-validators';
import { ConflictError } from '@/lib/api/errors';

export const AddBlacklistSchema = z.object({
  phone: SaudiPhoneSchema,
  reason: z.enum([
    'SUSPECTED_FRAUD',
    'REPEATED_FAKE_ORDERS',
    'PAYMENT_CHARGEBACK',
    'SECURITY_VIOLATION',
    'MANUAL_ADMIN_BLOCK',
  ]),
  notes: z.string().max(1000).optional(),
});

export class FraudService {
  public static async listBlacklist() {
    const entries = await prisma.blacklistEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { entries };
  }

  public static async addToBlacklist(
    adminId: string,
    rawInput: z.infer<typeof AddBlacklistSchema>
  ) {
    const input = AddBlacklistSchema.parse(rawInput);

    const existing = await prisma.blacklistEntry.findUnique({
      where: { phone: input.phone },
    });

    if (existing) {
      throw new ConflictError(
        `${input.phone} is already on the fraud blacklist`,
        'ALREADY_BLACKLISTED'
      );
    }

    const user = await prisma.user.findUnique({
      where: { phone: input.phone },
      select: { id: true },
    });

    const entry = await prisma.blacklistEntry.create({
      data: {
        phone: input.phone,
        userId: user?.id ?? null,
        reason: input.reason as BlacklistReason,
        notes: input.notes,
        blockedBy: adminId,
      },
    });

    return entry;
  }
}
