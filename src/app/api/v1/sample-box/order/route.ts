export const dynamic = 'force-dynamic';
import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { SampleBoxService } from '@/modules/sample-box/sample-box.service';

export const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const result = await SampleBoxService.orderSampleBox(req.currentUser.sub, body);

    return successResponse(
      result,
      'Material sample box ordered successfully.',
      201,
      'SAMPLE_BOX_ORDERED'
    );
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN'] }
);
