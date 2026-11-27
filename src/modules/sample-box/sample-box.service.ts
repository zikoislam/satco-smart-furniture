import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { SaudiNationalAddressSchema } from '@/lib/validation/saudi-validators';

export const OrderSampleBoxSchema = z.object({
  shippingAddress: SaudiNationalAddressSchema,
  preferredFinishes: z.array(z.string().min(1)).max(10).default([]),
});

const SAMPLE_BOX_FEE_SAR = '100.0000';

export class SampleBoxService {
  /**
   * Orders a 100 SAR refundable Material Sample Box.
   * Fee is automatically credited toward the customer's first furniture order > 2,000 SAR.
   */
  public static async orderSampleBox(
    userId: string,
    rawInput: z.infer<typeof OrderSampleBoxSchema>
  ) {
    const input = OrderSampleBoxSchema.parse(rawInput);

    const record = await prisma.materialSampleBoxOrder.create({
      data: {
        userId,
        sampleBoxFeeSar: SAMPLE_BOX_FEE_SAR,
        isRefundedOrApplied: false,
        shippingAddressJson: {
          ...input.shippingAddress,
          preferredFinishes: input.preferredFinishes,
        } as Prisma.InputJsonValue,
        status: 'ORDERED',
      },
    });

    return {
      sampleBoxOrderId: record.id,
      feeSar: '100.00',
      creditPolicy:
        '100.00 SAR will be automatically deducted from your first furniture order exceeding 2,000 SAR.',
      status: record.status,
    };
  }
}
