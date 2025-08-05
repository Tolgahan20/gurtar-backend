/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { stringify } from 'csv-stringify/sync';
import { UserStats, BusinessStats } from '../statistics/types';

@Injectable()
export class ReportingService {
  generateExcelReport(stats: {
    users: UserStats;
    businesses: BusinessStats;
  }): Workbook {
    const workbook = new Workbook();

    this.addUserStatisticsSheet(workbook, stats.users);
    this.addBusinessStatisticsSheet(workbook, stats.businesses);
    this.addOrderStatisticsSheet(workbook, stats.businesses);
    this.addSatisfactionStatisticsSheet(workbook, stats);

    return workbook;
  }

  private addUserStatisticsSheet(workbook: Workbook, stats: UserStats): void {
    const sheet = workbook.addWorksheet('User Statistics');

    sheet.addRows([
      ['User Statistics'],
      ['Total Users', stats.total],
      ['Active Users', stats.active],
      ['Inactive Users', stats.inactive],
      ['Banned Users', stats.banned],
      [],
      ['User Metrics'],
      ['Retention Rate', `${stats.retentionRate}%`],
      ['Growth Rate', `${stats.growthRate}%`],
      ['Average Login Frequency', stats.avgLoginFrequency],
      ['Average Orders per User', stats.avgOrdersPerUser],
      ['Average Spending per User', `$${stats.avgSpendingPerUser}`],
    ]);

    // Add some basic styling
    sheet.getColumn(1).width = 25;
    sheet.getColumn(2).width = 15;
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(7).font = { bold: true };
  }

  private addBusinessStatisticsSheet(
    workbook: Workbook,
    stats: BusinessStats,
  ): void {
    const sheet = workbook.addWorksheet('Business Statistics');

    sheet.addRows([
      ['Business Statistics'],
      ['Total Businesses', stats.total],
      ['Active Businesses', stats.active],
      ['Inactive Businesses', stats.inactive],
      ['Verified Businesses', stats.verified],
      ['Unverified Businesses', stats.unverified],
      [],
      ['Business Metrics'],
      ['Growth Rate', `${stats.growthRate}%`],
      ['Average Response Time', `${stats.avgResponseTime} minutes`],
      ['Average Orders per Business', stats.avgOrdersPerBusiness],
      ['Average Revenue per Business', `$${stats.avgRevenuePerBusiness}`],
      [],
      ['Top Businesses by Orders'],
      ['Business Name', 'Order Count'],
      ...stats.orderCountByBusiness.map((b) => [b.businessName, b.orderCount]),
      [],
      ['Top Businesses by Revenue'],
      ['Business Name', 'Revenue'],
      ...stats.revenueByBusiness.map((b) => [
        b.businessName,
        `$${b.totalRevenue}`,
      ]),
    ]);

    // Add some basic styling
    sheet.getColumn(1).width = 25;
    sheet.getColumn(2).width = 15;
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(8).font = { bold: true };
    sheet.getRow(14).font = { bold: true };
    sheet.getRow(18).font = { bold: true };
  }

  private addOrderStatisticsSheet(
    workbook: Workbook,
    stats: BusinessStats,
  ): void {
    const sheet = workbook.addWorksheet('Order Statistics');

    sheet.addRows([
      ['CO2 Savings by Business'],
      ['Business ID', 'CO2 Saved (kg)'],
      ...Object.entries(stats.businessCo2Saved).map(([id, amount]) => [
        id,
        amount,
      ]),
      [],
      ['Money Savings by Business'],
      ['Business ID', 'Money Saved ($)'],
      ...Object.entries(stats.businessMoneySaved).map(([id, amount]) => [
        id,
        amount,
      ]),
    ]);

    // Add some basic styling
    sheet.getColumn(1).width = 25;
    sheet.getColumn(2).width = 15;
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(5).font = { bold: true };
  }

  private addSatisfactionStatisticsSheet(workbook: Workbook, stats: any): void {
    const sheet = workbook.addWorksheet('Satisfaction Statistics');

    sheet.addRows([
      ['Response Time Statistics'],
      ['Business Name', 'Average Response Time (minutes)'],
      ...stats.businesses.responseTimeByBusiness.map((b) => [
        b.businessName,
        b.avgResponseTime,
      ]),
    ]);

    // Add some basic styling
    sheet.getColumn(1).width = 25;
    sheet.getColumn(2).width = 25;
    sheet.getRow(1).font = { bold: true };
  }

  generateCsvReport(stats: {
    users: UserStats;
    businesses: BusinessStats;
  }): string {
    const rows = [
      ['Category', 'Metric', 'Value'],

      // User Statistics
      ['Users', 'Total', stats.users.total],
      ['Users', 'Active', stats.users.active],
      ['Users', 'Inactive', stats.users.inactive],
      ['Users', 'Banned', stats.users.banned],
      ['Users', 'Retention Rate', `${stats.users.retentionRate}%`],
      ['Users', 'Growth Rate', `${stats.users.growthRate}%`],
      ['Users', 'Average Login Frequency', stats.users.avgLoginFrequency],
      ['Users', 'Average Orders per User', stats.users.avgOrdersPerUser],
      [
        'Users',
        'Average Spending per User',
        `$${stats.users.avgSpendingPerUser}`,
      ],

      // Business Statistics
      ['Businesses', 'Total', stats.businesses.total],
      ['Businesses', 'Active', stats.businesses.active],
      ['Businesses', 'Inactive', stats.businesses.inactive],
      ['Businesses', 'Verified', stats.businesses.verified],
      ['Businesses', 'Unverified', stats.businesses.unverified],
      ['Businesses', 'Growth Rate', `${stats.businesses.growthRate}%`],
      [
        'Businesses',
        'Average Response Time',
        `${stats.businesses.avgResponseTime} minutes`,
      ],
      [
        'Businesses',
        'Average Orders per Business',
        stats.businesses.avgOrdersPerBusiness,
      ],
      [
        'Businesses',
        'Average Revenue per Business',
        `$${stats.businesses.avgRevenuePerBusiness}`,
      ],

      // Top Businesses by Orders
      ...stats.businesses.orderCountByBusiness.map((b) => [
        'Top Businesses by Orders',
        b.businessName,
        b.orderCount,
      ]),

      // Top Businesses by Revenue
      ...stats.businesses.revenueByBusiness.map((b) => [
        'Top Businesses by Revenue',
        b.businessName,
        `$${b.totalRevenue}`,
      ]),
    ];

    return stringify(rows);
  }
}
