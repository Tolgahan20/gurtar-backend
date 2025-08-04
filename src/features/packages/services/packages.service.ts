import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Package } from '../entities/package.entity';
import { Business } from '../../businesses/entities/business.entity';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.enum';
import { CreatePackageDto } from '../dto/create-package.dto';
import { UpdatePackageDto } from '../dto/update-package.dto';
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
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
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
    createPackageDto: CreatePackageDto,
    currentUser: User,
  ): Promise<Package> {
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
      throw new ForbiddenException('Only business owners can create packages');
    }

    if (!business.is_verified) {
      throw new BadRequestException(
        'Business must be verified to create packages',
      );
    }

    // Validate pickup times
    const startTime = new Date(createPackageDto.pickup_start_time);
    const endTime = new Date(createPackageDto.pickup_end_time);
    const now = new Date();

    if (startTime <= now) {
      throw new BadRequestException('Pickup start time must be in the future');
    }

    if (endTime <= startTime) {
      throw new BadRequestException('Pickup end time must be after start time');
    }

    // Validate category
    const category = await this.categoryRepository.findOne({
      where: { id: createPackageDto.category_id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Validate subcategory if provided
    if (createPackageDto.subcategory_id) {
      const subcategory = await this.categoryRepository.findOne({
        where: {
          id: createPackageDto.subcategory_id,
          parent_id: category.id,
        },
      });

      if (!subcategory) {
        throw new NotFoundException('Subcategory not found or invalid');
      }
    }

    const package_ = this.packageRepository.create({
      ...createPackageDto,
      business,
      category,
      subcategory: createPackageDto.subcategory_id
        ? ({ id: createPackageDto.subcategory_id } as Category)
        : undefined,
    });

    return this.packageRepository.save(package_);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Package>> {
    const params = this.getPaginationParams(paginationDto);
    const now = new Date();

    const [packages, total] = await this.packageRepository.findAndCount({
      where: {
        is_active: true,
        pickup_end_time: LessThan(now),
        business: { is_verified: true },
      },
      relations: ['business', 'category', 'subcategory'],
      skip: params.skip,
      take: params.take,
      order: {
        pickup_start_time: 'ASC',
        createdAt: 'DESC',
      },
    });

    return {
      data: packages,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async findOne(id: string): Promise<Package> {
    const package_ = await this.packageRepository.findOne({
      where: { id },
      relations: ['business', 'category', 'subcategory'],
    });

    if (!package_) {
      throw new NotFoundException('Package not found');
    }

    return package_;
  }

  async update(
    id: string,
    updatePackageDto: UpdatePackageDto,
    currentUser: User,
  ): Promise<Package> {
    const package_ = await this.findOne(id);

    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== package_.business.owner.id
    ) {
      throw new ForbiddenException('Only business owners can update packages');
    }

    // Validate pickup times if provided
    if (
      updatePackageDto.pickup_start_time ||
      updatePackageDto.pickup_end_time
    ) {
      const startTime = new Date(
        updatePackageDto.pickup_start_time || package_.pickup_start_time,
      );
      const endTime = new Date(
        updatePackageDto.pickup_end_time || package_.pickup_end_time,
      );
      const now = new Date();

      if (startTime <= now) {
        throw new BadRequestException(
          'Pickup start time must be in the future',
        );
      }

      if (endTime <= startTime) {
        throw new BadRequestException(
          'Pickup end time must be after start time',
        );
      }
    }

    // Validate category if provided
    if (updatePackageDto.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: updatePackageDto.category_id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      package_.category = category;
    }

    // Validate subcategory if provided
    if (updatePackageDto.subcategory_id) {
      const subcategory = await this.categoryRepository.findOne({
        where: {
          id: updatePackageDto.subcategory_id,
          parent_id: package_.category.id,
        },
      });

      if (!subcategory) {
        throw new NotFoundException('Subcategory not found or invalid');
      }

      package_.subcategory = subcategory;
    }

    Object.assign(package_, updatePackageDto);
    return this.packageRepository.save(package_);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const package_ = await this.findOne(id);

    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== package_.business.owner.id
    ) {
      throw new ForbiddenException('Only business owners can delete packages');
    }

    // Check if package has any orders
    const hasOrders = await this.packageRepository
      .createQueryBuilder('package')
      .leftJoin('package.orders', 'order')
      .where('package.id = :id', { id })
      .andWhere('order.id IS NOT NULL')
      .getCount();

    if (hasOrders > 0) {
      // Soft delete by setting is_active to false
      package_.is_active = false;
      await this.packageRepository.save(package_);
    } else {
      // Hard delete if no orders exist
      await this.packageRepository.remove(package_);
    }
  }
}
