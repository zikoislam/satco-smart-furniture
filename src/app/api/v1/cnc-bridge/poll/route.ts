import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { CncBridgeService } from '@/modules/manufacturing/cnc-bridge.service';

export const GET = withErrorHandler(async (req: NextRequest) => {
  CncBridgeService.assertBridgeKey(req.headers.get('x-bridge-key'));
  const result = await CncBridgeService.pollPendingJobs();

  return successResponse(result, 'Pending CNC jobs polled.', 200, 'CNC_POLL_OK');
});
