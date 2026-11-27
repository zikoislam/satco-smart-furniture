export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { withErrorHandler, type RouteContext } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { CncBridgeService } from '@/modules/manufacturing/cnc-bridge.service';

export const POST = withErrorHandler<RouteContext<{ jobId: string }>>(
  async (req: NextRequest, context) => {
    CncBridgeService.assertBridgeKey(req.headers.get('x-bridge-key'));
    const { jobId } = await context.params;
    const body = await req.json();
    const result = await CncBridgeService.updateJobStatus(jobId, body);

    return successResponse(result, 'CNC job status acknowledged.', 200, 'STATUS_ACKNOWLEDGED');
  }
);
