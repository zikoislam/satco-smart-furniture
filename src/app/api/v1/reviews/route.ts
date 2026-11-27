export const dynamic = 'force-dynamic';
import { withErrorHandler } from '@/lib/api/middleware';
import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { ReviewService } from '@/modules/reviews/review.service';

export const GET = withErrorHandler(async () => {
  const result = await ReviewService.listApprovedReviews();
  return successResponse(result, 'Approved reviews retrieved.', 200, 'REVIEWS_LISTED');
});

export const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const review = await ReviewService.submitVerifiedReview(req.currentUser.sub, body);

    return successResponse(
      { review },
      'Review submitted for moderation.',
      201,
      'REVIEW_SUBMITTED'
    );
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN'] }
);
