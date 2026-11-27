import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { GenerateConceptInputSchema } from '@/modules/ai-studio/ai-studio.types';
import { aiService } from '@/modules/ai-studio/ai-studio.service';
import { ValidationError } from '@/lib/api/errors';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const parseResult = GenerateConceptInputSchema.safeParse(body);

  if (!parseResult.success) {
    throw new ValidationError(
      'Invalid AI concept generation input',
      parseResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  const concept = await aiService.generateRoomConcept(parseResult.data);
  return successResponse(concept, 'Concept generated successfully', 201);
});
