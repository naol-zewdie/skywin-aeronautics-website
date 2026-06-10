import { Controller, Post, Get, Body, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}

class RefreshTokenDto {
  @IsString()
  @MinLength(1, { message: 'Refresh token is required' })
  refreshToken: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: boolean;
  };
}

interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: boolean;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'JWT access token (short-lived)' },
        refreshToken: { type: 'string', description: 'JWT refresh token (long-lived)' },
        expiresAt: { type: 'number', description: 'Token expiration timestamp (ms)' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            status: { type: 'boolean' },
          },
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresAt: { type: 'number' },
      },
    },
  })
  async refreshToken(@Body() refreshDto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string; expiresAt: number }> {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout current user' })
  async logout(@Request() req: { user: { userId: string } }): Promise<void> {
    await this.authService.logout(req.user.userId);
    return;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        fullName: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
        status: { type: 'boolean' },
      },
    },
  })
  async getMe(@Request() req: { user: { userId: string } }): Promise<UserResponse> {
    const user = await this.authService.getMe(req.user.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
