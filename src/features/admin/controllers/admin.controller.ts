import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Body,
  Query,
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
import { AdminService } from '../services/admin.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { AdminGuard } from '../guards/admin.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AdminLogDto } from '../dto/admin-log.dto';
import { Business } from '../../businesses/entities/business.entity';
import { AdminLog } from '../entities/admin-log.entity';
import { Pagination } from '../../common/decorators/pagination.decorator';
import { UserFilterDto } from '../dto/user-filter.dto';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtBlacklistGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users with filtering and sorting' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns filtered and sorted list of users',
    type: [User],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  async getUsers(
    @Query() filterDto: UserFilterDto,
  ): Promise<PaginatedResponse<User>> {
    return this.adminService.getUsers(filterDto);
  }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Ban/unban a user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'User banned/unbanned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async banUser(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() admin: User,
    @Body() dto: AdminLogDto,
  ): Promise<{ message: string; user: User }> {
    const result = await this.adminService.banUser(id, admin, dto.reason);
    return result;
  }

  @Get('businesses')
  @ApiOperation({ summary: 'Get all businesses' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of businesses',
    type: [Business],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  async getBusinesses(
    @Pagination() pagination: PaginationDto,
  ): Promise<PaginatedResponse<Business>> {
    const result = await this.adminService.getBusinesses(pagination);
    return result;
  }

  @Patch('businesses/:id/verify')
  @ApiOperation({ summary: 'Verify/unverify a business' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Business verified/unverified successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async verifyBusiness(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() admin: User,
    @Body() dto: AdminLogDto,
  ): Promise<{ message: string; business: Business }> {
    const result = await this.adminService.verifyBusiness(
      id,
      admin,
      dto.reason,
    );
    return result;
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get admin action logs' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of admin logs',
    type: [AdminLog],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  async getLogs(
    @Pagination() pagination: PaginationDto,
  ): Promise<PaginatedResponse<AdminLog>> {
    const result = await this.adminService.getLogs(pagination);
    return result;
  }
}
