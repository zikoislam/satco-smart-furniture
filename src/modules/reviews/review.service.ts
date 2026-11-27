import { z } from 'zod';
import { Prisma, ReviewStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DomainRuleError, ForbiddenError, NotFoundError } from '@/lib/api/errors';

export const SubmitReviewSchema = z.object({
  orderId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  commentAr: z.string().max(2000).optional(),
  commentEn: z.string().max(2000).optional(),
  mediaUrls: z.array(z.string().url()).max(5).default([]),
});

export const ModerateReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export class ReviewService {
  /**
   * Lists public approved customer reviews.
   */
  public static async listApprovedReviews() {
    const reviews = await prisma.review.findMany({
      where: { status: 'APPROVED' },
      include: {
        customer: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { reviews };
  }

  /**
   * Submits a verified post-delivery buyer review (requires DELIVERED or HANDOVER_COMPLETED).
   */
  public static async submitVerifiedReview(
    customerId: string,
    rawInput: z.infer<typeof SubmitReviewSchema>
  ) {
    const input = SubmitReviewSchema.parse(rawInput);

    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      select: { id: true, customerId: true, status: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenError('You can only review your own orders', 'FORBIDDEN');
    }

    if (order.status !== 'HANDOVER_COMPLETED' && order.status !== 'DELIVERED') {
      throw new DomainRuleError(
        'ORDER_NOT_DELIVERED',
        'Verified reviews can only be submitted after delivery or handover completion.',
        { currentStatus: order.status },
        422
      );
    }

    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        customerId,
        rating: input.rating,
        commentAr: input.commentAr,
        commentEn: input.commentEn,
        mediaUrlsJson: input.mediaUrls as Prisma.InputJsonValue,
        status: 'PENDING_MODERATION',
      },
    });

    return review;
  }

  /**
   * Admin moderation queue action (APPROVED / REJECTED).
   */
  public static async moderateReview(
    adminId: string,
    reviewId: string,
    rawInput: z.infer<typeof ModerateReviewSchema>
  ) {
    const input = ModerateReviewSchema.parse(rawInput);

    const existing = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing) {
      throw new NotFoundError('Review not found', 'REVIEW_NOT_FOUND');
    }

    return prisma.review.update({
      where: { id: reviewId },
      data: {
        status: input.status as ReviewStatus,
        moderatedBy: adminId,
        moderatedAt: new Date(),
      },
    });
  }
}
