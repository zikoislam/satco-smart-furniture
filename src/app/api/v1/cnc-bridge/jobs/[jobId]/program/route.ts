export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler, type RouteContext } from '@/lib/api/middleware';
import { CncBridgeService } from '@/modules/manufacturing/cnc-bridge.service';

export const GET = withErrorHandler<RouteContext<{ jobId: string }>>(
  async (req: NextRequest, context) => {
    CncBridgeService.assertBridgeKey(req.headers.get('x-bridge-key'));
    const { jobId } = await context.params;
    const { filename, buffer } = await CncBridgeService.getProgramBinary(jobId);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }
);
