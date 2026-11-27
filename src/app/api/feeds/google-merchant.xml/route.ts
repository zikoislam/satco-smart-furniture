import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { MerchantFeedService } from '@/modules/feeds/merchant-feed.service';

export const GET = withErrorHandler(async () => {
  const xml = await MerchantFeedService.generateXmlFeed('google');
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
});
