import { withAuth } from '@/lib/api/auth-guard';
import type { RouteContext } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { ProductionService } from '@/modules/production/production.service';

export const PATCH = withAuth<RouteContext<{ jobId: string }>>(
  async (req, context) => {
    const { jobId } = await context.params;
    const body = await req.json();
    const job = await ProductionService.advanceStage(jobId, req.currentUser.sub, body);

    return successResponse({ job }, 'Production stage updated.', 200, 'PRODUCTION_STAGE_UPDATED');
  },
  { roles: ['FACTORY_MANAGER', 'SUPER_ADMIN'] }
);
