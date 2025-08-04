import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtBlacklistGuard } from '../../auth/guards/jwt-blacklist.guard';
import { ReviewsService } from '../services/reviews.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Rating } from '../entities/rating.entity';
import { Review } from '../entities/review.entity';
import { CreateRatingDto } from '../dto/create-rating.dto';
import { CreateReviewDto } from '../dto/create-review.dto';
import { Pagination } from '../../common/decorators/pagination.decorator';
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

@ApiTags('Reviews')
@Controller({ version: '1' })
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('ratings')
  @UseGuards(JwtBlacklistGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rate a business' })
  @ApiResponse({
    status: 201,
    description: 'Rating created/updated successfully',
    type: Rating,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async createRating(
    @Body() createRatingDto: CreateRatingDto,
    @GetUser() user: User,
  ): Promise<Rating> {
    return this.reviewsService.createRating(createRatingDto, user);
  }

  @Get('ratings/business/:id')
  @ApiOperation({ summary: 'Get all ratings of a business' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of ratings',
    type: [Rating],
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getBusinessRatings(
    @Param('id', ParseUUIDPipe) id: string,
    @Pagination() pagination: PaginationDto,
  ): Promise<PaginatedResponse<Rating>> {
    return this.reviewsService.getBusinessRatings(id, pagination);
  }

  @Post('reviews')
  @UseGuards(JwtBlacklistGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Review a business' })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    type: Review,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @GetUser() user: User,
  ): Promise<Review> {
    return this.reviewsService.createReview(createReviewDto, user);
  }

  @Get('reviews/business/:id')
  @ApiOperation({ summary: 'Get all reviews of a business' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of reviews',
    type: [Review],
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getBusinessReviews(
    @Param('id', ParseUUIDPipe) id: string,
    @Pagination() pagination: PaginationDto,
  ): Promise<PaginatedResponse<Review>> {
    return this.reviewsService.getBusinessReviews(id, pagination);
  }
}
