import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Badge } from '../entities/badge.entity';
import { UserBadge } from '../entities/user-badge.entity';
import { LeaderboardSnapshot } from '../entities/leaderboard-snapshot.entity';
import { User } from '../../users/entities/user.entity';
import { BadgeTriggerType } from '../entities/badge-trigger-type.enum';
import { LeaderboardType } from '../entities/leaderboard-type.enum';
import { EcoLevel } from '../../users/entities/eco-level.enum';

interface LeaderboardEntry {
  user: User;
  value: number;
  rank: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
}

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(LeaderboardSnapshot)
    private readonly leaderboardSnapshotRepository: Repository<LeaderboardSnapshot>,
  ) {}

  private getEcoLevel(co2Saved: number): EcoLevel {
    if (co2Saved >= 75) return EcoLevel.ECO_HERO;
    if (co2Saved >= 31) return EcoLevel.CHAMPION;
    if (co2Saved >= 11) return EcoLevel.SAVER;
    return EcoLevel.BEGINNER;
  }

  async checkAndAwardBadges(user: User): Promise<Badge[]> {
    const badges = await this.badgeRepository.find();
    const earnedBadges: Badge[] = [];

    for (const badge of badges) {
      const hasEarned = await this.userBadgeRepository.findOne({
        where: { user: { id: user.id }, badge: { id: badge.id } },
      });

      if (hasEarned) continue;

      let shouldAward = false;
      switch (badge.trigger_type) {
        case BadgeTriggerType.ORDER_COUNT:
          shouldAward = user.total_orders >= badge.trigger_value;
          break;
        case BadgeTriggerType.MONEY_SAVED:
          shouldAward = Number(user.total_money_saved) >= badge.trigger_value;
          break;
        case BadgeTriggerType.CO2_SAVED:
          shouldAward = Number(user.total_co2_saved) >= badge.trigger_value;
          break;
        case BadgeTriggerType.WEEKLY_ORDERS: {
          // Count orders in the last 7 days
          const weeklyOrders = await this.userBadgeRepository
            .createQueryBuilder('ub')
            .leftJoin('ub.user', 'user')
            .where('user.id = :userId', { userId: user.id })
            .andWhere('ub.earned_at > :date', {
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            })
            .getCount();
          shouldAward = weeklyOrders >= badge.trigger_value;
          break;
        }
        case BadgeTriggerType.MONTHLY_STREAK:
          // TODO: Implement monthly streak check
          break;
      }

      if (shouldAward) {
        const userBadge = this.userBadgeRepository.create({
          user,
          badge,
          earned_at: new Date(),
        });
        await this.userBadgeRepository.save(userBadge);
        earnedBadges.push(badge);
      }
    }

    return earnedBadges;
  }

  async updateLeaderboards(user: User): Promise<void> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Weekly CO2 Leaderboard
    const weeklyCO2Snapshot = this.leaderboardSnapshotRepository.create({
      type: LeaderboardType.WEEKLY_CO2,
      user,
      value: user.total_co2_saved,
      rank: 1, // Will be updated by updateRanks
      snapshot_date: now,
    });
    await this.leaderboardSnapshotRepository.save(weeklyCO2Snapshot);

    // Monthly Orders Leaderboard
    const monthlyOrdersSnapshot = this.leaderboardSnapshotRepository.create({
      type: LeaderboardType.MONTHLY_ORDERS,
      user,
      value: user.total_orders,
      rank: 1, // Will be updated by updateRanks
      snapshot_date: now,
    });
    await this.leaderboardSnapshotRepository.save(monthlyOrdersSnapshot);

    // Update all ranks
    await this.updateRanks(LeaderboardType.WEEKLY_CO2, weekAgo);
    await this.updateRanks(LeaderboardType.MONTHLY_ORDERS, weekAgo);
  }

  private async updateRanks(type: LeaderboardType, after: Date): Promise<void> {
    const snapshots = await this.leaderboardSnapshotRepository.find({
      where: {
        type,
        snapshot_date: MoreThan(after),
      },
      order: {
        value: 'DESC',
      },
    });

    let currentRank = 1;
    let previousValue: number | null = null;
    let previousRank = 1;

    for (const snapshot of snapshots) {
      if (previousValue !== null && snapshot.value < previousValue) {
        currentRank = previousRank + 1;
      }
      snapshot.rank = currentRank;
      previousValue = snapshot.value;
      previousRank = currentRank;
    }

    await this.leaderboardSnapshotRepository.save(snapshots);
  }

  async getLeaderboard(
    type: LeaderboardType,
    userId: string,
  ): Promise<LeaderboardResponse> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const snapshots = await this.leaderboardSnapshotRepository.find({
      where: {
        type,
        snapshot_date: MoreThan(weekAgo),
      },
      relations: ['user'],
      order: {
        rank: 'ASC',
      },
      take: 10,
    });

    const userSnapshot = await this.leaderboardSnapshotRepository.findOne({
      where: {
        type,
        user: { id: userId },
        snapshot_date: MoreThan(weekAgo),
      },
      relations: ['user'],
    });

    return {
      leaderboard: snapshots.map((s) => ({
        user: s.user,
        value: Number(s.value),
        rank: s.rank,
      })),
      userRank: userSnapshot
        ? {
            user: userSnapshot.user,
            value: Number(userSnapshot.value),
            rank: userSnapshot.rank,
          }
        : undefined,
    };
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return this.userBadgeRepository.find({
      where: { user: { id: userId } },
      relations: ['badge'],
      order: { earned_at: 'DESC' },
    });
  }
}
