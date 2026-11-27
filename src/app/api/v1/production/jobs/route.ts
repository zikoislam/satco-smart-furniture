import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { ProductionService } from '@/modules/production/production.service';

export const GET = withAuth(
  async () => {
    const result = await ProductionService.listProductionJobs();
    return successResponse(result, 'Production jobs retrieved.', 200, 'PRODUCTION_JOBS_LISTED');
  },
  { roles: ['FACTORY_MANAGER', 'SUPER_ADMIN'] }
);

export const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const job = await ProductionService.createProductionJob(body);
    return successResponse({ job }, 'Production job created.', 201, 'PRODUCTION_JOB_CREATED');
  },
  { roles: ['FACTORY_MANAGER', 'SUPER_ADMIN'] }
);
