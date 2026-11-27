import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { CatalogService, CreateProductTemplateSchema } from '@/modules/catalog/catalog.service';

export const POST = withAuth(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = CreateProductTemplateSchema.parse(body);
    const template = await CatalogService.createProductTemplate(parsed);
    return successResponse({ template }, 'Product template created', 201, 'TEMPLATE_CREATED');
  },
  { roles: ['SUPER_ADMIN', 'FACTORY_MANAGER', 'DESIGNER'] }
);
