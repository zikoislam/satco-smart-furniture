import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { InstallationService } from '@/modules/installation/installation.service';

export const GET = withAuth(
  async (req) => {
    const result = await InstallationService.listAssignedJobs(req.currentUser.sub);
    return successResponse(result, 'Assigned installation jobs retrieved', 200, 'JOBS_LISTED');
  },
  { roles: ['INSTALLER_TECHNICIAN', 'SUPER_ADMIN'] }
);
