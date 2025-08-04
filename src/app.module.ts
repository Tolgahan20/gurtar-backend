import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { DataSourceOptions } from 'typeorm';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';

import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { AdminModule } from './features/admin/admin.module';
import { BusinessesModule } from './features/businesses/businesses.module';
import { WorkersModule } from './features/workers/workers.module';
import { CategoriesModule } from './features/categories/categories.module';
import { PackagesModule } from './features/packages/packages.module';
import { FavoritesModule } from './features/favorites/favorites.module';
import { ReviewsModule } from './features/reviews/reviews.module';
import { OrdersModule } from './features/orders/orders.module';
import { CampaignsModule } from './features/campaigns/campaigns.module';
import { ContactModule } from './features/contact/contact.module';
import { GamificationModule } from './features/gamification/gamification.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DataSourceOptions => {
        const dbConfig = configService.get('database') as DataSourceOptions;
        return dbConfig;
      },
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL', 60),
            limit: configService.get<number>('THROTTLE_LIMIT', 10),
          },
        ],
      }),
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    AdminModule,
    BusinessesModule,
    WorkersModule,
    CategoriesModule,
    PackagesModule,
    FavoritesModule,
    ReviewsModule,
    OrdersModule,
    CampaignsModule,
    ContactModule,
    GamificationModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
