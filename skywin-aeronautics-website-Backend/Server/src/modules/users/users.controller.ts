import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../../common/guards/roles.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  createUser(@Body() payload: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(payload);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiOkResponse({ type: UserDto })
  updateUser(
    @Param('id') id: string,
    @Body() payload: UpdateUserDto,
  ): Promise<UserDto> {
    const req = (this as any).req || {};
    const currentUserId = req.user?.sub;
    return this.usersService.update(id, payload, currentUserId);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiNoContentResponse({ description: 'User deleted' })
  removeUser(@Param('id') id: string): Promise<void> {
    const req = (this as any).req || {};
    const currentUserId = req.user?.sub;
    return this.usersService.remove(id, currentUserId);
  }

  @Get('export/csv')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Export users to CSV' })
  async exportCsv(
    @Res() res: Response,
    @Query('search') search?: string,
  ): Promise<void> {
    const users = await this.usersService.findAll();
    const csv = this.usersService.exportToCsv(users);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  }

  @Get('export/pdf')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Export users to PDF' })
  async exportPdf(
    @Res() res: Response,
    @Query('search') search?: string,
  ): Promise<void> {
    const users = await this.usersService.findAll();
    const pdfBuffer = await this.usersService.exportToPdf(users);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=users.pdf');
    res.send(pdfBuffer);
  }
}
