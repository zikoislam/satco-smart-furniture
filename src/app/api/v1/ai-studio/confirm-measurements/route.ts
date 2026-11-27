export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { RoomMeasurementConfirmationSchema } from '@/modules/ai-studio/ai-studio.types';
import { aiService } from '@/modules/ai-studio/ai-studio.service';
import { verifyAccessToken } from '@/modules/auth/jwt.service';
import { AuthError, ValidationError, NotFoundError } from '@/lib/api/errors';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7);
  const tokenPayload = verifyAccessToken(token);

  const body = await request.json();
  const parseResult = RoomMeasurementConfirmationSchema.safeParse(body);

  if (!parseResult.success) {
    throw new ValidationError(
      'Invalid room measurement confirmation input',
      parseResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  const concept = aiService.getConceptById(parseResult.data.conceptId);
  if (!concept) {
    throw new NotFoundError(`AI Concept with ID ${parseResult.data.conceptId} not found`);
  }

  const result = await aiService.confirmRoomMeasurements(
    parseResult.data,
    tokenPayload.sub
  );

  return successResponse(result, 'Room measurements confirmed successfully', 200);
});
