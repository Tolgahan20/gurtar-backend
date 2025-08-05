import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.enum';
import { Business } from '../../businesses/entities/business.entity';
import { Order } from '../../orders/entities/order.entity';
import {
  AdminLog,
  AdminActionType,
  AdminTargetType,
} from '../entities/admin-log.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserFilterDto } from '../dto/user-filter.dto';
import { BusinessFilterDto } from '../dto/business-filter.dto';
import { LogFilterDto } from '../dto/log-filter.dto';
import { BusinessOrdersFilterDto } from '../dto/business-orders-filter.dto';

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
  ) {}

  private getPaginationParams(dto: PaginationDto) {
    return {
      skip: (dto.page - 1) * dto.limit,
      take: dto.limit,
      page: dto.page,
      limit: dto.limit,
    } as const;
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot ban an admin');
    }

    // Toggle ban status
    user.is_banned = !user.is_banned;
    const savedUser = await this.userRepository.save(user);

    // Log the action
    const adminLog = this.adminLogRepository.create({
      admin,
      action_type: AdminActionType.SUSPEND_BUSINESS,
      target_type: AdminTargetType.USER,
      target_id: userId,
      description: `${user.is_banned ? 'Banned' : 'Unbanned'} user: ${reason}`,
    });
    await this.adminLogRepository.save(adminLog);

    return {
      message: `User ${savedUser.is_banned ? 'banned' : 'unbanned'} successfully`,
      user: savedUser,
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
}
