import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { AuthError, ForbiddenError } from '@/lib/api/errors';
import { withErrorHandler, type RouteContext } from '@/lib/api/middleware';
import { verifyAccessToken, type JwtUserPayload } from '@/modules/auth/jwt.service';

export interface AuthenticatedRequest extends NextRequest {
  currentUser: JwtUserPayload;
}

export interface AuthGuardOptions {
  roles?: UserRole[];
}

export type AuthenticatedRouteHandler<T extends RouteContext = RouteContext> = (
  req: AuthenticatedRequest,
  context: T
) => Promise<NextResponse>;

/**
 * Reusable RBAC Auth Guard wrapping Next.js Route Handlers.
 * Extracts Bearer JWT, validates HS256 signature, injects `req.currentUser`,
 * and enforces optional `roles` allowlist (401 without token, 403 for insufficient role).
 */
export function withAuth<T extends RouteContext = RouteContext>(
  handler: AuthenticatedRouteHandler<T>,
  options?: AuthGuardOptions
) {
  return withErrorHandler<T>(async (req: NextRequest, context: T) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Missing or malformed Authorization header', 'UNAUTHORIZED');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new AuthError('Access token is required', 'UNAUTHORIZED');
    }

    const user = verifyAccessToken(token);

    if (options?.roles && options.roles.length > 0 && !options.roles.includes(user.role)) {
      throw new ForbiddenError(
        `Role ${user.role} is not authorized to access this resource`,
        'FORBIDDEN'
      );
    }

    const authReq = req as AuthenticatedRequest;
    authReq.currentUser = user;

    return handler(authReq, context);
  });
}
