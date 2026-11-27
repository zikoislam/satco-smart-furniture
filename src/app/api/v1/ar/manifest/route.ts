export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import {
  ARVisualizationService,
  ARModelExportInputSchema,
} from '@/modules/ar/ar.service';
import { ValidationError } from '@/lib/api/errors';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const parseResult = ARModelExportInputSchema.safeParse(body);
  if (!parseResult.success) {
    throw new ValidationError('Invalid AR export parameters', parseResult.error.errors);
  }

  const manifest = ARVisualizationService.generateARManifest(parseResult.data);
  return successResponse(manifest, 'AR manifest generated with 1:1 scale calibration');
});
