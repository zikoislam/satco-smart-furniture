import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { DomainRuleError } from '@/lib/api/errors';

export const CreateCategorySchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  nameAr: z.string().min(2).max(255),
  nameEn: z.string().min(2).max(255),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
});

export const CreateProductTemplateSchema = z
  .object({
    categoryId: z.string().uuid(),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
    nameAr: z.string().min(2).max(255),
    nameEn: z.string().min(2).max(255),
    minWidthMm: z.number().int().min(400).max(3600),
    maxWidthMm: z.number().int().min(400).max(3600),
    defaultWidthMm: z.number().int().min(400).max(3600),
    minHeightMm: z.number().int().min(600).max(3200),
    maxHeightMm: z.number().int().min(600).max(3200),
    defaultHeightMm: z.number().int().min(600).max(3200),
    minDepthMm: z.number().int().min(300).max(1000),
    maxDepthMm: z.number().int().min(300).max(1000),
    defaultDepthMm: z.number().int().min(300).max(1000),
    parametricRules: z.record(z.unknown()).default({}),
    basePriceSar: z.string().regex(/^\d+(\.\d{1,4})?$/),
  })
  .refine(
    (d) =>
      d.minWidthMm <= d.defaultWidthMm &&
      d.defaultWidthMm <= d.maxWidthMm &&
      d.minHeightMm <= d.defaultHeightMm &&
      d.defaultHeightMm <= d.maxHeightMm &&
      d.minDepthMm <= d.defaultDepthMm &&
      d.defaultDepthMm <= d.maxDepthMm,
    { message: 'Default dimensions must fall within [min, max] bounds' }
  );

export class CatalogService {
  public static async listPublicTemplates(params: {
    categorySlug?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      category: {
        isActive: true,
        ...(params.categorySlug ? { slug: params.categorySlug } : {}),
      },
    };

    const [templates, total] = await Promise.all([
      prisma.productTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { id: true, slug: true, nameAr: true, nameEn: true },
          },
        },
      }),
      prisma.productTemplate.count({ where }),
    ]);

    return {
      templates: templates.map((t) => ({
        id: t.id,
        slug: t.slug,
        nameAr: t.nameAr,
        nameEn: t.nameEn,
        category: t.category,
        minWidthMm: t.minWidthMm,
        maxWidthMm: t.maxWidthMm,
        minHeightMm: t.minHeightMm,
        maxHeightMm: t.maxHeightMm,
        minDepthMm: t.minDepthMm,
        maxDepthMm: t.maxDepthMm,
        defaultWidthMm: t.defaultWidthMm,
        defaultHeightMm: t.defaultHeightMm,
        defaultDepthMm: t.defaultDepthMm,
        parametricRules: t.parametricRules,
        basePriceSar: t.basePriceSar.toFixed(4),
      })),
      pagination: { page, limit, total },
    };
  }

  public static async listCategories() {
    return prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  public static async createCategory(input: z.infer<typeof CreateCategorySchema>) {
    const data = CreateCategorySchema.parse(input);
    return prisma.category.create({ data });
  }

  public static async createProductTemplate(
    input: z.infer<typeof CreateProductTemplateSchema>
  ) {
    const data = CreateProductTemplateSchema.parse(input);
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw new DomainRuleError('CATEGORY_NOT_FOUND', 'Target category does not exist', undefined, 404);
    }
    return prisma.productTemplate.create({
      data: {
        ...data,
        parametricRules: data.parametricRules as object,
      },
    });
  }
}
