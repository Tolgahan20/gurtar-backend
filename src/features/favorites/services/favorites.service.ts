import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';
import { Business } from '../../businesses/entities/business.entity';
import { User } from '../../users/entities/user.entity';
import { CreateFavoriteDto } from '../dto/create-favorite.dto';
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
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
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
    createFavoriteDto: CreateFavoriteDto,
    currentUser: User,
  ): Promise<Favorite> {
    // Check if business exists and is verified
    const business = await this.businessRepository.findOne({
      where: { id: createFavoriteDto.business_id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (!business.is_verified) {
      throw new BadRequestException('Cannot favorite an unverified business');
    }

    // Check if already favorited
    const existingFavorite = await this.favoriteRepository.findOne({
      where: {
        user: { id: currentUser.id },
        business: { id: business.id },
      },
    });

    if (existingFavorite) {
      throw new BadRequestException('Business already favorited');
    }

    // Create favorite
    const favorite = this.favoriteRepository.create({
      user: currentUser,
      business,
    });

    return this.favoriteRepository.save(favorite);
  }

  async findAll(
    currentUser: User,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Favorite>> {
    const params = this.getPaginationParams(paginationDto);

    const [favorites, total] = await this.favoriteRepository.findAndCount({
      where: { user: { id: currentUser.id } },
      relations: ['business'],
      skip: params.skip,
      take: params.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: favorites,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { id, user: { id: currentUser.id } },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.remove(favorite);
  }
}
