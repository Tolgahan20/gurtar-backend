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
import { CampaignsService } from '../services/campaigns.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Campaign } from '../entities/campaign.entity';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';
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

@ApiTags('Campaigns')
@Controller({ path: 'campaigns', version: '1' })
@UseGuards(JwtBlacklistGuard)
@ApiBearerAuth()
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post('businesses/:id')
  @ApiOperation({ summary: 'Create a new campaign for a business' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
    type: Campaign,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to create campaigns',
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async create(
    @Param('id', ParseUUIDPipe) businessId: string,
    @Body() createCampaignDto: CreateCampaignDto,
    @GetUser() user: User,
  ): Promise<Campaign> {
    return this.campaignsService.create(businessId, createCampaignDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active campaigns' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of active campaigns',
    type: [Campaign],
  })
  async findAll(
    @Pagination() pagination: PaginationDto,
  ): Promise<PaginatedResponse<Campaign>> {
    return this.campaignsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a campaign',
    type: Campaign,
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Campaign> {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a campaign' })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign updated successfully',
    type: Campaign,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to update this campaign',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @GetUser() user: User,
  ): Promise<Campaign> {
    return this.campaignsService.update(id, updateCampaignDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a campaign' })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to delete this campaign',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.campaignsService.remove(id, user);
  }
}
