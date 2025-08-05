import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesController } from './controllers/categories.controller';
import { CategoriesService } from './services/categories.service';
import { AuthModule } from '../auth/auth.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), AuthModule, AdminModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
