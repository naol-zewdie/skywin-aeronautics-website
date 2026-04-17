import { Injectable, UnauthorizedException, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema';

interface FallbackUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  password: string;
  status: boolean;
}

@Injectable()
export class AuthService {
  private readonly fallbackUsers: FallbackUser[] = [
    {
      id: 'u_001',
      fullName: 'Amelia Hart',
      email: 'admin@skywin.aero',
      role: 'admin',
      password: 'admin123',
      status: true,
    },
    {
      id: 'u_002',
      fullName: 'Rohan Mehta',
      email: 'rohan@skywin.aero',
      role: 'it',
      password: 'rohan123',
      status: true,
    },
    {
      id: 'u_003',
      fullName: 'Sara Chen',
      email: 'sara@skywin.aero',
      role: 'hr',
      password: 'sara123',
      status: true,
    },
  ];

  constructor(
    private jwtService: JwtService,
    @Optional()
    @InjectModel(User.name)
    private userModel?: Model<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Fallback mode (no DB)
    if (!this.userModel) {
      const user = this.fallbackUsers.find((u) => u.email === email);
      if (!user || user.password !== password) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const { password: _, ...result } = user;
      return result;
    }

    // DB mode
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id || user._id, role: user.role };
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id || user._id?.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async getMe(userId: string) {
    // Fallback mode
    if (!this.userModel) {
      const user = this.fallbackUsers.find((u) => u.id === userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const { password: _, ...result } = user;
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
}
