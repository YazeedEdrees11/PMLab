import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getFinancialStats(branchId?: string) {
    const baseWhere: any = { status: 'COMPLETED' };
    if (branchId && branchId !== 'all') baseWhere.branchId = branchId;

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    };

    const getPeriodRange = (days: number) => {
      const currentStart = new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000);
      const previousStart = new Date(currentStart.getTime() - days * 24 * 60 * 60 * 1000);
      return { currentStart, previousStart, currentEnd: new Date(), previousEnd: currentStart };
    };

    const getStatsForRange = async (start: Date, end: Date) => {
      const appointments = await this.prisma.appointment.findMany({
        where: { ...baseWhere, date: { gte: start, lte: end } },
        include: {
          testItems: {
            include: { test: true }
          }
        }
      });

      let revenue = 0;
      let cost = 0;
      appointments.forEach(apt => {
        revenue += apt.totalPrice || 0;
        apt.testItems.forEach(at => {
          cost += at.test.cost || 0;
        });
      });

      return { revenue, cost, profit: revenue - cost, count: appointments.length };
    };

    const periods = [
      { key: 'daily', days: 1 },
      { key: 'weekly', days: 7 },
      { key: 'monthly', days: 30 },
      { key: 'yearly', days: 365 },
    ];

    const result: any = {};
    for (const p of periods) {
      const range = getPeriodRange(p.days);
      const current = await getStatsForRange(range.currentStart, range.currentEnd);
      const previous = await getStatsForRange(range.previousStart, range.previousEnd);
      result[p.key] = {
        ...current,
        trend: calculateTrend(current.revenue, previous.revenue)
      };
    }

    const allTimeStats = await this.prisma.appointment.aggregate({
      where: baseWhere,
      _sum: { totalPrice: true },
      _count: true,
    });

    const branches = await this.prisma.branch.findMany();
    const branchesFinancials = await Promise.all(branches.map(async (branch) => {
      const stats = await this.prisma.appointment.aggregate({
        where: { status: 'COMPLETED', branchId: branch.id },
        _sum: { totalPrice: true },
        _count: true,
      });
      return {
        id: branch.id,
        name: branch.name,
        nameAr: branch.nameAr,
        revenue: stats._sum.totalPrice || 0,
        bookings: stats._count,
      };
    }));

    // Get Top Performing Tests
    const topTests = await this.prisma.appointmentTest.groupBy({
      by: ['testId'],
      _count: { testId: true },
      where: { appointment: { status: 'COMPLETED', ...(branchId && branchId !== 'all' ? { branchId } : {}) } },
      orderBy: { _count: { testId: 'desc' } },
      take: 5
    });

    const topTestsWithData = await Promise.all(topTests.map(async (item) => {
      const test = await this.prisma.test.findUnique({ where: { id: item.testId } });
      return {
        name: test?.name,
        nameAr: test?.nameAr,
        count: item._count.testId,
        revenue: (test?.price || 0) * item._count.testId
      };
    }));

    // Get Recent Transactions
    const recentTransactions = await this.prisma.appointment.findMany({
      where: { status: 'COMPLETED', ...(branchId && branchId !== 'all' ? { branchId } : {}) },
      include: {
        patient: { select: { name: true } },
        branch: { select: { name: true, nameAr: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Get last 6 months history
    const history = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);

      const stats = await getStatsForRange(start, end);
      history.push({
        month: start.toLocaleDateString('en-US', { month: 'short' }),
        revenue: stats.revenue,
        profit: stats.profit
      });
    }

    return {
      ...result,
      allTime: { revenue: allTimeStats._sum.totalPrice || 0, count: allTimeStats._count },
      branches: branchesFinancials,
      topTests: topTestsWithData,
      recentTransactions,
      history
    };
  }
}
