import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
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
import { WorkersService } from '../services/workers.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Worker } from '../entities/worker.entity';
import { CreateWorkerDto } from '../dto/create-worker.dto';
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

@ApiTags('Workers')
@Controller({ version: '1' })
@UseGuards(JwtBlacklistGuard)
@ApiBearerAuth()
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post('businesses/:id/workers')
  @ApiOperation({ summary: 'Add a worker to a business' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Worker added successfully',
    type: Worker,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the business owner',
  })
  @ApiResponse({ status: 404, description: 'Business or user not found' })
  async create(
    @Param('id', ParseUUIDPipe) businessId: string,
    @Body() createWorkerDto: CreateWorkerDto,
    @GetUser() user: User,
  ): Promise<Worker> {
    return this.workersService.create(businessId, createWorkerDto, user);
  }

  @Get('businesses/:id/workers')
  @ApiOperation({ summary: 'Get all workers of a business' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of workers',
    type: [Worker],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the business owner',
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async findAll(
    @Param('id', ParseUUIDPipe) businessId: string,
    @Pagination() pagination: PaginationDto,
    @GetUser() user: User,
  ): Promise<PaginatedResponse<Worker>> {
    return this.workersService.findAllByBusiness(businessId, pagination, user);
  }

  @Delete('workers/:id')
  @ApiOperation({ summary: 'Remove a worker' })
  @ApiParam({
    name: 'id',
    description: 'Worker ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Worker removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the business owner',
  })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.workersService.remove(id, user);
  }
}
