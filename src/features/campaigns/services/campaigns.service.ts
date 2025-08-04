import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Campaign } from '../entities/campaign.entity';
import { Business } from '../../businesses/entities/business.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.enum';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';
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

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  private getPaginationParams(dto: PaginationDto) {
    return {
      skip: (dto.page - 1) * dto.limit,
      take: dto.limit,
      page: dto.page,
      limit: dto.limit,
    } as const;
  }

  async create(
    businessId: string,
    createCampaignDto: CreateCampaignDto,
    currentUser: User,
  ): Promise<Campaign> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['owner'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (!business.is_verified) {
      throw new BadRequestException(
        'Business must be verified to create campaigns',
      );
    }

    // Check if user is business owner or admin
    if (
      currentUser.role !== UserRole.ADMIN &&
      business.owner.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Only business owner or admin can create campaigns',
      );
    }

    // Validate dates
    const startDate = new Date(createCampaignDto.start_date);
    const endDate = new Date(createCampaignDto.end_date);
    const now = new Date();

    if (startDate <= now) {
      throw new BadRequestException('Start date must be in the future');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Create campaign
    const campaign = this.campaignRepository.create({
      ...createCampaignDto,
      business,
      start_date: startDate,
      end_date: endDate,
    });

    return this.campaignRepository.save(campaign);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Campaign>> {
    const params = this.getPaginationParams(paginationDto);
    const now = new Date();

    const [campaigns, total] = await this.campaignRepository.findAndCount({
      where: {
        is_active: true,
        end_date: MoreThan(now),
      },
      relations: ['business'],
      skip: params.skip,
      take: params.take,
      order: { start_date: 'ASC' },
    });

    return {
      data: campaigns,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
    currentUser: User,
  ): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['business', 'business.owner'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Check if user is business owner or admin
    if (
      currentUser.role !== UserRole.ADMIN &&
      campaign.business.owner.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Only business owner or admin can update campaigns',
      );
    }

    // Validate dates if provided
    if (updateCampaignDto.start_date || updateCampaignDto.end_date) {
      const startDate = new Date(
        updateCampaignDto.start_date || campaign.start_date,
      );
      const endDate = new Date(updateCampaignDto.end_date || campaign.end_date);
      const now = new Date();

      if (startDate <= now && startDate !== campaign.start_date) {
        throw new BadRequestException('Start date must be in the future');
      }

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      campaign.start_date = startDate;
      campaign.end_date = endDate;
    }

    // Update other fields
    Object.assign(campaign, updateCampaignDto);

    return this.campaignRepository.save(campaign);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['business', 'business.owner'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Check if user is business owner or admin
    if (
      currentUser.role !== UserRole.ADMIN &&
      campaign.business.owner.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Only business owner or admin can delete campaigns',
      );
    }

    await this.campaignRepository.remove(campaign);
  }
}
