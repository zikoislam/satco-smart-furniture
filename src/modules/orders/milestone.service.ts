import { MilestoneNumber, Prisma } from '@prisma/client';
import { calculateMilestones, Decimal } from '@/lib/decimal';

export interface CreatedMilestoneSummary {
  milestone: MilestoneNumber;
  percentage: number;
  amountSar: string;
  status: string;
  description: string;
}

const MILESTONE_DEFINITIONS: Array<{
  milestone: MilestoneNumber;
  percentage: number;
  description: string;
  dueDaysOffset: number;
}> = [
  {
    milestone: 'MILESTONE_1_DEPOSIT',
    percentage: 50,
    description: '50% Commitment Deposit required to start CNC manufacturing',
    dueDaysOffset: 3,
  },
  {
    milestone: 'MILESTONE_2_PRE_DISPATCH',
    percentage: 40,
    description: '40% Pre-Dispatch Balance required before factory truck departs',
    dueDaysOffset: 14,
  },
  {
    milestone: 'MILESTONE_3_HANDOVER',
    percentage: 10,
    description: '10% Final Balance collected on site upon digital e-signature',
    dueDaysOffset: 21,
  },
];

export class MilestoneService {
  /**
   * Generates the 3-stage SATCO milestone payment schedule (50% / 40% / 10%)
   * with zero-penny discrepancy against grandTotalSar.
   */
  public static async createOrderMilestones(
    tx: Prisma.TransactionClient,
    orderId: string,
    grandTotalSar: Decimal
  ): Promise<CreatedMilestoneSummary[]> {
    const split = calculateMilestones(grandTotalSar);
    const amountByMilestone: Record<MilestoneNumber, Decimal> = {
      MILESTONE_1_DEPOSIT: split.milestone1Deposit,
      MILESTONE_2_PRE_DISPATCH: split.milestone2PreDispatch,
      MILESTONE_3_HANDOVER: split.milestone3Handover,
    };

    const now = Date.now();
    const summaries: CreatedMilestoneSummary[] = [];

    for (const def of MILESTONE_DEFINITIONS) {
      const amount = amountByMilestone[def.milestone];
      const dueDate = new Date(now + def.dueDaysOffset * 24 * 60 * 60 * 1000);

      await tx.milestonePayment.create({
        data: {
          orderId,
          milestone: def.milestone,
          percentage: def.percentage.toFixed(2),
          amountSar: amount.toFixed(4),
          status: 'PENDING',
          dueDate,
        },
      });

      summaries.push({
        milestone: def.milestone,
        percentage: def.percentage,
        amountSar: amount.toFixed(2),
        status: 'PENDING',
        description: def.description,
      });
    }

    return summaries;
  }
}
