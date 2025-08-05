import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtBlacklistGuard } from '../../auth/guards/jwt-blacklist.guard';
import { AdminGuard } from '../../admin/guards/admin.guard';
import { ContactService } from '../services/contact.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { ContactMessage } from '../entities/contact-message.entity';
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
  @ApiOperation({ summary: 'Get all contact messages with filtering and sorting (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Returns filtered and sorted list of contact messages',
    type: [ContactMessage],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  async findAll(
    @GetUser() user: User,
    @Query() filterDto: ContactFilterDto,
  ): Promise<PaginatedResponse<ContactMessage>> {
    return this.contactService.findAll(user, filterDto);
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
