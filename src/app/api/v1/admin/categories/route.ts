import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { CatalogService, CreateCategorySchema } from '@/modules/catalog/catalog.service';

export const GET = withAuth(
  async () => {
    const categories = await CatalogService.listCategories();
    return successResponse({ categories }, 'Categories retrieved', 200, 'CATEGORIES_FETCHED');
  },
  { roles: ['SUPER_ADMIN', 'FACTORY_MANAGER', 'DESIGNER', 'ESTIMATOR'] }
);

export const POST = withAuth(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = CreateCategorySchema.parse(body);
    const category = await CatalogService.createCategory(parsed);
    return successResponse({ category }, 'Category created', 201, 'CATEGORY_CREATED');
  },
  { roles: ['SUPER_ADMIN', 'FACTORY_MANAGER'] }
);
