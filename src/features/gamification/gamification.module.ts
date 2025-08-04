import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { LeaderboardSnapshot } from './entities/leaderboard-snapshot.entity';
import { GamificationService } from './services/gamification.service';
import { GamificationController } from './controllers/gamification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, UserBadge, LeaderboardSnapshot])],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
