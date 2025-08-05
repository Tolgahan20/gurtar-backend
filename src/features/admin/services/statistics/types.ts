export interface DateFilter {
  where?: {
    createdAt?:
      | {
          $gte?: Date;
          $lte?: Date;
        }
      | {
          MoreThanOrEqual?: Date;
          LessThanOrEqual?: Date;
        };
  };
}

export interface BusinessSaving {
  businessId: string;
  co2Saved: string;
  moneySaved: string;
}

export interface BusinessPerformance {
  businessId: string;
  businessName: string;
  orderCount: string;
  totalRevenue?: string;
  avgResponseTime?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  banned: number;
  retentionRate: number;
  growthRate: number;
  avgLoginFrequency: number;
  avgOrdersPerUser: number;
  avgSpendingPerUser: number;
}

export interface BusinessStats {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
  growthRate: number;
  avgResponseTime: number;
  avgOrdersPerBusiness: number;
  avgRevenuePerBusiness: number;
  businessCo2Saved: { [businessId: string]: number };
  businessMoneySaved: { [businessId: string]: number };
  orderCountByBusiness: BusinessPerformance[];
  revenueByBusiness: BusinessPerformance[];
  responseTimeByBusiness: BusinessPerformance[];
}
