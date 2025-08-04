import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';
import { Review } from '../entities/review.entity';
import { Business } from '../../businesses/entities/business.entity';
import { User } from '../../users/entities/user.entity';
import { CreateRatingDto } from '../dto/create-rating.dto';
import { CreateReviewDto } from '../dto/create-review.dto';
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
export class ReviewsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
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

  async createRating(
    createRatingDto: CreateRatingDto,
    currentUser: User,
  ): Promise<Rating> {
    const business = await this.businessRepository.findOne({
      where: { id: createRatingDto.business_id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (!business.is_verified) {
      throw new BadRequestException('Cannot rate an unverified business');
    }

    // Check if user has already rated this business
    const existingRating = await this.ratingRepository.findOne({
      where: {
        user: { id: currentUser.id },
        business: { id: business.id },
      },
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = createRatingDto.rating;
      return this.ratingRepository.save(existingRating);
    }

    // Create new rating
    const rating = this.ratingRepository.create({
      rating: createRatingDto.rating,
      user: currentUser,
      business,
    });

    return this.ratingRepository.save(rating);
  }

  async createReview(
    createReviewDto: CreateReviewDto,
    currentUser: User,
  ): Promise<Review> {
    const business = await this.businessRepository.findOne({
      where: { id: createReviewDto.business_id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (!business.is_verified) {
      throw new BadRequestException('Cannot review an unverified business');
    }

    // Check if user has already reviewed this business
    const existingReview = await this.reviewRepository.findOne({
      where: {
        user: { id: currentUser.id },
        business: { id: business.id },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this business');
    }

    // Check if user has rated the business
    const hasRating = await this.ratingRepository.findOne({
      where: {
        user: { id: currentUser.id },
        business: { id: business.id },
      },
    });

    if (!hasRating) {
      throw new BadRequestException(
        'You must rate the business before reviewing',
      );
    }

    const review = this.reviewRepository.create({
      content: createReviewDto.content,
      user: currentUser,
      business,
    });

    return this.reviewRepository.save(review);
  }

  async getBusinessRatings(
    businessId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Rating>> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const params = this.getPaginationParams(paginationDto);

    const [ratings, total] = await this.ratingRepository.findAndCount({
      where: { business: { id: businessId } },
      relations: ['user'],
      skip: params.skip,
      take: params.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: ratings,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getBusinessReviews(
    businessId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Review>> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const params = this.getPaginationParams(paginationDto);

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { business: { id: businessId } },
      relations: ['user'],
      skip: params.skip,
      take: params.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: reviews,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
