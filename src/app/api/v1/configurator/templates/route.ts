import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { CatalogService } from '@/modules/catalog/catalog.service';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const categorySlug = searchParams.get('category') ?? undefined;
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '20');

  const result = await CatalogService.listPublicTemplates({
    categorySlug,
    page: Number.isFinite(page) ? page : 1,
    limit: Number.isFinite(limit) ? limit : 20,
  });

  return successResponse(result, 'Templates retrieved successfully', 200, 'TEMPLATES_FETCHED');
});
