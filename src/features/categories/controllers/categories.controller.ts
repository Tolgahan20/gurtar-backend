import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtBlacklistGuard } from '../../auth/guards/jwt-blacklist.guard';
import { AdminGuard } from '../../admin/guards/admin.guard';
import { CategoriesService } from '../services/categories.service';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CategoryFilterDto } from '../dto/category-filter.dto';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@ApiTags('Categories')
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories with filtering and sorting' })
  @ApiResponse({
    status: 200,
    description: 'Returns filtered and sorted list of categories',
    type: [Category],
  })
  async findAll(
    @Query() filterDto: CategoryFilterDto,
  ): Promise<PaginatedResponse<Category>> {
    return this.categoriesService.findAll(filterDto);
  }

  @Get(':id/subcategories')
  @ApiOperation({ summary: 'Get subcategories of a category' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of subcategories',
    type: [Category],
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findSubcategories(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Category[]> {
    return this.categoriesService.findSubcategories(id);
  }

  @Post()
  @UseGuards(JwtBlacklistGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Put(':id')
  @UseGuards(JwtBlacklistGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (Admin)' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtBlacklistGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (Admin)' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Has dependencies' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
