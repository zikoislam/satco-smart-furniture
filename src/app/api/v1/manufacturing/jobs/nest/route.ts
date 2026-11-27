export const dynamic = 'force-dynamic';
import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { NestingOptimizerService } from '@/modules/manufacturing/nesting-optimizer.service';

export const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const result = await NestingOptimizerService.nestOrderJob(body);

    return successResponse(
      result,
      'Guillotine-2D nesting optimization completed.',
      200,
      'NESTING_COMPLETED'
    );
  },
  { roles: ['FACTORY_MANAGER', 'SUPER_ADMIN'] }
);
