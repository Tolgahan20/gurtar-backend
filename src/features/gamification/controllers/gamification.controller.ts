import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtBlacklistGuard } from '../../auth/guards/jwt-blacklist.guard';
import { GamificationService } from '../services/gamification.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { UserBadge } from '../entities/user-badge.entity';
import { LeaderboardType } from '../entities/leaderboard-type.enum';

interface LeaderboardEntry {
  user: User;
  value: number;
  rank: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
}

@ApiTags('Gamification')
@Controller({ path: 'gamification', version: '1' })
@UseGuards(JwtBlacklistGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('badges')
  @ApiOperation({ summary: 'Get current user badges' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of earned badges',
    type: [UserBadge],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserBadges(@GetUser() user: User): Promise<UserBadge[]> {
    return this.gamificationService.getUserBadges(user.id);
  }

  @Get('leaderboard/:type')
  @ApiOperation({ summary: 'Get leaderboard by type' })
  @ApiParam({
    name: 'type',
    description: 'Type of leaderboard',
    enum: LeaderboardType,
    example: LeaderboardType.WEEKLY_CO2,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns leaderboard data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLeaderboard(
    @Param('type', new ParseEnumPipe(LeaderboardType)) type: LeaderboardType,
    @GetUser() user: User,
  ): Promise<LeaderboardResponse> {
    return this.gamificationService.getLeaderboard(type, user.id);
  }
}
