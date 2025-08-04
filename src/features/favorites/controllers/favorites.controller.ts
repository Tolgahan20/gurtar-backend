import {
  Controller,
  Get,
  Post,
  Delete,
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
import { FavoritesService } from '../services/favorites.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Favorite } from '../entities/favorite.entity';
import { CreateFavoriteDto } from '../dto/create-favorite.dto';
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

@ApiTags('Favorites')
@Controller({ path: 'favorites', version: '1' })
@UseGuards(JwtBlacklistGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a business to favorites' })
  @ApiResponse({
    status: 201,
    description: 'Business favorited successfully',
    type: Favorite,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Already favorited' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async create(
    @Body() createFavoriteDto: CreateFavoriteDto,
    @GetUser() user: User,
  ): Promise<Favorite> {
    return this.favoritesService.create(createFavoriteDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of favorites',
    type: [Favorite],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @GetUser() user: User,
    @Pagination() pagination: PaginationDto,
  ): Promise<PaginatedResponse<Favorite>> {
    return this.favoritesService.findAll(user, pagination);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a business from favorites' })
  @ApiParam({
    name: 'id',
    description: 'Favorite ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Favorite removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.favoritesService.remove(id, user);
  }
}
