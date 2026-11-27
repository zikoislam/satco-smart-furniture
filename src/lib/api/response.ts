import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export interface ApiMeta {
  timestamp: string;
  requestId: string;
  [key: string]: unknown;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  code: string;
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorEnvelope {
  success: false;
  type: string;
  title: string;
  status: number;
  code: string;
  message: string;
  detail: string;
  details?: unknown;
  meta: ApiMeta;
}

/**
 * Builds a standardized success JSON response aligned with Api-spac.md Section 1.3.
 */
export function successResponse<T>(
  data: T,
  message = 'OK',
  status = 200,
  code = 'SUCCESS',
  extraMeta?: Record<string, unknown>
): NextResponse<ApiSuccessEnvelope<T>> {
  return NextResponse.json(
    {
      success: true,
      code,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: randomUUID(),
        ...extraMeta,
      },
    },
    { status }
  );
}

/**
 * Builds an RFC 7807 extended error JSON response aligned with Api-spac.md Section 5.2.
 */
export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
  requestId: string = randomUUID()
): NextResponse<ApiErrorEnvelope> {
  return NextResponse.json(
    {
      success: false,
      type: `https://api.satco.sa/errors/${code.toLowerCase().replace(/_/g, '-')}`,
      title: code,
      status,
      code,
      message,
      detail: message,
      ...(details !== undefined ? { details } : {}),
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status }
  );
}
