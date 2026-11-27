export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'satco-furniture-platform',
      region: process.env.GCP_REGION || 'me-central2',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
