import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../entities/business.entity';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.enum';
import { CreateBusinessDto } from '../dto/create-business.dto';
import { UpdateBusinessDto } from '../dto/update-business.dto';
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
export class BusinessesService {
  constructor(
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
    createBusinessDto: CreateBusinessDto,
    user: User,
  ): Promise<Business> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException(
        'Only business owners can create businesses',
      );
    }

    const category = await this.categoryRepository.findOne({
      where: { id: createBusinessDto.category_id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const business = this.businessRepository.create({
      ...createBusinessDto,
      owner: user,
      category,
      is_verified: false,
      is_active: true,
    });

    return this.businessRepository.save(business);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Business>> {
    const params = this.getPaginationParams(paginationDto);

    const [businesses, total] = await this.businessRepository.findAndCount({
      skip: params.skip,
      take: params.take,
      order: { createdAt: 'DESC' },
      relations: ['owner', 'category'],
      where: { is_active: true },
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

  async findOne(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ['owner', 'category'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
    user: User,
  ): Promise<Business> {
    const business = await this.findOne(id);

    if (user.role !== UserRole.ADMIN && user.id !== business.owner.id) {
      throw new ForbiddenException('You can only update your own business');
    }

    if (updateBusinessDto.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateBusinessDto.category_id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      business.category = category;
    }

    Object.assign(business, updateBusinessDto);
    return this.businessRepository.save(business);
  }

  async remove(id: string, user: User): Promise<void> {
    const business = await this.findOne(id);

    if (user.role !== UserRole.ADMIN && user.id !== business.owner.id) {
      throw new ForbiddenException('You can only delete your own business');
    }

    // Soft delete by setting is_active to false
    business.is_active = false;
    await this.businessRepository.save(business);
  }
}
