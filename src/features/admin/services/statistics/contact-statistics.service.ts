import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ContactMessage } from '../../../contact/entities/contact-message.entity';
import { DateFilter } from './types';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

interface ContactStats {
  total: number;
  pending: number;
  resolved: number;
  trend: number;
  status: 'improving' | 'declining' | 'stable';
}

@Injectable()
export class ContactStatisticsService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepository: Repository<ContactMessage>,
  ) {}

  async calculateContactStats(dateFilter: DateFilter): Promise<ContactStats> {
    const [totalMessages, pendingMessages] = await Promise.all([
      this.contactMessageRepository.count({
        where: this.transformDateFilter(dateFilter),
      }),
      this.contactMessageRepository.count({
        where: {
          is_resolved: false,
          ...this.transformDateFilter(dateFilter),
        },
      }),
    ]);

    const previousMessages =
      await this.calculatePreviousPeriodMessages(dateFilter);
    const trend = this.calculateTrendAnalysis(
      totalMessages,
      previousMessages,
      'decrease_is_good',
    );

    return {
      total: totalMessages,
      pending: pendingMessages,
      resolved: totalMessages - pendingMessages,
      trend: trend.trend,
      status: trend.status,
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

  private async calculatePreviousPeriodMessages(
    dateFilter: DateFilter,
  ): Promise<number> {
    const now =
      (dateFilter?.where?.createdAt as { $lte?: Date })?.$lte || new Date();
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    return this.contactMessageRepository.count({
      where: {
        createdAt: Between(previousMonthStart, previousMonthEnd),
      },
    });
  }

  private calculateTrendAnalysis(
    currentValue: number,
    previousValue: number,
    type: 'increase_is_good' | 'decrease_is_good',
  ): {
    trend: number;
    status: 'improving' | 'declining' | 'stable';
    percentageChange: number;
  } {
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
