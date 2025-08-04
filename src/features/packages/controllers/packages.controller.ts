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
import { PackagesService } from '../services/packages.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Package } from '../entities/package.entity';
import { CreatePackageDto } from '../dto/create-package.dto';
import { UpdatePackageDto } from '../dto/update-package.dto';
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

@ApiTags('Packages')
@Controller({ path: 'packages', version: '1' })
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post('businesses/:id/packages')
  @UseGuards(JwtBlacklistGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new package for a business' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Package created successfully',
    type: Package,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the business owner',
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async create(
    @Param('id', ParseUUIDPipe) businessId: string,
    @Body() createPackageDto: CreatePackageDto,
    @GetUser() user: User,
  ): Promise<Package> {
    return this.packagesService.create(businessId, createPackageDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all available packages' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of packages',
    type: [Package],
  })
  async findAll(
    @Pagination() pagination: PaginationDto,
  ): Promise<PaginatedResponse<Package>> {
    return this.packagesService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a package by ID' })
  @ApiParam({
    name: 'id',
    description: 'Package ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a package',
    type: Package,
  })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Package> {
    return this.packagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtBlacklistGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a package' })
  @ApiParam({
    name: 'id',
    description: 'Package ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Package updated successfully',
    type: Package,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the business owner',
  })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePackageDto: UpdatePackageDto,
    @GetUser() user: User,
  ): Promise<Package> {
    return this.packagesService.update(id, updatePackageDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtBlacklistGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a package' })
  @ApiParam({
    name: 'id',
    description: 'Package ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Package deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the business owner',
  })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.packagesService.remove(id, user);
  }
}
