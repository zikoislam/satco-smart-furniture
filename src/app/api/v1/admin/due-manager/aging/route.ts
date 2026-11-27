import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { DueManagerService } from '@/modules/admin/due-manager.service';

export const GET = withAuth(
  async () => {
    const report = await DueManagerService.getAgingReport();
    return successResponse(
      report,
      'Accounts receivable aging report generated.',
      200,
      'AGING_REPORT_GENERATED'
    );
  },
  { roles: ['SUPER_ADMIN', 'FACTORY_MANAGER'] }
);
