import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entities/package.entity';
import { Business } from '../businesses/entities/business.entity';
import { Category } from '../categories/entities/category.entity';
import { PackagesController } from './controllers/packages.controller';
import { PackagesService } from './services/packages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Package, Business, Category])],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
