import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../../categories/entities/category.entity';
import { Order } from '../../../orders/entities/order.entity';
import { DateFilter } from './types';
import { Between } from 'typeorm';

interface CategoryOrderStats {
  categoryId: string;
  name: string;
  count: string;
}

interface CategoryBusinessStats {
  categoryId: string;
  name: string;
  count: string;
}

interface CategoryStatistics {
  ordersByCategory: Array<{
    id: string;
    name: string;
    orderCount: number;
  }>;
  businessesByCategory: Array<{
    id: string;
    name: string;
    businessCount: number;
  }>;
}

@Injectable()
export class CategoryStatisticsService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async calculateCategoryStats(
    dateFilter: DateFilter,
  ): Promise<CategoryStatistics> {
    const [ordersByCategory, businessesByCategory] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('ord')
        .leftJoin('ord.package', 'package')
        .leftJoin('package.business', 'business')
        .leftJoin('business.category', 'category')
        .select('category.id', 'categoryId')
        .addSelect('category.name', 'name')
        .addSelect('COUNT(*)', 'count')
        .where(this.transformDateFilter(dateFilter))
        .groupBy('category.id')
        .addGroupBy('category.name')
        .orderBy('count', 'DESC')
        .getRawMany<CategoryOrderStats>(),
      this.categoryRepository
        .createQueryBuilder('category')
        .select('category.id', 'categoryId')
        .addSelect('category.name', 'name')
        .addSelect('COUNT(business.id)', 'count')
        .leftJoin('category.businesses', 'business')
        .where(this.transformDateFilter(dateFilter))
        .groupBy('category.id')
        .addGroupBy('category.name')
        .getRawMany<CategoryBusinessStats>(),
    ]);

    return {
      ordersByCategory: ordersByCategory.map((cat) => ({
        id: cat.categoryId,
        name: cat.name,
        orderCount: Number(cat.count),
      })),
      businessesByCategory: businessesByCategory.map((cat) => ({
        id: cat.categoryId,
        name: cat.name,
        businessCount: Number(cat.count),
      })),
    };
  }

  private transformDateFilter(dateFilter: DateFilter): { createdAt?: any } {
    if (!dateFilter?.where?.createdAt) {
      return {};
    }

    const { $gte, $lte } = dateFilter.where.createdAt as {
      $gte?: Date;
      $lte?: Date;
    };

    const startDate = $gte || new Date(0);
    const endDate = $lte || new Date();

    return {
      createdAt: Between(startDate, endDate),
    };
  }
}
