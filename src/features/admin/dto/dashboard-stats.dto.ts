import { ApiProperty } from '@nestjs/swagger';

export class UserStats {
  @ApiProperty({ description: 'Total number of users' })
  total!: number;

  @ApiProperty({ description: 'Number of active users' })
  active!: number;

  @ApiProperty({ description: 'Number of inactive users' })
  inactive!: number;

  @ApiProperty({ description: 'Number of banned users' })
  banned!: number;

  @ApiProperty({ description: 'User retention rate (percentage)' })
  retentionRate!: number;

  @ApiProperty({ description: 'Average login frequency (times per week)' })
  avgLoginFrequency!: number;

  @ApiProperty({ description: 'Average orders per user' })
  avgOrdersPerUser!: number;

  @ApiProperty({ description: 'Average spending per user' })
  avgSpendingPerUser!: number;

  @ApiProperty({
    description: 'Growth rate compared to previous period (percentage)',
  })
  growthRate!: number;
}

export class BusinessStats {
  @ApiProperty({ description: 'Total number of businesses' })
  total!: number;

  @ApiProperty({ description: 'Number of active businesses' })
  active!: number;

  @ApiProperty({ description: 'Number of inactive businesses' })
  inactive!: number;

  @ApiProperty({ description: 'Number of verified businesses' })
  verified!: number;

  @ApiProperty({ description: 'Number of unverified businesses' })
  unverified!: number;

  @ApiProperty({ description: 'Businesses grouped by city' })
  byCity!: { [city: string]: number };

  @ApiProperty({
    description: 'Growth rate compared to previous period (percentage)',
  })
  growthRate!: number;

  @ApiProperty({ description: 'Average response time to orders (minutes)' })
  avgResponseTime!: number;

  @ApiProperty({ description: 'Average orders per business' })
  avgOrdersPerBusiness!: number;

  @ApiProperty({ description: 'Average revenue per business' })
  avgRevenuePerBusiness!: number;
}

export class ContactStats {
  @ApiProperty({ description: 'Total number of contact messages' })
  total!: number;

  @ApiProperty({ description: 'Number of pending contact messages' })
  pending!: number;
}

export class OrderStats {
  @ApiProperty({ description: 'Total number of orders' })
  total!: number;

  @ApiProperty({ description: 'Total CO2 emission saved by all orders' })
  totalCo2Saved!: number;

  @ApiProperty({ description: 'Total money saved by all orders' })
  totalMoneySaved!: number;

  @ApiProperty({ description: 'Average order value' })
  avgOrderValue!: number;

  @ApiProperty({ description: 'Average CO2 savings per order' })
  avgCo2SavedPerOrder!: number;

  @ApiProperty({
    description: 'Growth rate compared to previous period (percentage)',
  })
  growthRate!: number;

  @ApiProperty({ description: 'Peak hours for orders (hour -> order count)' })
  peakHours!: { [hour: number]: number };

  @ApiProperty({ description: 'Peak days for orders (day -> order count)' })
  peakDays!: { [day: string]: number };
}

export class CategoryStats {
  @ApiProperty({ description: 'Most popular categories by order count' })
  popularByOrders!: Array<{
    categoryId: string;
    name: string;
    orderCount: number;
    percentage: number;
  }>;

  @ApiProperty({ description: 'Most popular categories by business count' })
  popularByBusinesses!: Array<{
    categoryId: string;
    name: string;
    businessCount: number;
    percentage: number;
  }>;

  @ApiProperty({
    description: 'Growth rate by category compared to previous period',
  })
  growthRates!: { [categoryId: string]: number };
}

export class CityStats {
  @ApiProperty({ description: 'Most active cities by order count' })
  mostActiveByOrders!: Array<{
    city: string;
    orderCount: number;
    percentage: number;
  }>;

  @ApiProperty({ description: 'Most active cities by business count' })
  mostActiveByBusinesses!: Array<{
    city: string;
    businessCount: number;
    percentage: number;
  }>;

  @ApiProperty({
    description: 'Growth rate by city compared to previous period',
  })
  growthRates!: { [city: string]: number };
}

export class SatisfactionStats {
  @ApiProperty({ description: 'Average rating (1-5)' })
  avgRating!: number;

  @ApiProperty({ description: 'Rating distribution (1-5 -> count)' })
  ratingDistribution!: { [rating: number]: number };

  @ApiProperty({ description: 'Average response time (minutes)' })
  avgResponseTime!: number;

  @ApiProperty({
    description: 'Customer satisfaction trend (percentage change)',
  })
  satisfactionTrend!: number;
}

export class RegistrationStats {
  @ApiProperty({ description: 'Daily new registrations' })
  daily!: number;

  @ApiProperty({ description: 'Weekly new registrations' })
  weekly!: number;

  @ApiProperty({ description: 'Monthly new registrations' })
  monthly!: number;

  @ApiProperty({ description: 'Bi-monthly new registrations' })
  biMonthly!: number;
}

export class DashboardStatsDto {
  @ApiProperty({ type: UserStats })
  users!: UserStats;

  @ApiProperty({ type: BusinessStats })
  businesses!: BusinessStats;

  @ApiProperty({ type: ContactStats })
  contact!: ContactStats;

  @ApiProperty({ type: OrderStats })
  orders!: OrderStats;

  @ApiProperty({ type: RegistrationStats })
  registrations!: RegistrationStats;

  @ApiProperty({ type: CategoryStats })
  categories!: CategoryStats;

  @ApiProperty({ type: CityStats })
  cities!: CityStats;

  @ApiProperty({ type: SatisfactionStats })
  satisfaction!: SatisfactionStats;

  @ApiProperty({ description: 'Total CO2 emission saved by businesses' })
  businessCo2Saved!: { [businessId: string]: number };

  @ApiProperty({ description: 'Total money saved by businesses' })
  businessMoneySaved!: { [businessId: string]: number };

  @ApiProperty({ description: 'Total CO2 emission saved by users' })
  userCo2Saved!: { [userId: string]: number };

  @ApiProperty({ description: 'Total money saved by users' })
  userMoneySaved!: { [userId: string]: number };
}
