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
import {
  AdminLog,
  AdminActionType,
  AdminTargetType,
} from '../entities/admin-log.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserFilterDto } from '../dto/user-filter.dto';

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
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Business>> {
    const params = this.getPaginationParams(paginationDto);

    const [businesses, total] = await this.businessRepository.findAndCount({
      skip: params.skip,
      take: params.take,
      order: { createdAt: 'DESC' },
      relations: ['owner'],
    });

    return {
      data: businesses,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
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

  async getLogs(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<AdminLog>> {
    const params = this.getPaginationParams(paginationDto);

    const [logs, total] = await this.adminLogRepository.findAndCount({
      skip: params.skip,
      take: params.take,
      order: { createdAt: 'DESC' },
      relations: ['admin'],
    });

    return {
      data: logs,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
