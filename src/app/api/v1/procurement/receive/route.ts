import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import {
  ProcurementService,
  ReceivePOLineSchema,
} from '@/modules/procurement/procurement.service';
import { verifyAccessToken } from '@/modules/auth/jwt.service';
import { AuthError, ValidationError } from '@/lib/api/errors';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing Authorization token');
  }
  const user = verifyAccessToken(authHeader.substring(7));

  const body = await request.json();
  const parseResult = ReceivePOLineSchema.safeParse(body);
  if (!parseResult.success) {
    throw new ValidationError(
      'Invalid PO receiving payload',
      parseResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  const result = await ProcurementService.receivePOLine(user.sub, parseResult.data);
  return successResponse(result, 'Material received to bin successfully', 200);
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing Authorization token');
  }
  verifyAccessToken(authHeader.substring(7));

  const bins = ProcurementService.listBinStock();
  return successResponse({ warehouseBins: bins }, 'Bin stock fetched successfully');
});
