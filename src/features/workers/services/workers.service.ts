import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Worker } from '../entities/worker.entity';
import { Business } from '../../businesses/entities/business.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.enum';
import { CreateWorkerDto } from '../dto/create-worker.dto';
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
export class WorkersService {
  constructor(
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private getPaginationParams(dto: PaginationDto) {
    return {
      skip: (dto.page - 1) * dto.limit,
      take: dto.limit,
      page: dto.page,
      limit: dto.limit,
    } as const;
  }

  async create(
    businessId: string,
    createWorkerDto: CreateWorkerDto,
    currentUser: User,
  ): Promise<Worker> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['owner'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== business.owner.id
    ) {
      throw new ForbiddenException('Only business owners can add workers');
    }

    const user = await this.userRepository.findOne({
      where: { id: createWorkerDto.user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a worker for this business
    const existingWorker = await this.workerRepository.findOne({
      where: {
        user: { id: user.id },
        business: { id: businessId },
        is_active: true,
      },
    });

    if (existingWorker) {
      throw new BadRequestException(
        'User is already a worker for this business',
      );
    }

    // Update user role to worker if not already
    if (user.role !== UserRole.WORKER) {
      user.role = UserRole.WORKER;
      await this.userRepository.save(user);
    }

    const worker = this.workerRepository.create({
      user,
      business,
      is_active: true,
    });

    return this.workerRepository.save(worker);
  }

  async findAllByBusiness(
    businessId: string,
    paginationDto: PaginationDto,
    currentUser: User,
  ): Promise<PaginatedResponse<Worker>> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['owner'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== business.owner.id
    ) {
      throw new ForbiddenException('Only business owners can view workers');
    }

    const params = this.getPaginationParams(paginationDto);

    const [workers, total] = await this.workerRepository.findAndCount({
      where: {
        business: { id: businessId },
        is_active: true,
      },
      relations: ['user'],
      skip: params.skip,
      take: params.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: workers,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async remove(workerId: string, currentUser: User): Promise<void> {
    const worker = await this.workerRepository.findOne({
      where: { id: workerId },
      relations: ['business', 'business.owner', 'user'],
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== worker.business.owner.id
    ) {
      throw new ForbiddenException('Only business owners can remove workers');
    }

    // Soft delete by setting is_active to false
    worker.is_active = false;
    await this.workerRepository.save(worker);

    // Check if user has no other active worker records
    const activeWorkerCount = await this.workerRepository.count({
      where: {
        user: { id: worker.user.id },
        is_active: true,
      },
    });

    // If this was the user's last active worker role, change their role back to USER
    if (activeWorkerCount === 0) {
      worker.user.role = UserRole.USER;
      await this.userRepository.save(worker.user);
    }
  }
}
