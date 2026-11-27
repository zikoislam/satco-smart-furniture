export const dynamic = 'force-dynamic';
import { withAuth } from '@/lib/api/auth-guard';
import type { RouteContext } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { InstallationService } from '@/modules/installation/installation.service';

export const POST = withAuth<RouteContext<{ jobId: string }>>(
  async (req, context) => {
    const { jobId } = await context.params;
    const body = await req.json();
    const result = await InstallationService.completeInstallation(
      jobId,
      req.currentUser.sub,
      req.currentUser.role,
      body
    );

    return successResponse(
      result,
      'Installation handover completed and Milestone 3 unlocked.',
      200,
      'HANDOVER_COMPLETED'
    );
  },
  { roles: ['INSTALLER_TECHNICIAN', 'SUPER_ADMIN'] }
);
