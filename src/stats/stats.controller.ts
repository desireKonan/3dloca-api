import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('totals')
  async getTotalStats() {
    return this.statsService.getTotalStats();
  }

  @Get('monthly')
  async getMonthlyStats() {
    return this.statsService.getAnnoncesByMonth();
  }

  @Get('weekly')
  async getWeeklyStats() {
    return this.statsService.getAnnoncesByWeek();
  }

  @Get('daily')
  async getDailyStats() {
    return this.statsService.getAnnoncesByDay();
  }
} 