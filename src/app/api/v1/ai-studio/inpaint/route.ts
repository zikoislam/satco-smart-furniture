import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import {
  AIRoomInpaintingService,
  RoomInpaintingInputSchema,
} from '@/modules/ai-studio/ai-inpainting.service';
import { ValidationError } from '@/lib/api/errors';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const parseResult = RoomInpaintingInputSchema.safeParse(body);

  if (!parseResult.success) {
    throw new ValidationError(
      'Invalid in-painting photo or parameters',
      parseResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  const result = await AIRoomInpaintingService.processRoomInpainting(parseResult.data);
  return successResponse(result, 'Room photo in-painted successfully with AI furniture', 201);
});
