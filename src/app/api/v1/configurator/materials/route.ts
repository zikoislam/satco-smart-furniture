export const dynamic = 'force-dynamic';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { MaterialsService } from '@/modules/catalog/materials.service';

export const GET = withErrorHandler(async () => {
  const catalog = await MaterialsService.getActiveMaterialsCatalog();
  return successResponse(catalog, 'Materials catalog retrieved', 200, 'MATERIALS_FETCHED');
});
