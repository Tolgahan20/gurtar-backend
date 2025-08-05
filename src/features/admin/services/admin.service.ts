/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Workbook } from 'exceljs';
import { stringify } from 'csv-stringify/sync';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.enum';
import { Business } from '../../businesses/entities/business.entity';
import {
  AdminLog,
  AdminActionType,
  AdminTargetType,
} from '../entities/admin-log.entity';
import { Order } from '../../orders/entities/order.entity';
import { ContactMessage } from '../../contact/entities/contact-message.entity';
import { Category } from '../../categories/entities/category.entity';
import { Rating } from '../../reviews/entities/rating.entity';
import { DashboardStatsDto } from '../dto/dashboard-stats.dto';
import { UserFilterDto } from '../dto/user-filter.dto';
import { BusinessFilterDto } from '../dto/business-filter.dto';
import { LogFilterDto } from '../dto/log-filter.dto';
import { BusinessOrdersFilterDto } from '../dto/business-orders-filter.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(AdminLog)
    private readonly adminLogRepository: Repository<AdminLog>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepository: Repository<ContactMessage>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private getPaginationParams(dto: PaginationDto) {
    return {
      skip: (dto.page - 1) * dto.limit,
      take: dto.limit,
      page: dto.page,
      limit: dto.limit,
    };
  }

  async getUsers(filterDto: UserFilterDto): Promise<PaginatedResponse<User>> {
    const {
      page = 1,
      limit = 10,
      role,
      is_banned,
      search,
      sort,
      order = 'DESC',
    } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Apply filters
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (typeof is_banned === 'boolean') {
      queryBuilder.andWhere('user.is_banned = :is_banned', { is_banned });
    }

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.full_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    if (sort) {
      queryBuilder.orderBy(`user.${sort}`, order);
    } else {
      queryBuilder.orderBy('user.createdAt', 'DESC');
    }

    // Get paginated results
    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async banUser(
    userId: string,
    admin: User,
    reason: string,
  ): Promise<{ message: string; user: User }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot ban an admin');
    }

    user.is_banned = !user.is_banned;
    await this.userRepository.save(user);

    const adminLog = this.adminLogRepository.create({
      admin,
      action_type: AdminActionType.BAN_USER,
      target_type: AdminTargetType.USER,
      target_id: userId,
      description: `${user.is_banned ? 'Banned' : 'Unbanned'} user: ${reason}`,
    });
    await this.adminLogRepository.save(adminLog);

    return {
      message: `User ${user.is_banned ? 'banned' : 'unbanned'} successfully`,
      user,
    };
  }

  async getBusinesses(
    filterDto: BusinessFilterDto,
  ): Promise<PaginatedResponse<Business>> {
    const {
      page = 1,
      limit = 10,
      is_verified,
      is_active,
      search,
      city,
      sort,
      order = 'DESC',
    } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.businessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.owner', 'owner');

    // Apply filters
    if (typeof is_verified === 'boolean') {
      queryBuilder.andWhere('business.is_verified = :is_verified', {
        is_verified,
      });
    }

    if (typeof is_active === 'boolean') {
      queryBuilder.andWhere('business.is_active = :is_active', { is_active });
    }

    if (city) {
      queryBuilder.andWhere('business.city ILIKE :city', { city: `%${city}%` });
    }

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(business.name ILIKE :search OR business.description ILIKE :search OR business.email ILIKE :search OR business.city ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    if (sort) {
      queryBuilder.orderBy(`business.${sort}`, order);
    } else {
      queryBuilder.orderBy('business.createdAt', 'DESC');
    }

    // Get paginated results
    const [businesses, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: businesses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async toggleBusinessStatus(
    businessId: string,
    admin: User,
    reason: string,
  ): Promise<{ message: string; business: Business }> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['owner'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Toggle active status
    business.is_active = !business.is_active;
    const savedBusiness = await this.businessRepository.save(business);

    // Log the action
    const adminLog = this.adminLogRepository.create({
      admin,
      action_type: AdminActionType.SUSPEND_BUSINESS,
      target_type: AdminTargetType.BUSINESS,
      target_id: businessId,
      description: `${business.is_active ? 'Activated' : 'Deactivated'} business: ${reason}`,
    });
    await this.adminLogRepository.save(adminLog);

    return {
      message: `Business ${savedBusiness.is_active ? 'activated' : 'deactivated'} successfully`,
      business: savedBusiness,
    };
  }

  async verifyBusiness(
    businessId: string,
    admin: User,
    reason: string,
  ): Promise<{ message: string; business: Business }> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['owner'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Toggle verification status
    business.is_verified = !business.is_verified;
    const savedBusiness = await this.businessRepository.save(business);

    // Log the action
    const adminLog = this.adminLogRepository.create({
      admin,
      action_type: AdminActionType.VERIFY_BUSINESS,
      target_type: AdminTargetType.BUSINESS,
      target_id: businessId,
      description: `${business.is_verified ? 'Verified' : 'Unverified'} business: ${reason}`,
    });
    await this.adminLogRepository.save(adminLog);

    return {
      message: `Business ${savedBusiness.is_verified ? 'verified' : 'unverified'} successfully`,
      business: savedBusiness,
    };
  }

  async getLogs(filterDto: LogFilterDto): Promise<PaginatedResponse<AdminLog>> {
    const {
      page = 1,
      limit = 10,
      action_type,
      target_type,
      search,
      sort,
      order = 'DESC',
    } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.adminLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.admin', 'admin');

    // Apply filters
    if (action_type) {
      queryBuilder.andWhere('log.action_type = :action_type', { action_type });
    }

    if (target_type) {
      queryBuilder.andWhere('log.target_type = :target_type', { target_type });
    }

    // Apply search
    if (search) {
      queryBuilder.andWhere('log.description ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Apply sorting
    if (sort) {
      queryBuilder.orderBy(`log.${sort}`, order);
    } else {
      queryBuilder.orderBy('log.createdAt', 'DESC');
    }

    // Get paginated results
    const [logs, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBusinessOrders(
    businessId: string,
    filterDto: BusinessOrdersFilterDto,
  ): Promise<PaginatedResponse<Order>> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const { page = 1, limit = 10, status, sort, order = 'DESC' } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.package', 'package')
      .leftJoinAndSelect('order.picked_up_by_worker', 'worker')
      .leftJoinAndSelect('package.business', 'business')
      .where('business.id = :businessId', { businessId });

    // Apply filters
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    // Apply sorting
    if (sort) {
      queryBuilder.orderBy(`order.${sort}`, order);
    } else {
      queryBuilder.orderBy('order.createdAt', 'DESC');
    }

    // Get paginated results
    const [orders, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async calculateUserStats(dateFilter: any, previousDateFilter: any) {
    const [users, activeUsers, bannedUsers, totalOrders, totalSpent] =
      await Promise.all([
        this.userRepository.count(dateFilter),
        this.userRepository.count({
          ...dateFilter,
          where: { is_banned: false },
        }),
        this.userRepository.count({
          ...dateFilter,
          where: { is_banned: true },
        }),
        this.orderRepository.count(dateFilter),
        this.orderRepository
          .createQueryBuilder('order')
          .select('SUM(order.total_amount)', 'total')
          .where(dateFilter.where || {})
          .getRawOne(),
      ]);

    const previousUsers = await this.userRepository.count(previousDateFilter);
    const growthRate =
      previousUsers > 0 ? ((users - previousUsers) / previousUsers) * 100 : 0;

    // Calculate login frequency (assuming you have a login_history table)
    const avgLoginFrequency = 3.5; // This should be calculated from actual login history

    return {
      total: users,
      active: activeUsers,
      inactive: users - activeUsers,
      banned: bannedUsers,
      retentionRate: (activeUsers / users) * 100,
      avgLoginFrequency,
      avgOrdersPerUser: users > 0 ? totalOrders / users : 0,
      avgSpendingPerUser: users > 0 ? parseFloat(totalSpent?.total) / users : 0,
      growthRate,
    };
  }

  private async calculateBusinessStats(
    dateFilter: any,
    previousDateFilter: any,
  ) {
    const [
      businesses,
      activeBusinesses,
      verifiedBusinesses,
      businessesByCity,
      totalOrders,
      totalRevenue,
      avgResponseTime,
    ] = await Promise.all([
      this.businessRepository.count(dateFilter),
      this.businessRepository.count({
        ...dateFilter,
        where: { is_active: true },
      }),
      this.businessRepository.count({
        ...dateFilter,
        where: { is_verified: true },
      }),
      this.businessRepository
        .createQueryBuilder('business')
        .select('business.city')
        .addSelect('COUNT(*)', 'count')
        .where(dateFilter.where || {})
        .groupBy('business.city')
        .getRawMany(),
      this.orderRepository.count(dateFilter),
      this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.total_amount)', 'total')
        .where(dateFilter.where || {})
        .getRawOne(),
      this.orderRepository
        .createQueryBuilder('order')
        .select(
          'AVG(EXTRACT(EPOCH FROM (order.accepted_at - order.created_at)) / 60)',
          'avg_response',
        )
        .where('order.accepted_at IS NOT NULL')
        .andWhere(dateFilter.where || {})
        .getRawOne(),
    ]);

    const previousBusinesses =
      await this.businessRepository.count(previousDateFilter);
    const growthRate =
      previousBusinesses > 0
        ? ((businesses - previousBusinesses) / previousBusinesses) * 100
        : 0;

    return {
      total: businesses,
      active: activeBusinesses,
      inactive: businesses - activeBusinesses,
      verified: verifiedBusinesses,
      unverified: businesses - verifiedBusinesses,
      byCity: this.transformCityCounts(businessesByCity),
      growthRate,
      avgResponseTime: parseFloat(avgResponseTime?.avg_response) || 0,
      avgOrdersPerBusiness: businesses > 0 ? totalOrders / businesses : 0,
      avgRevenuePerBusiness:
        businesses > 0 ? parseFloat(totalRevenue?.total) / businesses : 0,
    };
  }

  private async calculateOrderStats(dateFilter: any, previousDateFilter: any) {
    const [totalOrders, orderStats, previousOrders, ordersByHour, ordersByDay] =
      await Promise.all([
        this.orderRepository.count(dateFilter),
        this.orderRepository
          .createQueryBuilder('order')
          .select('SUM(order.co2_saved)', 'totalCo2Saved')
          .addSelect('SUM(order.money_saved)', 'totalMoneySaved')
          .addSelect('SUM(order.total_amount)', 'totalAmount')
          .where(dateFilter.where || {})
          .getRawOne(),
        this.orderRepository.count(previousDateFilter),
        this.orderRepository
          .createQueryBuilder('order')
          .select('EXTRACT(HOUR FROM order.created_at)', 'hour')
          .addSelect('COUNT(*)', 'count')
          .where(dateFilter.where || {})
          .groupBy('hour')
          .getRawMany(),
        this.orderRepository
          .createQueryBuilder('order')
          .select('EXTRACT(DOW FROM order.created_at)', 'day')
          .addSelect('COUNT(*)', 'count')
          .where(dateFilter.where || {})
          .groupBy('day')
          .getRawMany(),
      ]);

    const growthRate =
      previousOrders > 0
        ? ((totalOrders - previousOrders) / previousOrders) * 100
        : 0;

    const peakHours = ordersByHour.reduce((acc, curr) => {
      acc[curr.hour] = parseInt(curr.count);
      return acc;
    }, {});

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const peakDays = ordersByDay.reduce((acc, curr) => {
      acc[days[curr.day]] = parseInt(curr.count);
      return acc;
    }, {});

    return {
      total: totalOrders,
      totalCo2Saved: parseFloat(orderStats?.totalCo2Saved) || 0,
      totalMoneySaved: parseFloat(orderStats?.totalMoneySaved) || 0,
      avgOrderValue:
        totalOrders > 0 ? parseFloat(orderStats?.totalAmount) / totalOrders : 0,
      avgCo2SavedPerOrder:
        totalOrders > 0
          ? parseFloat(orderStats?.totalCo2Saved) / totalOrders
          : 0,
      growthRate,
      peakHours,
      peakDays,
    };
  }

  private async calculateCategoryStats(dateFilter: any) {
    const [ordersByCategory, businessesByCategory] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .leftJoin('order.business', 'business')
        .leftJoin('business.category', 'category')
        .select('category.id', 'categoryId')
        .addSelect('category.name', 'name')
        .addSelect('COUNT(*)', 'count')
        .where(dateFilter.where || {})
        .groupBy('category.id')
        .addGroupBy('category.name')
        .getRawMany(),
      this.businessRepository
        .createQueryBuilder('business')
        .leftJoin('business.category', 'category')
        .select('category.id', 'categoryId')
        .addSelect('category.name', 'name')
        .addSelect('COUNT(*)', 'count')
        .where(dateFilter.where || {})
        .groupBy('category.id')
        .addGroupBy('category.name')
        .getRawMany(),
    ]);

    const totalOrders = ordersByCategory.reduce(
      (sum, cat) => sum + parseInt(cat.count),
      0,
    );
    const totalBusinesses = businessesByCategory.reduce(
      (sum, cat) => sum + parseInt(cat.count),
      0,
    );

    return {
      popularByOrders: ordersByCategory.map((cat) => ({
        categoryId: cat.categoryId,
        name: cat.name,
        orderCount: parseInt(cat.count),
        percentage:
          totalOrders > 0 ? (parseInt(cat.count) / totalOrders) * 100 : 0,
      })),
      popularByBusinesses: businessesByCategory.map((cat) => ({
        categoryId: cat.categoryId,
        name: cat.name,
        businessCount: parseInt(cat.count),
        percentage:
          totalBusinesses > 0
            ? (parseInt(cat.count) / totalBusinesses) * 100
            : 0,
      })),
      growthRates: {}, // This would need historical data to calculate
    };
  }

  private async calculateCityStats(dateFilter: any) {
    const [ordersByCity, usersByCity] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .leftJoin('order.business', 'business')
        .select('business.city', 'city')
        .addSelect('COUNT(*)', 'count')
        .where(dateFilter.where || {})
        .groupBy('business.city')
        .getRawMany(),
      this.userRepository
        .createQueryBuilder('user')
        .select('user.city', 'city')
        .addSelect('COUNT(*)', 'count')
        .where(dateFilter.where || {})
        .groupBy('user.city')
        .getRawMany(),
    ]);

    const totalOrders = ordersByCity.reduce(
      (sum, city) => sum + parseInt(city.count),
      0,
    );
    const totalUsers = usersByCity.reduce(
      (sum, city) => sum + parseInt(city.count),
      0,
    );

    return {
      mostActiveByOrders: ordersByCity.map((city) => ({
        city: city.city,
        orderCount: parseInt(city.count),
        percentage:
          totalOrders > 0 ? (parseInt(city.count) / totalOrders) * 100 : 0,
      })),
      mostActiveByUsers: usersByCity.map((city) => ({
        city: city.city,
        userCount: parseInt(city.count),
        percentage:
          totalUsers > 0 ? (parseInt(city.count) / totalUsers) * 100 : 0,
      })),
      growthRates: {}, // This would need historical data to calculate
    };
  }

  private async calculateSatisfactionStats(dateFilter: any) {
    const [avgRating, ratingDistribution, avgResponseTime, previousAvgRating] =
      await Promise.all([
        this.ratingRepository
          .createQueryBuilder('rating')
          .select('AVG(rating.value)', 'avg')
          .where(dateFilter.where || {})
          .getRawOne(),
        this.ratingRepository
          .createQueryBuilder('rating')
          .select('rating.value', 'rating')
          .addSelect('COUNT(*)', 'count')
          .where(dateFilter.where || {})
          .groupBy('rating.value')
          .getRawMany(),
        this.orderRepository
          .createQueryBuilder('order')
          .select(
            'AVG(EXTRACT(EPOCH FROM (order.accepted_at - order.created_at)) / 60)',
            'avg_response',
          )
          .where('order.accepted_at IS NOT NULL')
          .andWhere(dateFilter.where || {})
          .getRawOne(),
        this.ratingRepository
          .createQueryBuilder('rating')
          .select('AVG(rating.value)', 'avg')
          .where(dateFilter.where || {})
          .getRawOne(),
      ]);

    const distribution = ratingDistribution.reduce((acc, curr) => {
      acc[curr.rating] = parseInt(curr.count);
      return acc;
    }, {});

    const currentAvg = parseFloat(avgRating?.avg) || 0;
    const prevAvg = parseFloat(previousAvgRating?.avg) || 0;
    const satisfactionTrend =
      prevAvg > 0 ? ((currentAvg - prevAvg) / prevAvg) * 100 : 0;

    return {
      avgRating: currentAvg,
      ratingDistribution: distribution,
      avgResponseTime: parseFloat(avgResponseTime?.avg_response) || 0,
      satisfactionTrend,
    };
  }

  private async calculateBusinessSavings(dateFilter: any) {
    const businessSavings = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.business_id', 'businessId')
      .addSelect('SUM(order.co2_saved)', 'co2Saved')
      .addSelect('SUM(order.money_saved)', 'moneySaved')
      .where(dateFilter.where || {})
      .groupBy('order.business_id')
      .getRawMany();

    return {
      businessCo2Saved: this.transformSavings(
        businessSavings,
        'businessId',
        'co2Saved',
      ),
      businessMoneySaved: this.transformSavings(
        businessSavings,
        'businessId',
        'moneySaved',
      ),
    };
  }

  private async calculateUserSavings(dateFilter: any) {
    const userSavings = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.user_id', 'userId')
      .addSelect('SUM(order.co2_saved)', 'co2Saved')
      .addSelect('SUM(order.money_saved)', 'moneySaved')
      .where(dateFilter.where || {})
      .groupBy('order.user_id')
      .getRawMany();

    return {
      userCo2Saved: this.transformSavings(userSavings, 'userId', 'co2Saved'),
      userMoneySaved: this.transformSavings(
        userSavings,
        'userId',
        'moneySaved',
      ),
    };
  }

  private async calculateContactStats(dateFilter: any) {
    const [totalMessages, pendingMessages] = await Promise.all([
      this.contactMessageRepository.count(dateFilter),
      this.contactMessageRepository.count({
        ...dateFilter,
        where: { is_resolved: false },
      }),
    ]);

    return {
      total: totalMessages,
      pending: pendingMessages,
    };
  }

  private async calculateRegistrationStats(startDate?: Date, endDate?: Date) {
    const now = endDate || new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const effectiveStartDate = startDate || twoMonthsAgo;

    const [daily, weekly, monthly, biMonthly] = await Promise.all([
      this.userRepository.count({
        where: { createdAt: Between(oneDayAgo, now) },
      }),
      this.userRepository.count({
        where: { createdAt: Between(oneWeekAgo, now) },
      }),
      this.userRepository.count({
        where: { createdAt: Between(oneMonthAgo, now) },
      }),
      this.userRepository.count({
        where: { createdAt: Between(effectiveStartDate, now) },
      }),
    ]);

    return {
      daily,
      weekly,
      monthly,
      biMonthly,
    };
  }

  async getDashboardStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<DashboardStatsDto> {
    const cacheKey = `dashboard_stats_${startDate?.toISOString() || 'all'}_${endDate?.toISOString() || 'all'}`;
    const cachedStats =
      await this.cacheManager.get<DashboardStatsDto>(cacheKey);

    if (cachedStats) {
      return cachedStats;
    }

    const dateFilter = this.buildDateFilter(startDate, endDate);
    const previousDateFilter = this.buildPreviousPeriodFilter(
      startDate,
      endDate,
    );

    // Get user statistics with trends
    const [users, activeUsers, bannedUsers] = await Promise.all([
      this.userRepository.count(dateFilter),
      this.userRepository.count({ ...dateFilter, where: { is_banned: false } }),
      this.userRepository.count({ ...dateFilter, where: { is_banned: true } }),
    ]);

    const previousUsers = await this.userRepository.count(previousDateFilter);
    const userTrend = this.calculateTrendAnalysis(
      users,
      previousUsers,
      'increase_is_good',
    );

    // Get business statistics with trends
    const [businesses, activeBusinesses, verifiedBusinesses] =
      await Promise.all([
        this.businessRepository.count(dateFilter),
        this.businessRepository.count({
          ...dateFilter,
          where: { is_active: true },
        }),
        this.businessRepository.count({
          ...dateFilter,
          where: { is_verified: true },
        }),
      ]);

    const previousBusinesses =
      await this.businessRepository.count(previousDateFilter);
    const businessTrend = this.calculateTrendAnalysis(
      businesses,
      previousBusinesses,
      'increase_is_good',
    );

    // Get order statistics with trends
    const [totalOrders, orderStats] = await Promise.all([
      this.orderRepository.count(dateFilter),
      this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.co2_saved)', 'totalCo2Saved')
        .addSelect('SUM(order.money_saved)', 'totalMoneySaved')
        .where(dateFilter.where || {})
        .getRawOne(),
    ]);

    const previousOrders = await this.orderRepository.count(previousDateFilter);
    const orderTrend = this.calculateTrendAnalysis(
      totalOrders,
      previousOrders,
      'increase_is_good',
    );

    // Get seasonal trends
    const seasonalTrends = await this.calculateSeasonalTrends(dateFilter);

    // Get user retention trends
    const retentionTrends = await this.calculateUserRetentionTrends(dateFilter);

    // Get business performance trends
    const businessPerformance =
      await this.calculateBusinessPerformanceTrends(dateFilter);

    const stats: DashboardStatsDto = {
      users: {
        total: users,
        active: activeUsers,
        inactive: users - activeUsers,
        banned: bannedUsers,
        retentionRate: retentionTrends.retention_rate,
        avgLoginFrequency: 3.5, // This should be calculated from actual login history
        avgOrdersPerUser: users > 0 ? totalOrders / users : 0,
        avgSpendingPerUser:
          users > 0 ? parseFloat(orderStats?.totalMoneySaved) / users : 0,
        growthRate: userTrend.trend,
      },
      businesses: {
        total: businesses,
        active: activeBusinesses,
        inactive: businesses - activeBusinesses,
        verified: verifiedBusinesses,
        unverified: businesses - verifiedBusinesses,
        growthRate: businessTrend.trend,
        avgResponseTime:
          businessPerformance.top_performers.by_response_time[0]?.value || 0,
        avgOrdersPerBusiness: businesses > 0 ? totalOrders / businesses : 0,
        avgRevenuePerBusiness:
          businesses > 0
            ? parseFloat(orderStats?.totalMoneySaved) / businesses
            : 0,
        byCity: seasonalTrends.peak_days.reduce((acc, day) => {
          acc[day.day] = day.count;
          return acc;
        }, {}),
      },
      orders: {
        total: totalOrders,
        totalCo2Saved: parseFloat(orderStats?.totalCo2Saved) || 0,
        totalMoneySaved: parseFloat(orderStats?.totalMoneySaved) || 0,
        avgOrderValue:
          totalOrders > 0
            ? parseFloat(orderStats?.totalMoneySaved) / totalOrders
            : 0,
        avgCo2SavedPerOrder:
          totalOrders > 0
            ? parseFloat(orderStats?.totalCo2Saved) / totalOrders
            : 0,
        growthRate: orderTrend.trend,
        peakHours: seasonalTrends.peak_hours.reduce((acc, hour) => {
          acc[hour.hour] = hour.count;
          return acc;
        }, {}),
        peakDays: seasonalTrends.peak_days.reduce((acc, day) => {
          acc[day.day] = day.count;
          return acc;
        }, {}),
      },
      categories: await this.calculateCategoryStats(dateFilter),
      cities: await this.calculateCityStats(dateFilter),
      satisfaction: await this.calculateSatisfactionStats(dateFilter),
      contact: await this.calculateContactStats(dateFilter),
      registrations: await this.calculateRegistrationStats(startDate, endDate),
      businessCo2Saved: {},
      businessMoneySaved: {},
      userCo2Saved: {},
      userMoneySaved: {},
    };

    // Get business and user savings
    const [businessSavings, userSavings] = await Promise.all([
      this.calculateBusinessSavings(dateFilter),
      this.calculateUserSavings(dateFilter),
    ]);

    stats.businessCo2Saved = businessSavings.businessCo2Saved;
    stats.businessMoneySaved = businessSavings.businessMoneySaved;
    stats.userCo2Saved = userSavings.userCo2Saved;
    stats.userMoneySaved = userSavings.userMoneySaved;

    await this.cacheManager.set(cacheKey, stats, 300);

    return stats;
  }

  private buildDateFilter(startDate?: Date, endDate?: Date) {
    if (!startDate && !endDate) {
      return {};
    }

    const where: any = {};

    if (startDate) {
      where.createdAt = MoreThanOrEqual(startDate);
    }

    if (endDate) {
      where.createdAt = startDate
        ? Between(startDate, endDate)
        : LessThanOrEqual(endDate);
    }

    return { where };
  }

  private buildPreviousPeriodFilter(startDate?: Date, endDate?: Date) {
    if (!startDate || !endDate) {
      return {};
    }

    const duration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - duration);
    const previousEndDate = new Date(endDate.getTime() - duration);

    return this.buildDateFilter(previousStartDate, previousEndDate);
  }

  private async getRegistrationStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    daily: number;
    weekly: number;
    monthly: number;
    biMonthly: number;
  }> {
    const now = endDate || new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const effectiveStartDate = startDate || twoMonthsAgo;

    const [daily, weekly, monthly, biMonthly] = await Promise.all([
      this.userRepository.count({
        where: { createdAt: Between(oneDayAgo, now) },
      }),
      this.userRepository.count({
        where: { createdAt: Between(oneWeekAgo, now) },
      }),
      this.userRepository.count({
        where: { createdAt: Between(oneMonthAgo, now) },
      }),
      this.userRepository.count({
        where: { createdAt: Between(effectiveStartDate, now) },
      }),
    ]);

    return {
      daily,
      weekly,
      monthly,
      biMonthly,
    };
  }

  private transformSavings(
    data: Array<{ [key: string]: any }>,
    idKey: string,
    valueKey: string,
  ): { [key: string]: number } {
    return data.reduce((acc, curr) => {
      acc[curr[idKey]] = parseFloat(curr[valueKey]) || 0;
      return acc;
    }, {});
  }

  private transformCityCounts(data: Array<{ city: string; count: string }>): {
    [key: string]: number;
  } {
    return data.reduce((acc, curr) => {
      acc[curr.city] = parseInt(curr.count);
      return acc;
    }, {});
  }

  generateExcelReport(stats: DashboardStatsDto): Workbook {
    const workbook = new Workbook();

    // Add worksheets synchronously since ExcelJS operations are not async
    this.addUserStatisticsSheet(workbook, stats);
    this.addBusinessStatisticsSheet(workbook, stats);
    this.addOrderStatisticsSheet(workbook, stats);
    this.addCategoryStatisticsSheet(workbook, stats);
    this.addCityStatisticsSheet(workbook, stats);
    this.addSatisfactionStatisticsSheet(workbook, stats);

    // Add some basic styling
    workbook.worksheets.forEach((sheet) => {
      // Style headers
      sheet.getRow(1).font = { bold: true, size: 14 };
      sheet.getRow(2).font = { bold: true };

      // Auto-fit columns
      sheet.columns.forEach((column) => {
        column.width = 20;
      });

      // Add borders to cells with data
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });
    });

    return workbook;
  }

  private addUserStatisticsSheet(
    workbook: Workbook,
    stats: DashboardStatsDto,
  ): void {
    const userSheet = workbook.addWorksheet('User Statistics');
    userSheet.addRows([
      ['User Statistics'],
      ['Metric', 'Value'],
      ['Total Users', stats.users.total],
      ['Active Users', stats.users.active],
      ['Inactive Users', stats.users.inactive],
      ['Banned Users', stats.users.banned],
      ['Retention Rate', `${stats.users.retentionRate}%`],
      [
        'Average Login Frequency',
        `${stats.users.avgLoginFrequency} times/week`,
      ],
      ['Average Orders per User', stats.users.avgOrdersPerUser],
      ['Average Spending per User', stats.users.avgSpendingPerUser],
      ['Growth Rate', `${stats.users.growthRate}%`],
    ]);
  }

  private addBusinessStatisticsSheet(
    workbook: Workbook,
    stats: DashboardStatsDto,
  ): void {
    const businessSheet = workbook.addWorksheet('Business Statistics');
    businessSheet.addRows([
      ['Business Statistics'],
      ['Metric', 'Value'],
      ['Total Businesses', stats.businesses.total],
      ['Active Businesses', stats.businesses.active],
      ['Inactive Businesses', stats.businesses.inactive],
      ['Verified Businesses', stats.businesses.verified],
      ['Unverified Businesses', stats.businesses.unverified],
      ['Growth Rate', `${stats.businesses.growthRate}%`],
      ['Average Response Time', `${stats.businesses.avgResponseTime} minutes`],
      ['Average Orders per Business', stats.businesses.avgOrdersPerBusiness],
      ['Average Revenue per Business', stats.businesses.avgRevenuePerBusiness],
      [],
      ['Businesses by City'],
      ['City', 'Count'],
      ...Object.entries(stats.businesses.byCity).map(([city, count]) => [
        city,
        count,
      ]),
    ]);
  }

  private addOrderStatisticsSheet(
    workbook: Workbook,
    stats: DashboardStatsDto,
  ): void {
    const orderSheet = workbook.addWorksheet('Order Statistics');
    orderSheet.addRows([
      ['Order Statistics'],
      ['Metric', 'Value'],
      ['Total Orders', stats.orders.total],
      ['Total CO2 Saved', `${stats.orders.totalCo2Saved} kg`],
      ['Total Money Saved', `$${stats.orders.totalMoneySaved}`],
      ['Average Order Value', `$${stats.orders.avgOrderValue}`],
      ['Average CO2 Saved per Order', `${stats.orders.avgCo2SavedPerOrder} kg`],
      ['Growth Rate', `${stats.orders.growthRate}%`],
      [],
      ['Peak Hours'],
      ['Hour', 'Order Count'],
      ...Object.entries(stats.orders.peakHours).map(([hour, count]) => [
        hour,
        count,
      ]),
      [],
      ['Peak Days'],
      ['Day', 'Order Count'],
      ...Object.entries(stats.orders.peakDays).map(([day, count]) => [
        day,
        count,
      ]),
    ]);
  }

  private addCategoryStatisticsSheet(
    workbook: Workbook,
    stats: DashboardStatsDto,
  ): void {
    const categorySheet = workbook.addWorksheet('Category Statistics');
    categorySheet.addRows([
      ['Popular Categories by Orders'],
      ['Category', 'Order Count', 'Percentage'],
      ...stats.categories.popularByOrders.map((cat) => [
        cat.name,
        cat.orderCount,
        `${cat.percentage}%`,
      ]),
      [],
      ['Popular Categories by Businesses'],
      ['Category', 'Business Count', 'Percentage'],
      ...stats.categories.popularByBusinesses.map((cat) => [
        cat.name,
        cat.businessCount,
        `${cat.percentage}%`,
      ]),
    ]);
  }

  private addCityStatisticsSheet(
    workbook: Workbook,
    stats: DashboardStatsDto,
  ): void {
    const citySheet = workbook.addWorksheet('City Statistics');
    citySheet.addRows([
      ['Most Active Cities by Orders'],
      ['City', 'Order Count', 'Percentage'],
      ...stats.cities.mostActiveByOrders.map((city) => [
        city.city,
        city.orderCount,
        `${city.percentage}%`,
      ]),
      [],
      ['Most Active Cities by Users'],
      ['City', 'User Count', 'Percentage'],
      ...stats.cities.mostActiveByUsers.map((city) => [
        city.city,
        city.userCount,
        `${city.percentage}%`,
      ]),
    ]);
  }

  private addSatisfactionStatisticsSheet(
    workbook: Workbook,
    stats: DashboardStatsDto,
  ): void {
    const satisfactionSheet = workbook.addWorksheet('Satisfaction Statistics');
    satisfactionSheet.addRows([
      ['Satisfaction Statistics'],
      ['Metric', 'Value'],
      ['Average Rating', `${stats.satisfaction.avgRating}/5`],
      [
        'Average Response Time',
        `${stats.satisfaction.avgResponseTime} minutes`,
      ],
      ['Satisfaction Trend', `${stats.satisfaction.satisfactionTrend}%`],
      [],
      ['Rating Distribution'],
      ['Rating', 'Count'],
      ...Object.entries(stats.satisfaction.ratingDistribution).map(
        ([rating, count]) => [rating, count],
      ),
    ]);
  }

  generateCsvReport(stats: DashboardStatsDto): string {
    const rows = [
      ['Dashboard Statistics Report'],
      [],
      ['User Statistics'],
      ['Metric', 'Value'],
      ['Total Users', stats.users.total],
      ['Active Users', stats.users.active],
      ['Inactive Users', stats.users.inactive],
      ['Banned Users', stats.users.banned],
      ['Retention Rate', `${stats.users.retentionRate}%`],
      [
        'Average Login Frequency',
        `${stats.users.avgLoginFrequency} times/week`,
      ],
      ['Average Orders per User', stats.users.avgOrdersPerUser],
      ['Average Spending per User', stats.users.avgSpendingPerUser],
      ['Growth Rate', `${stats.users.growthRate}%`],
      [],
      ['Business Statistics'],
      ['Total Businesses', stats.businesses.total],
      ['Active Businesses', stats.businesses.active],
      ['Inactive Businesses', stats.businesses.inactive],
      ['Verified Businesses', stats.businesses.verified],
      ['Unverified Businesses', stats.businesses.unverified],
      ['Growth Rate', `${stats.businesses.growthRate}%`],
      ['Average Response Time', `${stats.businesses.avgResponseTime} minutes`],
      [],
      ['Order Statistics'],
      ['Total Orders', stats.orders.total],
      ['Total CO2 Saved', `${stats.orders.totalCo2Saved} kg`],
      ['Total Money Saved', `$${stats.orders.totalMoneySaved}`],
      ['Average Order Value', `$${stats.orders.avgOrderValue}`],
      ['Growth Rate', `${stats.orders.growthRate}%`],
      [],
      ['Satisfaction Statistics'],
      ['Average Rating', `${stats.satisfaction.avgRating}/5`],
      ['Satisfaction Trend', `${stats.satisfaction.satisfactionTrend}%`],
    ];

    return stringify(rows);
  }

  private calculateTrendAnalysis(
    currentValue: number,
    previousValue: number,
    type: 'increase_is_good' | 'decrease_is_good',
  ): {
    trend: number;
    status: 'improving' | 'declining';
    percentageChange: number;
  } {
    const percentageChange =
      previousValue > 0
        ? ((currentValue - previousValue) / previousValue) * 100
        : 0;

    return {
      trend: percentageChange,
      status:
        type === 'increase_is_good'
          ? percentageChange > 0
            ? 'improving'
            : 'declining'
          : percentageChange < 0
            ? 'improving'
            : 'declining',
      percentageChange: Math.abs(percentageChange),
    };
  }

  private async calculateSeasonalTrends(dateFilter: any) {
    const now = new Date();
    const hourlyTrends = await this.orderRepository
      .createQueryBuilder('order')
      .select('EXTRACT(HOUR FROM order.created_at)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .where(dateFilter.where || {})
      .groupBy('hour')
      .orderBy('count', 'DESC')
      .getRawMany();

    const dailyTrends = await this.orderRepository
      .createQueryBuilder('order')
      .select('EXTRACT(DOW FROM order.created_at)', 'day')
      .addSelect('COUNT(*)', 'count')
      .where(dateFilter.where || {})
      .groupBy('day')
      .orderBy('count', 'DESC')
      .getRawMany();

    const monthlyTrends = await this.orderRepository
      .createQueryBuilder('order')
      .select('EXTRACT(MONTH FROM order.created_at)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where(dateFilter.where || {})
      .groupBy('month')
      .orderBy('count', 'DESC')
      .getRawMany();

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    return {
      peak_hours: hourlyTrends.slice(0, 5).map((t) => ({
        hour: parseInt(t.hour),
        count: parseInt(t.count),
        percentage: this.calculatePercentage(parseInt(t.count), hourlyTrends),
      })),
      peak_days: dailyTrends.slice(0, 3).map((t) => ({
        day: days[parseInt(t.day)],
        count: parseInt(t.count),
        percentage: this.calculatePercentage(parseInt(t.count), dailyTrends),
      })),
      peak_months: monthlyTrends.slice(0, 3).map((t) => ({
        month: new Date(
          now.getFullYear(),
          parseInt(t.month) - 1,
        ).toLocaleString('default', { month: 'long' }),
        count: parseInt(t.count),
        percentage: this.calculatePercentage(parseInt(t.count), monthlyTrends),
      })),
    };
  }

  private async calculateUserRetentionTrends(dateFilter: any) {
    const now = dateFilter?.where?.createdAt?.['$lte'] || new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [activeLastMonth, activeThisMonth] = await Promise.all([
      this.userRepository.count({
        where: {
          ...dateFilter?.where,
          createdAt: Between(twoMonthsAgo, oneMonthAgo),
          is_banned: false,
        },
      }),
      this.userRepository.count({
        where: {
          ...dateFilter?.where,
          createdAt: Between(oneMonthAgo, now),
          is_banned: false,
        },
      }),
    ]);

    return {
      retention_rate:
        activeThisMonth > 0 ? (activeLastMonth / activeThisMonth) * 100 : 0,
      month_over_month_change:
        activeLastMonth > 0
          ? ((activeThisMonth - activeLastMonth) / activeLastMonth) * 100
          : 0,
    };
  }

  private calculatePercentage(
    count: number,
    items: Array<{ count: string }>,
  ): number {
    const total = items.reduce((sum, curr) => sum + parseInt(curr.count), 0);
    return total > 0 ? (count / total) * 100 : 0;
  }

  private async calculateBusinessPerformanceTrends(dateFilter: any) {
    const [orderCountByBusiness, revenueByBusiness, responseTimeByBusiness] =
      await Promise.all([
        this.orderRepository
          .createQueryBuilder('order')
          .select('business.id', 'businessId')
          .addSelect('business.name', 'businessName')
          .addSelect('COUNT(*)', 'orderCount')
          .leftJoin('order.business', 'business')
          .where(dateFilter.where || {})
          .groupBy('business.id')
          .addGroupBy('business.name')
          .orderBy('orderCount', 'DESC')
          .limit(10)
          .getRawMany(),
        this.orderRepository
          .createQueryBuilder('order')
          .select('business.id', 'businessId')
          .addSelect('business.name', 'businessName')
          .addSelect('SUM(order.total_amount)', 'totalRevenue')
          .leftJoin('order.business', 'business')
          .where(dateFilter.where || {})
          .groupBy('business.id')
          .addGroupBy('business.name')
          .orderBy('totalRevenue', 'DESC')
          .limit(10)
          .getRawMany(),
        this.orderRepository
          .createQueryBuilder('order')
          .select('business.id', 'businessId')
          .addSelect('business.name', 'businessName')
          .addSelect(
            'AVG(EXTRACT(EPOCH FROM (order.accepted_at - order.created_at)) / 60)',
            'avgResponseTime',
          )
          .leftJoin('order.business', 'business')
          .where('order.accepted_at IS NOT NULL')
          .andWhere(dateFilter.where || {})
          .groupBy('business.id')
          .addGroupBy('business.name')
          .orderBy('avgResponseTime', 'ASC')
          .limit(10)
          .getRawMany(),
      ]);

    return {
      top_performers: {
        by_order_count: orderCountByBusiness.map((b) => ({
          id: b.businessId,
          name: b.businessName,
          value: parseInt(b.orderCount),
        })),
        by_revenue: revenueByBusiness.map((b) => ({
          id: b.businessId,
          name: b.businessName,
          value: parseFloat(b.totalRevenue),
        })),
        by_response_time: responseTimeByBusiness.map((b) => ({
          id: b.businessId,
          name: b.businessName,
          value: parseFloat(b.avgResponseTime),
        })),
      },
    };
  }
}
