import { Controller, Get, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('finance')
  async getFinancialStats(@Request() req: any, @Query('branchId') branchId?: string) {
    // Only Admin can access financial reports
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only Admin can access financial reports');
    }

    // Branch Admins (with branchId) can ONLY see their own branch stats
    // Super Admins (branchId === null) can see anything
    let targetBranchId = branchId;
    if (req.user.branchId !== null) {
      targetBranchId = req.user.branchId;
    }

    return this.statsService.getFinancialStats(targetBranchId);
  }
}
