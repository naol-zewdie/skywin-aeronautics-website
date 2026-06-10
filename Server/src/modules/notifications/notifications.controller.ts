import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService, Notification } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  async findAll(@Query('userId') userId?: string): Promise<Notification[]> {
    return this.notificationsService.findAll(userId);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  async findUnread(@Query('userId') userId?: string): Promise<Notification[]> {
    return this.notificationsService.findUnread(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Query('userId') userId?: string): Promise<{ count: number }> {
    const unread = await this.notificationsService.findUnread(userId);
    return { count: unread.length };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string): Promise<Notification | null> {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Query('userId') userId?: string): Promise<void> {
    return this.notificationsService.markAllAsRead(userId);
  }
}
