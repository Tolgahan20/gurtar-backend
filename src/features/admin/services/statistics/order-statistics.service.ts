import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../../orders/entities/order.entity';
import { DateFilter } from './types';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Between } from 'typeorm';

interface OrderStats {
  totalCo2Saved: string | null;
  totalMoneySaved: string | null;
  totalAmount: string | null;
}

interface OrderTrends {
  hour: string;
  count: string;
}

interface OrderTrendsByTime {
  peak_hours: { [hour: string]: number };
  peak_days: { [day: string]: number };
  peak_months: { [month: string]: number };
}

@Injectable()
export class OrderStatisticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async calculateOrderStats(dateFilter: DateFilter) {
    const [totalOrders, orderStats, seasonalTrends] = await Promise.all([
      this.orderRepository.count({
        where: this.transformDateFilter(dateFilter),
      }),
      this.calculateOrderSavings(dateFilter),
      this.calculateSeasonalTrends(dateFilter),
    ]);

    const previousOrders = await this.calculatePreviousPeriodOrders(dateFilter);
    const orderTrend = this.calculateTrendAnalysis(
      totalOrders,
      previousOrders,
      'increase_is_good',
    );

    return {
      total: totalOrders,
      totalCo2Saved: Number(orderStats?.totalCo2Saved) || 0,
      totalMoneySaved: Number(orderStats?.totalMoneySaved) || 0,
      avgOrderValue:
        totalOrders > 0 ? Number(orderStats?.totalMoneySaved) / totalOrders : 0,
      avgCo2SavedPerOrder:
        totalOrders > 0 ? Number(orderStats?.totalCo2Saved) / totalOrders : 0,
      growthRate: orderTrend.trend,
      peakHours: seasonalTrends.peak_hours,
      peakDays: seasonalTrends.peak_days,
    };
  }

  private transformDateFilter(dateFilter: DateFilter): { createdAt?: any } {
    if (!dateFilter?.where?.createdAt) {
      return {};
    }

    const { $gte, $lte } = dateFilter.where.createdAt as {
      $gte?: Date;
      $lte?: Date;
    };

    const startDate = $gte || new Date(0);
    const endDate = $lte || new Date();

    return {
      createdAt: Between(startDate, endDate),
    };
  }

  private async calculateOrderSavings(
    dateFilter: DateFilter,
  ): Promise<OrderStats> {
    const result = await this.orderRepository
      .createQueryBuilder('ord')
      .select('SUM(ord.co2_saved_kg)', 'totalCo2Saved')
      .addSelect('SUM(ord.money_saved)', 'totalMoneySaved')
      .addSelect('SUM(ord.total_price)', 'totalAmount')
      .where(this.transformDateFilter(dateFilter))
      .getRawOne<OrderStats>();

    return (
      result || {
        totalCo2Saved: null,
        totalMoneySaved: null,
        totalAmount: null,
      }
    );
  }

  private async calculatePreviousPeriodOrders(
    dateFilter: DateFilter,
  ): Promise<number> {
    const now =
      (dateFilter?.where?.createdAt as { $lte?: Date })?.$lte || new Date();
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    return this.orderRepository.count({
      where: {
        createdAt: Between(previousMonthStart, previousMonthEnd),
      },
    });
  }

  private async calculateSeasonalTrends(
    dateFilter: DateFilter,
  ): Promise<OrderTrendsByTime> {
    const [hourlyTrends, dailyTrends, monthlyTrends] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('ord')
        .select('EXTRACT(HOUR FROM ord.createdAt)', 'hour')
        .addSelect('COUNT(*)', 'count')
        .where(this.transformDateFilter(dateFilter))
        .groupBy('hour')
        .orderBy('count', 'DESC')
        .getRawMany<OrderTrends>(),
      this.orderRepository
        .createQueryBuilder('ord')
        .select('EXTRACT(DOW FROM ord.createdAt)', 'day')
        .addSelect('COUNT(*)', 'count')
        .where(this.transformDateFilter(dateFilter))
        .groupBy('day')
        .orderBy('count', 'DESC')
        .getRawMany<OrderTrends>(),
      this.orderRepository
        .createQueryBuilder('ord')
        .select('EXTRACT(MONTH FROM ord.createdAt)', 'month')
        .addSelect('COUNT(*)', 'count')
        .where(this.transformDateFilter(dateFilter))
        .groupBy('month')
        .orderBy('count', 'DESC')
        .getRawMany<OrderTrends>(),
    ]);

    return {
      peak_hours: hourlyTrends.reduce<{ [hour: string]: number }>(
        (acc, { hour, count }) => {
          acc[hour] = Number(count);
          return acc;
        },
        {},
      ),
      peak_days: dailyTrends.reduce<{ [day: string]: number }>(
        (acc, { hour: day, count }) => {
          acc[day] = Number(count);
          return acc;
        },
        {},
      ),
      peak_months: monthlyTrends.reduce<{ [month: string]: number }>(
        (acc, { hour: month, count }) => {
          acc[month] = Number(count);
          return acc;
        },
        {},
      ),
    };
  }

  private calculateTrendAnalysis(
    currentValue: number,
    previousValue: number,
    type: 'increase_is_good' | 'decrease_is_good',
  ) {
    if (previousValue === 0) {
      return {
        trend: currentValue > 0 ? 100 : 0,
        status: currentValue > 0 ? 'improving' : 'stable',
        percentageChange: currentValue > 0 ? 100 : 0,
      };
    }

    const percentageChange =
      ((currentValue - previousValue) / previousValue) * 100;
    const isImproving =
      (type === 'increase_is_good' && percentageChange > 0) ||
      (type === 'decrease_is_good' && percentageChange < 0);

    return {
      trend: percentageChange,
      status: isImproving ? 'improving' : 'declining',
      percentageChange,
    };
  }
}
