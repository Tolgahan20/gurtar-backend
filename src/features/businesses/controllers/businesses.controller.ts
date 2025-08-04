import {
  Controller,
  Get,
  Post,
  Patch,
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
import { BusinessesService } from '../services/businesses.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Business } from '../entities/business.entity';
import { CreateBusinessDto } from '../dto/create-business.dto';
import { UpdateBusinessDto } from '../dto/update-business.dto';
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

@ApiTags('Businesses')
@Controller({ path: 'businesses', version: '1' })
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @UseGuards(JwtBlacklistGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new business' })
  @ApiResponse({
    status: 201,
    description: 'Business created successfully',
    type: Business,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a business owner' })
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @GetUser() user: User,
  ): Promise<Business> {
    return this.businessesService.create(createBusinessDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all businesses' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of businesses',
    type: [Business],
  })
  async findAll(
    @Pagination() pagination: PaginationDto,
  ): Promise<PaginatedResponse<Business>> {
    return this.businessesService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a business by ID' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a business',
    type: Business,
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Business> {
    return this.businessesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtBlacklistGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a business' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Business updated successfully',
    type: Business,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the owner' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @GetUser() user: User,
  ): Promise<Business> {
    return this.businessesService.update(id, updateBusinessDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtBlacklistGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a business' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Business deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the owner' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.businessesService.remove(id, user);
  }
}
