import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { ContactController } from './controllers/contact.controller';
import { ContactService } from './services/contact.service';
import { AuthModule } from '../auth/auth.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactMessage]),
    AuthModule,
    AdminModule,
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
