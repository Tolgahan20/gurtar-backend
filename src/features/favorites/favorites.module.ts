import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Business } from '../businesses/entities/business.entity';
import { FavoritesController } from './controllers/favorites.controller';
import { FavoritesService } from './services/favorites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Business])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
