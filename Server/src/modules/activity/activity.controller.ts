import { Controller, Get, Query, Req } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ActivityService, DashboardStats } from "./activity.service";
import { Activity } from "./schemas/activity.schema";
import { Roles, Role } from "../../common/guards/roles.guard";

/** Typed request shape after JWT validation has populated req.user. */
interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags("activity")
@Controller("activity")
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Get activity logs with filters" })
  @ApiQuery({
    name: "entityType",
    required: false,
    description: "Filter by entity type",
  })
  @ApiQuery({
    name: "userId",
    required: false,
    description: "Filter by user ID",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Start date (ISO format)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "End date (ISO format)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Limit results",
    type: Number,
  })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query("entityType") entityType?: string,
    @Query("userId") userId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: string,
  ): Promise<Activity[]> {
    const queryUserId =
      req.user?.role === Role.ADMIN ? userId : req.user?.userId;

    return this.activityService.findAll({
      entityType,
      userId: queryUserId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 50,
    });
  }

  @Get("stats")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Get dashboard statistics" })
  async getStats(@Req() req: AuthenticatedRequest): Promise<DashboardStats> {
    return this.activityService.getStats(req.user?.role, req.user?.userId);
  }

  @Get("recent")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Get recent activity" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getRecent(
    @Req() req: AuthenticatedRequest,
    @Query("limit") limit?: string,
  ): Promise<Activity[]> {
    // Operators only see their own activity; admins see all.
    const userId = req.user?.role === Role.ADMIN ? undefined : req.user?.userId;
    return this.activityService.findAll({
      userId,
      limit: limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 20,
    });
  }
}
