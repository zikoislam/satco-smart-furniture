import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/modules/auth/jwt.service';
import type { CartIdentity } from '@/modules/cart/cart.service';

/**
 * Extracts optional Bearer JWT `userId` and `X-Session-ID` header for
 * guest/authenticated cart operations.
 */
export function extractCartIdentity(req: NextRequest): CartIdentity {
  const sessionId = req.headers.get('x-session-id')?.trim() || undefined;
  const authHeader = req.headers.get('authorization');

  let userId: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const payload = verifyAccessToken(token);
      userId = payload.sub;
    }
  }

  return { userId, sessionId };
}
