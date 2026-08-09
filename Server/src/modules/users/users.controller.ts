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
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../../common/guards/roles.guard';
import { ActivityService } from '../activity/activity.service';

const MAX_EXPORT_RECORDS = 10000;

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly activityService: ActivityService,
  ) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiOkResponse({ type: UserDto, isArray: true })
  getUsers(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user by id (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiOkResponse({ type: UserDto })
  getUser(@Param('id') id: string): Promise<UserDto> {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create user (Admin only)' })
  @ApiCreatedResponse({ type: UserDto })
  async createUser(
    @Body() payload: CreateUserDto,
    @Req() req: Request,
  ): Promise<UserDto> {
    const actor = req.user as any;
    const result = await this.usersService.create(payload, actor?.userId);
    this.activityService.logUserCreated(payload.fullName, result.id, actor?.userId, actor?.email).catch(() => {});
    return result;
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiOkResponse({ type: UserDto })
  async updateUser(
    @Param('id') id: string,
    @Body() payload: UpdateUserDto,
    @Req() req: Request,
  ): Promise<UserDto> {
    const currentUserId = (req.user as any)?.userId;
    const result = await this.usersService.update(id, payload, currentUserId);
    const actor = req.user as any;
    this.activityService.log({
      action: 'UPDATE',
      entityType: 'user',
      entityId: id,
      entityName: result.fullName,
      userId: actor?.userId,
      userName: actor?.email,
      details: { message: `Updated user ${result.fullName}` },
    }).catch(() => {});
    return result;
  }

  @Post(':id/change-password')
  @HttpCode(204)
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: 'Change password' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiNoContentResponse({ description: 'Password changed successfully' })
  async changePassword(
    @Param('id') id: string,
    @Body() payload: ChangePasswordDto,
    @Req() req: Request,
  ): Promise<void> {
    const currentUserId = (req.user as any)?.userId;
    await this.usersService.changePassword(id, currentUserId, payload);
    const actor = req.user as any;
    this.activityService.log({
      action: 'UPDATE',
      entityType: 'user',
      entityId: id,
      entityName: actor?.email || 'User',
      userId: actor?.userId,
      userName: actor?.email,
      details: { message: `User changed password` },
    }).catch(() => {});
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiNoContentResponse({ description: 'User deleted' })
  async removeUser(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const currentUserId = (req.user as any)?.userId;
    const targetUser = await this.usersService.findOne(id);
    await this.usersService.remove(id, currentUserId);
    const actor = req.user as any;
    this.activityService.log({
      action: 'DELETE',
      entityType: 'user',
      entityId: id,
      entityName: targetUser.fullName,
      userId: actor?.userId,
      userName: actor?.email,
      details: { message: `Deleted user ${targetUser.fullName}` },
    }).catch(() => {});
  }

  @Get('export/csv')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Export users to CSV' })
  async exportCsv(
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const allUsers = await this.usersService.findAll();
    const users = allUsers.slice(0, MAX_EXPORT_RECORDS);
    const csv = this.usersService.exportToCsv(users);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    return csv;
  }

  @Get('export/pdf')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Export users to PDF' })
  async exportPdf(
    @Res({ passthrough: true }) res: Response,
  ): Promise<Buffer> {
    const allUsers = await this.usersService.findAll();
    const users = allUsers.slice(0, MAX_EXPORT_RECORDS);
    const pdfBuffer = await this.usersService.exportToPdf(users);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=users.pdf');
    return pdfBuffer;
  }
}
