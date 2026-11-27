import { prisma } from '@/lib/prisma';
import { Decimal, toDecimal } from '@/lib/decimal';

interface AgingBucket {
  count: number;
  totalDue: Decimal;
}

export class DueManagerService {
  /**
   * Computes Accounts Receivable 30/60/90+ day overdue aging buckets
   * across unpaid MilestonePayments using exact Decimal.js arithmetic.
   */
  public static async getAgingReport(referenceDate: Date = new Date()) {
    const unpaidMilestones = await prisma.milestonePayment.findMany({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
      },
      select: {
        amountSar: true,
        dueDate: true,
      },
    });

    const buckets: Record<
      'currentUnder30Days' | 'aging31To60Days' | 'aging61To90Days' | 'agingOver90Days',
      AgingBucket
    > = {
      currentUnder30Days: { count: 0, totalDue: new Decimal(0) },
      aging31To60Days: { count: 0, totalDue: new Decimal(0) },
      aging61To90Days: { count: 0, totalDue: new Decimal(0) },
      agingOver90Days: { count: 0, totalDue: new Decimal(0) },
    };

    let totalOverdue = new Decimal(0);
    const msPerDay = 24 * 60 * 60 * 1000;

    for (const item of unpaidMilestones) {
      const amount = toDecimal(item.amountSar.toString());
      const daysOverdue = Math.max(
        0,
        Math.floor((referenceDate.getTime() - item.dueDate.getTime()) / msPerDay)
      );

      totalOverdue = totalOverdue.plus(amount);

      if (daysOverdue <= 30) {
        buckets.currentUnder30Days.count += 1;
        buckets.currentUnder30Days.totalDue = buckets.currentUnder30Days.totalDue.plus(amount);
      } else if (daysOverdue <= 60) {
        buckets.aging31To60Days.count += 1;
        buckets.aging31To60Days.totalDue = buckets.aging31To60Days.totalDue.plus(amount);
      } else if (daysOverdue <= 90) {
        buckets.aging61To90Days.count += 1;
        buckets.aging61To90Days.totalDue = buckets.aging61To90Days.totalDue.plus(amount);
      } else {
        buckets.agingOver90Days.count += 1;
        buckets.agingOver90Days.totalDue = buckets.agingOver90Days.totalDue.plus(amount);
      }
    }

    return {
      totalOverdueSar: totalOverdue.toFixed(2),
      buckets: {
        currentUnder30Days: {
          count: buckets.currentUnder30Days.count,
          totalDueSar: buckets.currentUnder30Days.totalDue.toFixed(2),
        },
        aging31To60Days: {
          count: buckets.aging31To60Days.count,
          totalDueSar: buckets.aging31To60Days.totalDue.toFixed(2),
        },
        aging61To90Days: {
          count: buckets.aging61To90Days.count,
          totalDueSar: buckets.aging61To90Days.totalDue.toFixed(2),
        },
        agingOver90Days: {
          count: buckets.agingOver90Days.count,
          totalDueSar: buckets.agingOver90Days.totalDue.toFixed(2),
        },
      },
    };
  }
}
