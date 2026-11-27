import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { randomUUID } from 'crypto';
import { AppError } from '@/lib/api/errors';
import { errorResponse } from '@/lib/api/response';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'otp',
  'secret',
  'nationalId',
  'nationalIdOrIqamaMasked',
]);

/**
 * Masks Saudi mobile numbers and redacts sensitive fields for Saudi PDPL-compliant logging.
 */
export function maskPdplData(input: unknown): unknown {
  if (typeof input === 'string') {
    return input.replace(/(\+?966|0)5\d{5}(\d{3})/g, '+9665*****$2');
  }
  if (Array.isArray(input)) {
    return input.map(maskPdplData);
  }
  if (input !== null && typeof input === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (SENSITIVE_KEYS.has(key)) {
        masked[key] = '[REDACTED]';
      } else {
        masked[key] = maskPdplData(value);
      }
    }
    return masked;
  }
  return input;
}

export type RouteContext<P = Record<string, string | string[]>> = {
  params: Promise<P>;
};

export type RouteHandler<T extends RouteContext = RouteContext> = (
  req: NextRequest,
  context: T
) => Promise<NextResponse>;

/**
 * Higher-order function wrapping Next.js Route Handlers with centralized error
 * mapping, RFC 7807 formatting, and Saudi PDPL-safe error logging.
 */
export function withErrorHandler<T extends RouteContext = RouteContext>(
  handler: RouteHandler<T>
): RouteHandler<T> {
  return async (req: NextRequest, context: T): Promise<NextResponse> => {
    const requestId = req.headers.get('x-request-id') ?? randomUUID();

    try {
      return await handler(req, context);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return errorResponse(
          error.statusCode,
          error.code,
          error.message,
          error.details,
          requestId
        );
      }

      if (error instanceof ZodError) {
        return errorResponse(
          400,
          'VALIDATION_ERROR',
          'Request validation failed',
          error.flatten(),
          requestId
        );
      }

      // Handle Prisma known request errors without importing runtime-only internals tightly
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code?: unknown }).code === 'string'
      ) {
        const prismaCode = (error as { code: string }).code;
        if (prismaCode === 'P2002') {
          return errorResponse(409, 'UNIQUE_CONSTRAINT_VIOLATION', 'Record already exists', undefined, requestId);
        }
        if (prismaCode === 'P2003') {
          return errorResponse(400, 'FOREIGN_KEY_VIOLATION', 'Invalid reference ID', undefined, requestId);
        }
        if (prismaCode === 'P2025') {
          return errorResponse(404, 'RECORD_NOT_FOUND', 'Requested record was not found', undefined, requestId);
        }
      }

      const safeMessage =
        error instanceof Error ? (maskPdplData(error.message) as string) : 'Unexpected server error';
      console.error(`[API Error] requestId=${requestId} path=${req.nextUrl.pathname}`, safeMessage);

      return errorResponse(
        500,
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred',
        undefined,
        requestId
      );
    }
  };
}
