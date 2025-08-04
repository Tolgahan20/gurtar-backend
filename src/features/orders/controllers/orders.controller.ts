import {
  Controller,
  Get,
  Post,
  Patch,
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
import { AdminGuard } from '../../admin/guards/admin.guard';
import { OrdersService } from '../services/orders.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
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

@ApiTags('Orders')
@Controller({ path: 'orders', version: '1' })
@UseGuards(JwtBlacklistGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User,
  ): Promise<Order> {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of orders',
    type: [Order],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @GetUser() user: User,
    @Pagination() pagination: PaginationDto,
  ): Promise<PaginatedResponse<Order>> {
    return this.ordersService.findAll(user, pagination);
  }

  @Get('users/:id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get orders by user ID (Admin)' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of orders for the specified user',
    type: [Order],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to view these orders',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findAllByUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @GetUser() user: User,
    @Pagination() pagination: PaginationDto,
  ): Promise<PaginatedResponse<Order>> {
    return this.ordersService.findAllByUser(userId, user, pagination);
  }

  @Get('businesses/:id')
  @ApiOperation({ summary: 'Get orders by business ID' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of orders for the specified business',
    type: [Order],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to view these orders',
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async findAllByBusiness(
    @Param('id', ParseUUIDPipe) businessId: string,
    @GetUser() user: User,
    @Pagination() pagination: PaginationDto,
  ): Promise<PaginatedResponse<Order>> {
    return this.ordersService.findAllByBusiness(businessId, user, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an order',
    type: Order,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to view this order',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<Order> {
    return this.ordersService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid status transition',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to update this order',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @GetUser() user: User,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, updateOrderStatusDto, user);
  }
}
