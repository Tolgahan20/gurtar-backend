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
import { ContactFilterDto } from '../dto/contact-filter.dto';

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
    filterDto: ContactFilterDto,
  ): Promise<PaginatedResponse<ContactMessage>> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can view contact messages');
    }

    const {
      page = 1,
      limit = 10,
      is_resolved,
      search,
      sort,
      order = 'DESC',
    } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.contactMessageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.user', 'user');

    // Apply filters
    if (typeof is_resolved === 'boolean') {
      queryBuilder.andWhere('message.is_resolved = :is_resolved', { is_resolved });
    }

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(message.name ILIKE :search OR message.email ILIKE :search OR message.subject ILIKE :search OR message.message ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    if (sort) {
      queryBuilder.orderBy(`message.${sort}`, order);
    } else {
      queryBuilder.orderBy('message.createdAt', 'DESC');
    }

    // Get paginated results
    const [messages, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: messages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
