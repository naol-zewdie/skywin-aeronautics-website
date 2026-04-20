import { Injectable, UnauthorizedException, Optional, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema';

export interface TokenPayload {
  email: string;
  sub: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginResult {
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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In production, these should come from environment variables or a secure vault
  private readonly fallbackUsers = [
    {
      id: 'u_001',
      fullName: 'Amelia Hart',
      email: 'admin@skywin.aero',
      role: 'admin',
      // Hashed password: 'admin123' (change in production!)
      passwordHash: '$2b$10$hsSWtDbNM/Xw/6ZPzKpqIun2BrysA.pZDD0dNFEwAPqilPvc9pxbi',
      status: true,
    },
    {
      id: 'u_002',
      fullName: 'Rohan Mehta',
      email: 'it@skywin.aero',
      role: 'it',
      // Hashed password: 'it123' (change in production!)
      passwordHash: '$2b$10$L1CpHR7/g0NUcZzQCrG7weSZQ1kcaDLwYyDIVMHXD.bZoNY9nzqcC',
      status: true,
    },
    {
      id: 'u_003',
      fullName: 'Sara Chen',
      email: 'hr@skywin.aero',
      role: 'hr',
      // Hashed password: 'hr123' (change in production!)
      passwordHash: '$2b$10$1fAq96Wwbe1RKHz41P2qHeQbhr6ie55YDizegZIh/WAySizk3COBq',
      status: true,
    },
  ];

  constructor(
    private jwtService: JwtService,
    @Optional()
    @InjectModel(User.name)
    private userModel?: Model<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<{ id: string; fullName: string; email: string; role: string; status: boolean }> {
    // Security: Generic error message to prevent user enumeration
    const invalidCredentialsError = new UnauthorizedException('Authentication failed');

    // Fallback mode (no DB)
    if (!this.userModel) {
      const user = this.fallbackUsers.find((u) => u.email === email);
      if (!user || !user.status) {
        // Use constant-time comparison to prevent timing attacks
        await bcrypt.compare('dummy', '$2b$10$dummyhashfordummycomparison');
        throw invalidCredentialsError;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw invalidCredentialsError;
      }

      const { passwordHash: _, ...result } = user;
      return result;
    }

    // DB mode
    const user = await this.userModel.findOne({ email }).exec();
    if (!user || !user.status) {
      // Prevent timing attacks
      await bcrypt.compare('dummy', '$2b$10$dummyhashfordummycomparison');
      throw invalidCredentialsError;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw invalidCredentialsError;
    }

    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  async login(user: { id: string; fullName: string; email: string; role: string; status: boolean }): Promise<LoginResult> {
    const tokens = await this.generateTokens({
      email: user.email,
      sub: user.id,
      role: user.role,
    });

    this.logger.log(`User logged in: ${user.email} (${user.role})`);

    return {
      ...tokens,
      user,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Verify user still exists and is active
      const user = await this.getMe(payload.sub);
      if (!user || !user.status) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.generateTokens({
        email: payload.email,
        sub: payload.sub,
        role: payload.role,
      });
    } catch (error) {
      this.logger.warn('Token refresh failed', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(payload: { email: string; sub: string; role: string }): Promise<AuthTokens> {
    const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          email: payload.email,
          sub: payload.sub,
          role: payload.role,
          type: 'access',
        } as Record<string, unknown>,
        {
          expiresIn: accessTokenExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      ),
      this.jwtService.signAsync(
        {
          email: payload.email,
          sub: payload.sub,
          role: payload.role,
          type: 'refresh',
        } as Record<string, unknown>,
        {
          expiresIn: refreshTokenExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
          secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        },
      ),
    ]);

    // Calculate expiration timestamp
    const expiresInSeconds = this.parseExpirationToSeconds(accessTokenExpiresIn);
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    return { accessToken, refreshToken, expiresAt };
  }

  private parseExpirationToSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * (multipliers[unit] || 60);
  }

  async getMe(userId: string): Promise<{ id: string; fullName: string; email: string; role: string; status: boolean } | null> {
    // Fallback mode
    if (!this.userModel) {
      const user = this.fallbackUsers.find((u) => u.id === userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const { passwordHash: _, ...result } = user;
      return result;
    }

    // DB mode
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  async logout(userId: string): Promise<void> {
    // In a stateless JWT system, logout is handled client-side
    // For server-side token blacklisting, implement Redis store here
    this.logger.log(`User logged out: ${userId}`);
  }
}
