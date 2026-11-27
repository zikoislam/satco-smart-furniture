import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import {
  ProcurementService,
  CreatePurchaseOrderSchema,
} from '@/modules/procurement/procurement.service';
import { verifyAccessToken } from '@/modules/auth/jwt.service';
import { AuthError, ValidationError } from '@/lib/api/errors';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing Authorization token');
  }
  verifyAccessToken(authHeader.substring(7));

  const list = ProcurementService.listPOs();
  return successResponse({ purchaseOrders: list }, 'POs fetched successfully');
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing Authorization token');
  }
  const user = verifyAccessToken(authHeader.substring(7));

  const body = await request.json();
  const parseResult = CreatePurchaseOrderSchema.safeParse(body);
  if (!parseResult.success) {
    throw new ValidationError(
      'Invalid PO creation payload',
      parseResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  const po = await ProcurementService.createPurchaseOrder(user.sub, parseResult.data);
  return successResponse(po, 'Purchase order created successfully', 201);
});
