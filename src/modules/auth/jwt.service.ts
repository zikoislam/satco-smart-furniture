import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import { AuthError } from '@/lib/api/errors';

export interface JwtUserPayload {
  sub: string;
  role: UserRole;
  phone?: string;
  email?: string | null;
  companyId?: string | null;
}

const DEFAULT_CUSTOMER_EXPIRY_SECONDS = 604800; // 7 days
const DEFAULT_STAFF_EXPIRY_SECONDS = 28800; // 8 hours

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    return 'satco-dev-jwt-secret-change-in-production';
  }
  return secret;
}

/**
 * Signs an HS256 JWT access token for customer or staff authentication.
 */
export function signAccessToken(
  payload: JwtUserPayload,
  expiresInSeconds?: number
): { accessToken: string; expiresIn: number } {
  const ttl =
    expiresInSeconds ??
    (payload.role === 'CUSTOMER' ? DEFAULT_CUSTOMER_EXPIRY_SECONDS : DEFAULT_STAFF_EXPIRY_SECONDS);

  const options: SignOptions = {
    algorithm: 'HS256',
    expiresIn: ttl,
    issuer: 'satco-platform',
  };

  const accessToken = jwt.sign(payload, getJwtSecret(), options);
  return { accessToken, expiresIn: ttl };
}

/**
 * Verifies an HS256 Bearer JWT and returns the decoded user payload.
 */
export function verifyAccessToken(token: string): JwtUserPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: 'satco-platform',
    }) as jwt.JwtPayload & JwtUserPayload;

    if (!decoded.sub || !decoded.role) {
      throw new AuthError('Invalid token payload', 'INVALID_TOKEN');
    }

    return {
      sub: decoded.sub,
      role: decoded.role,
      phone: decoded.phone,
      email: decoded.email ?? null,
      companyId: decoded.companyId ?? null,
    };
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError('Invalid or expired access token', 'INVALID_TOKEN');
  }
}
