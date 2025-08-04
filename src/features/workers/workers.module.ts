import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Worker } from './entities/worker.entity';
import { Business } from '../businesses/entities/business.entity';
import { User } from '../users/entities/user.entity';
import { WorkersController } from './controllers/workers.controller';
import { WorkersService } from './services/workers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Worker, Business, User])],
  controllers: [WorkersController],
  providers: [WorkersService],
  exports: [WorkersService],
})
export class WorkersModule {}
