export const dynamic = 'force-dynamic';
import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { FraudService } from '@/modules/admin/fraud.service';

export const GET = withAuth(
  async () => {
    const result = await FraudService.listBlacklist();
    return successResponse(result, 'Fraud blacklist retrieved.', 200, 'BLACKLIST_RETRIEVED');
  },
  { roles: ['SUPER_ADMIN'] }
);

export const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const entry = await FraudService.addToBlacklist(req.currentUser.sub, body);

    return successResponse(
      { entry },
      `${entry.phone} blocked from placing orders.`,
      201,
      'BLACKLIST_ADDED'
    );
  },
  { roles: ['SUPER_ADMIN'] }
);
