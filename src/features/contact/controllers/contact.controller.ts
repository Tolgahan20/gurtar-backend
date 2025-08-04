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
import { ContactService } from '../services/contact.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { ContactMessage } from '../entities/contact-message.entity';
import { CreateContactMessageDto } from '../dto/create-contact-message.dto';
import { UpdateContactStatusDto } from '../dto/update-contact-status.dto';
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

@ApiTags('Contact')
@Controller({ path: 'contact', version: '1' })
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Send a contact message' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    type: ContactMessage,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  async create(
    @Body() createContactMessageDto: CreateContactMessageDto,
    @GetUser() user?: User,
  ): Promise<ContactMessage> {
    return this.contactService.create(createContactMessageDto, user);
  }

  @Get('admin')
  @UseGuards(JwtBlacklistGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all contact messages (Admin)' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns list of contact messages',
    type: [ContactMessage],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  async findAll(
    @GetUser() user: User,
    @Pagination() pagination: PaginationDto,
  ): Promise<PaginatedResponse<ContactMessage>> {
    return this.contactService.findAll(user, pagination);
  }

  @Patch('admin/:id/resolve')
  @UseGuards(JwtBlacklistGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contact message status (Admin)' })
  @ApiParam({
    name: 'id',
    description: 'Contact message ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Message status updated successfully',
    type: ContactMessage,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  @ApiResponse({ status: 404, description: 'Contact message not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactStatusDto: UpdateContactStatusDto,
    @GetUser() user: User,
  ): Promise<ContactMessage> {
    return this.contactService.updateStatus(id, updateContactStatusDto, user);
  }
}
