import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getTotalStats() {
    const [totalUsers, totalAnnonces] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.announcement.count(),
    ]);

    return {
      totalUsers,
      totalAnnonces,
    };
  }

  async getAnnoncesByMonth() {
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

    const annonces = await this.prisma.announcement.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by month
    const monthlyStats = annonces.reduce((acc, announcement) => {
      const month = announcement.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      acc[month] = (acc[month] || 0) + announcement._count;
      return acc;
    }, {});

    return monthlyStats;
  }

  async getAnnoncesByWeek() {
    const currentDate = new Date();
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(currentDate.getDate() - 28);

    const annonces = await this.prisma.announcement.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: fourWeeksAgo,
        },
      },
      _count: true,
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by week
    const weeklyStats = annonces.reduce((acc, announcement) => {
      const week = this.getWeekNumber(announcement.createdAt);
      acc[week] = (acc[week] || 0) + announcement._count;
      return acc;
    }, {});

    return weeklyStats;
  }

  async getAnnoncesByDay() {
    const currentDate = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(currentDate.getDate() - 7);

    const annonces = await this.prisma.announcement.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: true,
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by day
    const dailyStats = annonces.reduce((acc, announcement) => {
      const day = announcement.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD format
      acc[day] = (acc[day] || 0) + announcement._count;
      return acc;
    }, {});

    return dailyStats;
  }

  private getWeekNumber(date: Date): string {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return `${date.getFullYear()}-W${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)}`;
  }
} 