import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { ConflictError, ValidationError } from '@/lib/api/errors';

const IDEMPOTENCY_LOCK_TTL_SECONDS = 120;
const IDEMPOTENCY_CACHE_TTL_SECONDS = 86400; // 24 hours

interface CachedIdempotencyRecord {
  status: number;
  body: unknown;
}

/**
 * Enforces `X-Idempotency-Key` header via Redis SETNX lock and 24-hour response cache.
 * Aligned with Api-spac.md Section 5.4 (Idempotency & Financial Double-Charge Shield).
 */
export async function withIdempotency(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const idempotencyKey = req.headers.get('x-idempotency-key')?.trim();
  if (!idempotencyKey) {
    throw new ValidationError(
      'X-Idempotency-Key header is required for this financial operation',
      undefined,
      'IDEMPOTENCY_KEY_REQUIRED'
    );
  }

  const redisKey = `idempotency:${idempotencyKey}`;

  // 1. Check for existing cached or in-progress key
  const existing = await redis.get(redisKey);
  if (existing !== null) {
    if (existing === 'IN_PROGRESS') {
      throw new ConflictError(
        'A concurrent request with this X-Idempotency-Key is already in progress',
        'CONCURRENT_REQUEST_IN_PROGRESS'
      );
    }

    const parsed = JSON.parse(existing) as CachedIdempotencyRecord;
    return NextResponse.json(parsed.body, {
      status: parsed.status,
      headers: { 'X-Cache': 'HIT' },
    });
  }

  // 2. Acquire atomic lock
  const acquired = await redis.set(
    redisKey,
    'IN_PROGRESS',
    'EX',
    IDEMPOTENCY_LOCK_TTL_SECONDS,
    'NX'
  );

  if (acquired !== 'OK') {
    throw new ConflictError(
      'A concurrent request with this X-Idempotency-Key is already in progress',
      'CONCURRENT_REQUEST_IN_PROGRESS'
    );
  }

  // 3. Execute handler; cache response on success or release lock on error
  try {
    const response = await handler();
    const body = await response.clone().json();
    const record: CachedIdempotencyRecord = {
      status: response.status,
      body,
    };

    await redis.set(
      redisKey,
      JSON.stringify(record),
      'EX',
      IDEMPOTENCY_CACHE_TTL_SECONDS
    );

    return response;
  } catch (error) {
    await redis.del(redisKey);
    throw error;
  }
}
