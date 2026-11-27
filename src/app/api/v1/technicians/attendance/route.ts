import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import {
  FieldServiceHR,
  CheckInSchema,
  UpdateJobSiteStatusSchema,
} from '@/modules/field-service/field-service.service';
import { verifyAccessToken } from '@/modules/auth/jwt.service';
import { AuthError, ValidationError } from '@/lib/api/errors';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing Authorization token');
  }
  const user = verifyAccessToken(authHeader.substring(7));

  const body = await request.json();
  const action = request.nextUrl.searchParams.get('action') || 'check-in';

  if (action === 'check-in') {
    const parseResult = CheckInSchema.safeParse(body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid GPS or check-in payload');
    }
    const record = await FieldServiceHR.recordCheckIn(user.sub, parseResult.data);
    return successResponse(record, 'Technician check-in recorded', 201);
  }

  if (action === 'update-status') {
    const parseResult = UpdateJobSiteStatusSchema.safeParse(body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid job site status payload');
    }
    const record = await FieldServiceHR.updateFieldStatus(user.sub, parseResult.data);
    return successResponse(record, 'Job site status updated', 200);
  }

  if (action === 'check-out') {
    const record = await FieldServiceHR.recordCheckOut(user.sub);
    return successResponse(record, 'Shift checkout completed', 200);
  }

  throw new ValidationError(`Unsupported action: ${action}`);
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing Authorization token');
  }
  verifyAccessToken(authHeader.substring(7));

  const activeStaff = FieldServiceHR.listActiveFieldStaff();
  return successResponse({ activeStaff }, 'Active field staff list retrieved');
});
