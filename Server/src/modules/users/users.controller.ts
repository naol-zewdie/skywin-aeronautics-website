import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import type { Request, Response } from "express";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserDto } from "./dto/user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles, Role } from "../../common/guards/roles.guard";
import { ActivityService } from "../activity/activity.service";

const MAX_EXPORT_RECORDS = 10000;

/** Typed request shape after JWT validation has populated req.user. */
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("JWT-auth")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly activityService: ActivityService,
  ) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "List all users (Admin only)" })
  @ApiOkResponse({ type: UserDto, isArray: true })
  getUsers(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Create user (Admin only)" })
  @ApiCreatedResponse({ type: UserDto })
  async createUser(
    @Body() payload: CreateUserDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<UserDto> {
    const result = await this.usersService.create(payload, req.user?.userId);
    this.activityService
      .logUserCreated(
        payload.fullName,
        result.id,
        req.user?.userId,
        req.user?.email,
      )
      .catch(() => {});
    return result;
  }

  /**
   * Export routes must be declared BEFORE `GET /:id` so that the literal
   * path segment "export" is not matched as an `id` parameter.
   */
  @Get("export/csv")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Export users to CSV" })
  async exportCsv(@Res({ passthrough: true }) res: Response): Promise<string> {
    const allUsers = await this.usersService.findAll();
    const users = allUsers.slice(0, MAX_EXPORT_RECORDS);
    const csv = this.usersService.exportToCsv(users);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    return csv;
  }

  @Get("export/pdf")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Export users to PDF" })
  async exportPdf(@Res({ passthrough: true }) res: Response): Promise<Buffer> {
    const allUsers = await this.usersService.findAll();
    const users = allUsers.slice(0, MAX_EXPORT_RECORDS);
    const pdfBuffer = await this.usersService.exportToPdf(users);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=users.pdf");
    return pdfBuffer;
  }

  @Get(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Get user by id (Admin only)" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  @ApiOkResponse({ type: UserDto })
  getUser(@Param("id") id: string): Promise<UserDto> {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update user (Admin only)" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  @ApiOkResponse({ type: UserDto })
  async updateUser(
    @Param("id") id: string,
    @Body() payload: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<UserDto> {
    const result = await this.usersService.update(
      id,
      payload,
      req.user?.userId,
    );
    this.activityService
      .log({
        action: "UPDATE",
        entityType: "user",
        entityId: id,
        entityName: result.fullName,
        userId: req.user?.userId,
        userName: req.user?.email,
        details: { message: `Updated user ${result.fullName}` },
      })
      .catch(() => {});
    return result;
  }

  @Post(":id/change-password")
  @HttpCode(204)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Change password" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  @ApiNoContentResponse({ description: "Password changed successfully" })
  async changePassword(
    @Param("id") id: string,
    @Body() payload: ChangePasswordDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    // Security: Strict IDOR check at the controller layer
    if (id !== req.user?.userId) {
      throw new ForbiddenException("You can only change your own password");
    }
    await this.usersService.changePassword(id, req.user?.userId, payload);
    this.activityService
      .log({
        action: "UPDATE",
        entityType: "user",
        entityId: id,
        entityName: req.user?.email || "User",
        userId: req.user?.userId,
        userName: req.user?.email,
        details: { message: `User changed password` },
      })
      .catch(() => {});
  }


  @Delete(":id")
  @HttpCode(204)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Delete user (Admin only)" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  @ApiNoContentResponse({ description: "User deleted" })
  async removeUser(
    @Param("id") id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const targetUser = await this.usersService.findOne(id);
    await this.usersService.remove(id, req.user?.userId);
    this.activityService
      .log({
        action: "DELETE",
        entityType: "user",
        entityId: id,
        entityName: targetUser.fullName,
        userId: req.user?.userId,
        userName: req.user?.email,
        details: { message: `Deleted user ${targetUser.fullName}` },
      })
      .catch(() => {});
  }
}
