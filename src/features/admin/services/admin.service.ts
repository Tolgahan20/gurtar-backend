/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';
import { AdminLog } from '../entities/admin-log.entity';
import { Order } from '../../orders/entities/order.entity';
import { ContactMessage } from '../../contact/entities/contact-message.entity';
import { Category } from '../../categories/entities/category.entity';
import { Rating } from '../../reviews/entities/rating.entity';
import { UserStatisticsService } from './statistics/user-statistics.service';
import { BusinessStatisticsService } from './statistics/business-statistics.service';
import { OrderStatisticsService } from './statistics/order-statistics.service';
import { CategoryStatisticsService } from './statistics/category-statistics.service';
import { ContactStatisticsService } from './statistics/contact-statistics.service';
import { ReportingService } from './reporting/reporting.service';
import {
  DateFilter,
  BusinessStats as InternalBusinessStats,
} from './statistics/types';
import { UserFilterDto } from '../dto/user-filter.dto';
import { BusinessFilterDto } from '../dto/business-filter.dto';
import { LogFilterDto } from '../dto/log-filter.dto';
import { BusinessOrdersFilterDto } from '../dto/business-orders-filter.dto';
import {
  DashboardStatsDto,
  CategoryStats,
  BusinessStats,
} from '../dto/dashboard-stats.dto';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface PaginationParams {
  page?: number;
  limit?: number;
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
    private readonly userStatisticsService: UserStatisticsService,
    private readonly businessStatisticsService: BusinessStatisticsService,
    private readonly orderStatisticsService: OrderStatisticsService,
    private readonly categoryStatisticsService: CategoryStatisticsService,
    private readonly contactStatisticsService: ContactStatisticsService,
    private readonly reportingService: ReportingService,
  ) {}

  private getPaginationParams(dto: PaginationParams) {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    return {
      page,
      limit,
      skip,
    };
  }

  async getUsers(filterDto: UserFilterDto): Promise<PaginatedResponse<User>> {
    const { page, limit, skip } = this.getPaginationParams(filterDto);

    const [users, total] = await this.userRepository.findAndCount({
      where: {
        ...(filterDto.search && {
          full_name: filterDto.search,
        }),
        ...(filterDto.is_banned !== undefined && {
          is_banned: filterDto.is_banned,
        }),
      },
      skip,
      take: limit,
      order: {
        createdAt: filterDto.order || 'DESC',
      },
    });

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
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.is_banned = !user.is_banned;
    await this.userRepository.save(user);

    await this.adminLogRepository.save({
      admin_id: admin.id,
      action: 'BAN_USER',
      target_id: userId,
      reason,
    });

    return {
      message: `User ${user.is_banned ? 'banned' : 'unbanned'} successfully`,
      user,
    };
  }

  async getBusinesses(
    filterDto: BusinessFilterDto,
  ): Promise<PaginatedResponse<Business>> {
    const { page, limit, skip } = this.getPaginationParams(filterDto);

    const [businesses, total] = await this.businessRepository.findAndCount({
      where: {
        ...(filterDto.search && {
          name: filterDto.search,
        }),
        ...(filterDto.is_active !== undefined && {
          is_active: filterDto.is_active,
        }),
        ...(filterDto.is_verified !== undefined && {
          is_verified: filterDto.is_verified,
        }),
      },
      skip,
      take: limit,
      order: {
        createdAt: filterDto.order || 'DESC',
      },
    });

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
    });

    if (!business) {
      throw new Error('Business not found');
    }

    business.is_active = !business.is_active;
    await this.businessRepository.save(business);

    await this.adminLogRepository.save({
      admin_id: admin.id,
      action: 'SUSPEND_BUSINESS',
      target_id: businessId,
      reason,
    });

    return {
      message: `Business ${business.is_active ? 'activated' : 'suspended'} successfully`,
      business,
    };
  }

  async verifyBusiness(
    businessId: string,
    admin: User,
    reason: string,
  ): Promise<{ message: string; business: Business }> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new Error('Business not found');
    }

    business.is_verified = !business.is_verified;
    await this.businessRepository.save(business);

    await this.adminLogRepository.save({
      admin_id: admin.id,
      action: 'VERIFY_BUSINESS',
      target_id: businessId,
      reason,
    });

    return {
      message: `Business ${business.is_verified ? 'verified' : 'unverified'} successfully`,
      business,
    };
  }

  async getLogs(filterDto: LogFilterDto): Promise<PaginatedResponse<AdminLog>> {
    const { page, limit, skip } = this.getPaginationParams(filterDto);

    const [logs, total] = await this.adminLogRepository.findAndCount({
      where: {
        ...(filterDto.action_type && {
          action: filterDto.action_type,
        }),
        ...(filterDto.admin_id && {
          admin_id: filterDto.admin_id,
        }),
        ...(filterDto.target_type && {
          target_type: filterDto.target_type,
        }),
      },
      skip,
      take: limit,
      order: {
        createdAt: filterDto.order || 'DESC',
      },
    });

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
    const { page, limit, skip } = this.getPaginationParams(filterDto);

    const [orders, total] = await this.orderRepository.findAndCount({
      where: {
        package: {
          business: {
            id: businessId,
          },
        },
        ...(filterDto.status && {
          status: filterDto.status,
        }),
      },
      skip,
      take: limit,
      order: {
        createdAt: filterDto.order || 'DESC',
      },
    });

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

  async getDashboardStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<DashboardStatsDto> {
    const dateFilter: DateFilter = {
      where:
        startDate && endDate
          ? {
              createdAt: {
                $gte: startDate,
                $lte: endDate,
              },
            }
          : undefined,
    };

    const cacheKey = `dashboard_stats_${startDate?.toISOString() || 'all'}_${endDate?.toISOString() || 'all'}`;
    const cachedStats =
      await this.cacheManager.get<DashboardStatsDto>(cacheKey);

    if (cachedStats) {
      return cachedStats;
    }

    const [userStats, businessStats, orderStats, categoryStats, contactStats] =
      await Promise.all([
        this.userStatisticsService.getUserStats(dateFilter),
        this.businessStatisticsService.getBusinessStats(dateFilter),
        this.orderStatisticsService.calculateOrderStats(dateFilter),
        this.categoryStatisticsService.calculateCategoryStats(dateFilter),
        this.contactStatisticsService.calculateContactStats(dateFilter),
      ]);

    // Transform category stats to match DTO format
    const transformedCategoryStats: CategoryStats = {
      popularByOrders: categoryStats.ordersByCategory.map((cat) => ({
        categoryId: cat.id,
        name: cat.name,
        orderCount: cat.orderCount,
        percentage: 0, // TODO: Calculate percentage
      })),
      popularByBusinesses: categoryStats.businessesByCategory.map((cat) => ({
        categoryId: cat.id,
        name: cat.name,
        businessCount: cat.businessCount,
        percentage: 0, // TODO: Calculate percentage
      })),
      growthRates: {}, // TODO: Implement growth rates
    };

    // Transform business stats to match DTO format
    const transformedBusinessStats: BusinessStats = {
      total: businessStats.total,
      active: businessStats.active,
      inactive: businessStats.inactive,
      verified: businessStats.verified,
      unverified: businessStats.unverified,
      growthRate: businessStats.growthRate,
      avgResponseTime: businessStats.avgResponseTime,
      avgOrdersPerBusiness: businessStats.avgOrdersPerBusiness,
      avgRevenuePerBusiness: businessStats.avgRevenuePerBusiness,
      byCity: {}, // TODO: Implement city stats
    };

    const stats: DashboardStatsDto = {
      users: userStats,
      businesses: transformedBusinessStats,
      orders: orderStats,
      categories: transformedCategoryStats,
      contact: contactStats,
      registrations: {
        daily: 0, // TODO: Implement registration stats
        weekly: 0,
        monthly: 0,
        biMonthly: 0,
      },
      cities: {
        mostActiveByOrders: [],
        mostActiveByBusinesses: [],
        growthRates: {},
      },
      satisfaction: {
        avgRating: 0, // TODO: Implement satisfaction stats
        ratingDistribution: {},
        avgResponseTime: businessStats.avgResponseTime,
        satisfactionTrend: 0,
      },
      businessCo2Saved: businessStats.businessCo2Saved || {},
      businessMoneySaved: businessStats.businessMoneySaved || {},
      userCo2Saved: {}, // TODO: Implement user CO2 savings
      userMoneySaved: {}, // TODO: Implement user money savings
    };

    await this.cacheManager.set(cacheKey, stats, 300); // Cache for 5 minutes

    return stats;
  }

  async exportDashboardStats(
    format: 'csv' | 'excel',
    startDate?: Date,
    endDate?: Date,
  ) {
    const stats = await this.getDashboardStats(startDate, endDate);

    // Since the ReportingService expects a subset of the stats with internal types,
    // we'll transform the data to match the expected format
    const reportStats = {
      users: stats.users,
      businesses: {
        total: stats.businesses.total,
        active: stats.businesses.active,
        inactive: stats.businesses.inactive,
        verified: stats.businesses.verified,
        unverified: stats.businesses.unverified,
        growthRate: stats.businesses.growthRate,
        avgResponseTime: stats.businesses.avgResponseTime,
        avgOrdersPerBusiness: stats.businesses.avgOrdersPerBusiness,
        avgRevenuePerBusiness: stats.businesses.avgRevenuePerBusiness,
        businessCo2Saved: stats.businessCo2Saved,
        businessMoneySaved: stats.businessMoneySaved,
        orderCountByBusiness: [], // TODO: Add these from businessStats
        revenueByBusiness: [], // TODO: Add these from businessStats
        responseTimeByBusiness: [], // TODO: Add these from businessStats
      } as InternalBusinessStats,
    };

    switch (format) {
      case 'csv':
        return this.reportingService.generateCsvReport(reportStats);
      case 'excel':
        return this.reportingService.generateExcelReport(reportStats);
      default: {
        const _exhaustiveCheck: never = format;
        throw new Error('Unsupported format: ' + String(_exhaustiveCheck));
      }
    }
  }
}
