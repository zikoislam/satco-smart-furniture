import { withAuth } from '@/lib/api/auth-guard';
import type { RouteContext } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { ReviewService } from '@/modules/reviews/review.service';

export const PATCH = withAuth<RouteContext<{ reviewId: string }>>(
  async (req, context) => {
    const { reviewId } = await context.params;
    const body = await req.json();
    const review = await ReviewService.moderateReview(
      req.currentUser.sub,
      reviewId,
      body
    );

    return successResponse(
      { review },
      `Review ${review.status.toLowerCase()}.`,
      200,
      'REVIEW_MODERATED'
    );
  },
  { roles: ['SUPER_ADMIN', 'FACTORY_MANAGER'] }
);
