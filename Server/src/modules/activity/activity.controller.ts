import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService, Activity } from './activity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('activity')
@Controller('activity')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get activity logs with filters' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results', type: Number })
  async findAll(
    @Query('entityType') entityType?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ): Promise<Activity[]> {
    return this.activityService.findAll({
      entityType,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get activity statistics' })
  async getStats(): Promise<{
    totalToday: number;
    totalThisWeek: number;
    totalThisMonth: number;
    byEntityType: Record<string, number>;
    byAction: Record<string, number>;
  }> {
    return this.activityService.getStats();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecent(@Query('limit') limit?: string): Promise<Activity[]> {
    return this.activityService.findAll({ limit: limit ? parseInt(limit, 10) : 20 });
  }
}
