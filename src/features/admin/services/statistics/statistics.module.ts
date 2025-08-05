import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../users/entities/user.entity';
import { Business } from '../../../businesses/entities/business.entity';
import { Order } from '../../../orders/entities/order.entity';
import { Rating } from '../../../reviews/entities/rating.entity';
import { ContactMessage } from '../../../contact/entities/contact-message.entity';
import { Category } from '../../../categories/entities/category.entity';
import { UserStatisticsService } from './user-statistics.service';
import { BusinessStatisticsService } from './business-statistics.service';
import { OrderStatisticsService } from './order-statistics.service';
import { CategoryStatisticsService } from './category-statistics.service';
import { ContactStatisticsService } from './contact-statistics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Business,
      Order,
      Rating,
      ContactMessage,
      Category,
    ]),
  ],
  providers: [
    UserStatisticsService,
    BusinessStatisticsService,
    OrderStatisticsService,
    CategoryStatisticsService,
    ContactStatisticsService,
  ],
  exports: [
    UserStatisticsService,
    BusinessStatisticsService,
    OrderStatisticsService,
    CategoryStatisticsService,
    ContactStatisticsService,
  ],
})
export class StatisticsModule {}
