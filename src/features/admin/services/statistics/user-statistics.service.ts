/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Order } from '../../../orders/entities/order.entity';
import { DateFilter, UserStats } from './types';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class UserStatisticsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getUserStats(dateFilter: DateFilter): Promise<UserStats> {
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      retentionRate,
      growthRate,
      avgLoginFrequency,
      avgOrdersPerUser,
      avgSpendingPerUser,
    ] = await Promise.all([
      this.userRepository.count({
        where: this.transformDateFilter(dateFilter),
      }),
      this.userRepository.count({
        where: {
          is_banned: false,
          ...this.transformDateFilter(dateFilter),
        },
      }),
      this.userRepository.count({
        where: {
          is_banned: true,
          ...this.transformDateFilter(dateFilter),
        },
      }),
      this.calculateRetentionRate(dateFilter),
      this.calculateGrowthRate(dateFilter),
      this.calculateAvgLoginFrequency(),
      this.calculateAvgOrdersPerUser(dateFilter),
      this.calculateAvgSpendingPerUser(dateFilter),
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      banned: bannedUsers,
      retentionRate,
      growthRate,
      avgLoginFrequency,
      avgOrdersPerUser,
      avgSpendingPerUser,
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

  private async calculateRetentionRate(
    dateFilter: DateFilter,
  ): Promise<number> {
    const now = dateFilter?.where?.createdAt?.['$lte'] || new Date();
    const oneMonthAgo = subMonths(now, 1);
    const twoMonthsAgo = subMonths(now, 2);

    const previousMonthUsers = await this.userRepository.count({
      where: {
        createdAt: Between(twoMonthsAgo, oneMonthAgo),
        is_banned: false,
      },
    });

    if (previousMonthUsers === 0) {
      return 0;
    }

    const activeUsers = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(DISTINCT order.user_id)', 'count')
      .where('order.createdAt BETWEEN :start AND :end', {
        start: oneMonthAgo,
        end: now,
      })
      .getRawOne();

    return (Number(activeUsers?.count) / previousMonthUsers) * 100;
  }

  private async calculateGrowthRate(dateFilter: DateFilter): Promise<number> {
    const now = dateFilter?.where?.createdAt?.['$lte'] || new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    const [currentMonthUsers, previousMonthUsers] = await Promise.all([
      this.userRepository.count({
        where: {
          createdAt: Between(currentMonthStart, currentMonthEnd),
        },
      }),
      this.userRepository.count({
        where: {
          createdAt: Between(previousMonthStart, previousMonthEnd),
        },
      }),
    ]);

    if (previousMonthUsers === 0) {
      return currentMonthUsers > 0 ? 100 : 0;
    }

    return (
      ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100
    );
  }

  private calculateAvgLoginFrequency(): number {
    // TODO: Implement actual login tracking
    // For now, return a placeholder value
    // In a real app, you would:
    // 1. Track user logins in a separate table
    // 2. Count logins per user over the last 30 days
    // 3. Calculate the average
    return 0;
  }

  private async calculateAvgOrdersPerUser(
    dateFilter: DateFilter,
  ): Promise<number> {
    const totalUsers = await this.userRepository.count({
      where: {
        is_banned: false,
        ...this.transformDateFilter(dateFilter),
      },
    });

    if (totalUsers === 0) {
      return 0;
    }

    const totalOrders = await this.orderRepository.count({
      where: this.transformDateFilter(dateFilter),
    });

    return totalOrders / totalUsers;
  }

  private async calculateAvgSpendingPerUser(
    dateFilter: DateFilter,
  ): Promise<number> {
    const totalUsers = await this.userRepository.count({
      where: {
        is_banned: false,
        ...this.transformDateFilter(dateFilter),
      },
    });

    if (totalUsers === 0) {
      return 0;
    }

    const totalSpending = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_price)', 'total')
      .where(this.transformDateFilter(dateFilter))
      .getRawOne();

    return Number(totalSpending?.total || 0) / totalUsers;
  }
}
