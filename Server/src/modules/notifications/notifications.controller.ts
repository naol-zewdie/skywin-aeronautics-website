import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import { Notification } from "./schemas/notification.schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles, Role } from "../../common/guards/roles.guard";
import type { Request } from "express";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Get all notifications" })
  async findAll(@Req() req: Request): Promise<Notification[]> {
    const userId = (req.user as any)?.userId;
    return this.notificationsService.findAll(userId);
  }

  @Get("unread")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Get unread notifications" })
  async findUnread(@Req() req: Request): Promise<Notification[]> {
    const userId = (req.user as any)?.userId;
    return this.notificationsService.findUnread(userId);
  }

  @Get("unread-count")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Get unread notification count" })
  async getUnreadCount(@Req() req: Request): Promise<{ count: number }> {
    const userId = (req.user as any)?.userId;
    const unread = await this.notificationsService.findUnread(userId);
    return { count: unread.length };
  }

  @Post(":id/read")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Mark notification as read" })
  async markAsRead(
    @Param("id") id: string,
    @Req() req: Request,
  ): Promise<Notification | null> {
    const userId = (req.user as any)?.userId;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Post("read-all")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Mark all notifications as read" })
  async markAllAsRead(@Req() req: Request): Promise<void> {
    const userId = (req.user as any)?.userId;
    return this.notificationsService.markAllAsRead(userId);
  }
}
