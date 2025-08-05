import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../businesses/entities/business.entity';
import { AdminLog } from './entities/admin-log.entity';
import { Order } from '../orders/entities/order.entity';
import { ContactMessage } from '../contact/entities/contact-message.entity';
import { Category } from '../categories/entities/category.entity';
import { Rating } from '../reviews/entities/rating.entity';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/orders.module';
import { StatisticsModule } from './services/statistics/statistics.module';
import { ReportingModule } from './services/reporting/reporting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Business,
      AdminLog,
      Order,
      ContactMessage,
      Category,
      Rating,
    ]),
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 100, // maximum number of items in cache
    }),
    AuthModule,
    OrdersModule,
    StatisticsModule,
    ReportingModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
