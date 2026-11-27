import { prisma } from '@/lib/prisma';
import { ForbiddenError } from '@/lib/api/errors';

/**
 * Checks whether a normalized Saudi phone number is present in `blacklist_entries` (BR-SEC-001).
 */
export async function assertNotBlacklisted(normalizedPhone: string): Promise<void> {
  const entry = await prisma.blacklistEntry.findUnique({
    where: { phone: normalizedPhone },
    select: { id: true, reason: true },
  });

  if (entry) {
    throw new ForbiddenError(
      'This mobile number has been suspended due to security or fraud violations.',
      'ACCOUNT_BLACKLISTED'
    );
  }
}
