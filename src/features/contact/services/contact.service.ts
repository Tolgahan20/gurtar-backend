import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../entities/contact-message.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.enum';
import { CreateContactMessageDto } from '../dto/create-contact-message.dto';
import { UpdateContactStatusDto } from '../dto/update-contact-status.dto';
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
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepository: Repository<ContactMessage>,
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
    createContactMessageDto: CreateContactMessageDto,
    currentUser?: User,
  ): Promise<ContactMessage> {
    const message = this.contactMessageRepository.create({
      ...createContactMessageDto,
      user: currentUser,
    });

    return this.contactMessageRepository.save(message);
  }

  async findAll(
    currentUser: User,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<ContactMessage>> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can view contact messages');
    }

    const params = this.getPaginationParams(paginationDto);

    const [messages, total] = await this.contactMessageRepository.findAndCount({
      relations: ['user'],
      skip: params.skip,
      take: params.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: messages,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async updateStatus(
    id: string,
    updateContactStatusDto: UpdateContactStatusDto,
    currentUser: User,
  ): Promise<ContactMessage> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only admins can update contact message status',
      );
    }

    const message = await this.contactMessageRepository.findOne({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Contact message not found');
    }

    message.is_resolved = updateContactStatusDto.is_resolved;

    return this.contactMessageRepository.save(message);
  }
}
