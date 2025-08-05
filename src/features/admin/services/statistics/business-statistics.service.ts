/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Business } from '../../../businesses/entities/business.entity';
import { Order } from '../../../orders/entities/order.entity';
import {
  DateFilter,
  BusinessStats,
  BusinessSaving,
  BusinessPerformance,
} from './types';
import { OrderStatus } from '../../../orders/entities/order-status.enum';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class BusinessStatisticsService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getBusinessStats(dateFilter: DateFilter): Promise<BusinessStats> {
    const [
      totalBusinesses,
      activeBusinesses,
      verifiedBusinesses,
      growthRate,
      avgResponseTime,
      businessSavings,
      businessPerformance,
    ] = await Promise.all([
      this.businessRepository.count({
        where: this.transformDateFilter(dateFilter),
      }),
      this.businessRepository.count({
        where: {
          is_active: true,
          ...this.transformDateFilter(dateFilter),
        },
      }),
      this.businessRepository.count({
        where: {
          is_verified: true,
          ...this.transformDateFilter(dateFilter),
        },
      }),
      this.calculateGrowthRate(dateFilter),
      this.calculateAvgResponseTime(dateFilter),
      this.calculateBusinessSavings(dateFilter),
      this.calculateBusinessPerformance(dateFilter),
    ]);

    const { orderCountByBusiness, revenueByBusiness, responseTimeByBusiness } =
      businessPerformance;
    const { businessCo2Saved, businessMoneySaved } = businessSavings;

    const totalOrders = await this.calculateTotalOrders(dateFilter);
    const totalRevenue = await this.calculateTotalRevenue(dateFilter);

    return {
      total: totalBusinesses,
      active: activeBusinesses,
      inactive: totalBusinesses - activeBusinesses,
      verified: verifiedBusinesses,
      unverified: totalBusinesses - verifiedBusinesses,
      growthRate,
      avgResponseTime,
      avgOrdersPerBusiness:
        totalBusinesses > 0 ? totalOrders / totalBusinesses : 0,
      avgRevenuePerBusiness:
        totalBusinesses > 0 ? totalRevenue / totalBusinesses : 0,
      businessCo2Saved,
      businessMoneySaved,
      orderCountByBusiness,
      revenueByBusiness,
      responseTimeByBusiness,
    };
  }

  private transformDateFilter(dateFilter: DateFilter) {
    if (!dateFilter?.where?.createdAt) {
      return {};
    }

    const { $gte, $lte } = dateFilter.where.createdAt as {
      $gte?: Date;
      $lte?: Date;
    };
    return {
      createdAt: Between($gte || new Date(0), $lte || new Date()),
    };
  }

  private async calculateGrowthRate(dateFilter: DateFilter): Promise<number> {
    const now = dateFilter?.where?.createdAt?.['$lte'] || new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    const [currentMonthBusinesses, previousMonthBusinesses] = await Promise.all(
      [
        this.businessRepository.count({
          where: {
            createdAt: Between(currentMonthStart, currentMonthEnd),
          },
        }),
        this.businessRepository.count({
          where: {
            createdAt: Between(previousMonthStart, previousMonthEnd),
          },
        }),
      ],
    );

    if (previousMonthBusinesses === 0) {
      return currentMonthBusinesses > 0 ? 100 : 0;
    }

    return (
      ((currentMonthBusinesses - previousMonthBusinesses) /
        previousMonthBusinesses) *
      100
    );
  }

  private async calculateAvgResponseTime(
    dateFilter: DateFilter,
  ): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('ord')
      .select(
        'AVG(EXTRACT(EPOCH FROM (ord.updatedAt - ord.createdAt)) / 60)',
        'avgResponse',
      )
      .where('ord.status = :status', { status: OrderStatus.CONFIRMED })
      .andWhere(this.transformDateFilter(dateFilter))
      .getRawOne();

    return Number(result?.avgResponse || 0);
  }

  private async calculateTotalOrders(dateFilter: DateFilter): Promise<number> {
    return this.orderRepository.count({
      where: this.transformDateFilter(dateFilter),
    });
  }

  private async calculateTotalRevenue(dateFilter: DateFilter): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('ord')
      .select('SUM(ord.total_price)', 'total')
      .where(this.transformDateFilter(dateFilter))
      .getRawOne();

    return Number(result?.total || 0);
  }

  private async calculateBusinessSavings(dateFilter: DateFilter) {
    const businessSavings = await this.orderRepository
      .createQueryBuilder('ord')
      .leftJoin('ord.package', 'package')
      .leftJoin('package.business', 'business')
      .select('business.id', 'businessId')
      .addSelect('SUM(ord.co2_saved_kg)', 'co2Saved')
      .addSelect('SUM(ord.money_saved)', 'moneySaved')
      .where(this.transformDateFilter(dateFilter))
      .groupBy('business.id')
      .getRawMany<BusinessSaving>();

    const businessCo2Saved: { [businessId: string]: number } = {};
    const businessMoneySaved: { [businessId: string]: number } = {};

    businessSavings.forEach((saving) => {
      businessCo2Saved[saving.businessId] = Number(saving.co2Saved) || 0;
      businessMoneySaved[saving.businessId] = Number(saving.moneySaved) || 0;
    });

    return {
      businessCo2Saved,
      businessMoneySaved,
    };
  }

  private async calculateBusinessPerformance(dateFilter: DateFilter) {
    const [orderCountByBusiness, revenueByBusiness, responseTimeByBusiness] =
      await Promise.all([
        this.orderRepository
          .createQueryBuilder('ord')
          .leftJoin('ord.package', 'package')
          .leftJoin('package.business', 'business')
          .select('business.id', 'businessId')
          .addSelect('business.name', 'businessName')
          .addSelect('COUNT(*)', 'orderCount')
          .where(this.transformDateFilter(dateFilter))
          .groupBy('business.id')
          .addGroupBy('business.name')
          .orderBy('"orderCount"', 'DESC')
          .limit(10)
          .getRawMany<BusinessPerformance>(),
        this.orderRepository
          .createQueryBuilder('ord')
          .leftJoin('ord.package', 'package')
          .leftJoin('package.business', 'business')
          .select('business.id', 'businessId')
          .addSelect('business.name', 'businessName')
          .addSelect('SUM(ord.total_price)', 'totalRevenue')
          .where(this.transformDateFilter(dateFilter))
          .groupBy('business.id')
          .addGroupBy('business.name')
          .orderBy('"totalRevenue"', 'DESC')
          .limit(10)
          .getRawMany<BusinessPerformance>(),
        this.orderRepository
          .createQueryBuilder('ord')
          .leftJoin('ord.package', 'package')
          .leftJoin('package.business', 'business')
          .select('business.id', 'businessId')
          .addSelect('business.name', 'businessName')
          .addSelect(
            'AVG(EXTRACT(EPOCH FROM (ord.updatedAt - ord.createdAt)) / 60)',
            'avgResponseTime',
          )
          .where('ord.status = :status', { status: OrderStatus.CONFIRMED })
          .andWhere(this.transformDateFilter(dateFilter))
          .groupBy('business.id')
          .addGroupBy('business.name')
          .orderBy('"avgResponseTime"', 'ASC')
          .limit(10)
          .getRawMany<BusinessPerformance>(),
      ]);

    return {
      orderCountByBusiness,
      revenueByBusiness,
      responseTimeByBusiness,
    };
  }
}
