export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { CouponService, CreateCouponSchema } from '@/modules/pricing/coupon.service';

export const GET = withAuth(
  async () => {
    const coupons = await CouponService.listCoupons();
    return successResponse({ coupons }, 'Coupons retrieved', 200, 'COUPONS_FETCHED');
  },
  { roles: ['SUPER_ADMIN', 'FACTORY_MANAGER'] }
);

export const POST = withAuth(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = CreateCouponSchema.parse(body);
    const coupon = await CouponService.createCoupon(parsed);
    return successResponse({ coupon }, 'Coupon created', 201, 'COUPON_CREATED');
  },
  { roles: ['SUPER_ADMIN'] }
);
