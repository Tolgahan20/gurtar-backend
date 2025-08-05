import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Body,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtBlacklistGuard } from '../../auth/guards/jwt-blacklist.guard';
import { AdminService } from '../services/admin.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { AdminGuard } from '../guards/admin.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AdminLogDto } from '../dto/admin-log.dto';
import { Business } from '../../businesses/entities/business.entity';
import { AdminLog } from '../entities/admin-log.entity';
import { UserFilterDto } from '../dto/user-filter.dto';
import { BusinessFilterDto } from '../dto/business-filter.dto';
import { LogFilterDto } from '../dto/log-filter.dto';
import { BusinessOrdersFilterDto } from '../dto/business-orders-filter.dto';
import { Order } from '../../orders/entities/order.entity';
import { DashboardStatsDto } from '../dto/dashboard-stats.dto';

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

  @Get('dashboard/stats/export')
  @ApiOperation({ summary: 'Export dashboard statistics' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Start date for filtering statistics (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'End date for filtering statistics (ISO string)',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    type: String,
    enum: ['csv', 'json', 'excel'],
    description: 'Export format (csv, json, or excel)',
    default: 'csv',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns dashboard statistics in the requested format',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  async exportDashboardStats(
    @Res() res: Response,
    @Query('format') format: 'csv' | 'json' | 'excel' = 'csv',
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ): Promise<void> {
    const start = startDateStr ? new Date(startDateStr) : undefined;
    const end = endDateStr ? new Date(endDateStr) : undefined;
    const stats = await this.adminService.getDashboardStats(start, end);

    let dateStr = 'all_time';
    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      dateStr = `${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
    }

    const filename = `dashboard_stats_${dateStr}`;

    switch (format) {
      case 'json': {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filename}.json`,
        );
        res.send(JSON.stringify(stats, null, 2));
        break;
      }

      case 'excel': {
        const workbook = await this.adminService.generateExcelReport(stats);
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filename}.xlsx`,
        );
        await workbook.xlsx.write(res);
        break;
      }

      default: {
        const csv = await this.adminService.generateCsvReport(stats);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filename}.csv`,
        );
        res.send(csv);
        break;
      }
    }
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Start date for filtering statistics (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'End date for filtering statistics (ISO string)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns dashboard statistics',
    type: DashboardStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  async getDashboardStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<DashboardStatsDto> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.adminService.getDashboardStats(start, end);
  }

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
  @ApiOperation({ summary: 'Get all businesses with filtering and sorting' })
  @ApiResponse({
    status: 200,
    description: 'Returns filtered and sorted list of businesses',
    type: [Business],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  async getBusinesses(
    @Query() filterDto: BusinessFilterDto,
  ): Promise<PaginatedResponse<Business>> {
    return this.adminService.getBusinesses(filterDto);
  }

  @Patch('businesses/:id/verify')
  @ApiOperation({ summary: 'Verify/unverify business' })
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
    return this.adminService.verifyBusiness(id, admin, dto.reason);
  }

  @Patch('businesses/:id/toggle-status')
  @ApiOperation({ summary: 'Activate/deactivate business' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Business activated/deactivated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async toggleBusinessStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() admin: User,
    @Body() dto: AdminLogDto,
  ): Promise<{ message: string; business: Business }> {
    return this.adminService.toggleBusinessStatus(id, admin, dto.reason);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get admin action logs with filtering and sorting' })
  @ApiResponse({
    status: 200,
    description: 'Returns filtered and sorted list of admin logs',
    type: [AdminLog],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  async getLogs(
    @Query() filterDto: LogFilterDto,
  ): Promise<PaginatedResponse<AdminLog>> {
    return this.adminService.getLogs(filterDto);
  }

  @Get('businesses/:id/orders')
  @ApiOperation({ summary: 'Get business orders with filtering and sorting' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns filtered and sorted list of business orders',
    type: [Order],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getBusinessOrders(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() filterDto: BusinessOrdersFilterDto,
  ): Promise<PaginatedResponse<Order>> {
    return this.adminService.getBusinessOrders(id, filterDto);
  }
}
