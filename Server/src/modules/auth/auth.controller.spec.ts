import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    getMe: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  const mockRateLimitGuard = {
    resetAttempts: jest.fn().mockResolvedValue(undefined),
    recordFailedAttempt: jest.fn().mockResolvedValue(undefined),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn().mockReturnValue(false),
  };

  const mockRateLimitModel = {
    findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    create: jest.fn(),
    deleteMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RateLimitGuard, useValue: mockRateLimitGuard },
        { provide: Reflector, useValue: mockReflector },
        { provide: getModelToken('RateLimit'), useValue: mockRateLimitModel },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return token and user on successful login', async () => {
      const loginDto = { email: 'admin@skywin.aero', password: 'admin123' };
      const user = {
        id: 'u_001',
        fullName: 'Amelia Hart',
        email: 'admin@skywin.aero',
        role: 'admin',
        status: true,
      };
      const loginResult = {
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() + 900000,
        user,
      };

      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(loginResult);

      const req = { ip: '127.0.0.1' } as any;
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      const result = await controller.login(loginDto, req, res);

      const { refreshToken, ...expectedResponse } = loginResult;
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
      expect(mockRateLimitGuard.resetAttempts).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto = { email: 'invalid@example.com', password: 'wrongpassword' };
      mockAuthService.validateUser.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      const req = { ip: '127.0.0.1' } as any;
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      await expect(controller.login(loginDto, req, res)).rejects.toThrow(UnauthorizedException);
      expect(mockRateLimitGuard.recordFailedAttempt).toHaveBeenCalled();
    });

    it('should throw error when email is missing', async () => {
      const loginDto = { email: '', password: 'admin123' };
      mockAuthService.validateUser.mockRejectedValue(new Error('Email is required'));

      const req = { ip: '127.0.0.1' } as any;
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      await expect(controller.login(loginDto, req, res)).rejects.toThrow();
    });

    it('should throw error when password is too short', async () => {
      const loginDto = { email: 'test@example.com', password: '123' };
      mockAuthService.validateUser.mockRejectedValue(new Error('Password must be at least 6 characters'));

      const req = { ip: '127.0.0.1' } as any;
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
      await expect(controller.login(loginDto, req, res)).rejects.toThrow();
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user profile', async () => {
      const mockRequest = { user: { userId: 'u_001', email: 'admin@skywin.aero', role: 'admin' } };
      const userProfile = {
        id: 'u_001',
        fullName: 'Amelia Hart',
        email: 'admin@skywin.aero',
        role: 'admin',
        status: true,
      };

      mockAuthService.getMe.mockResolvedValue(userProfile);

      const result = await controller.getMe(mockRequest);

      expect(result).toEqual(userProfile);
      expect(mockAuthService.getMe).toHaveBeenCalledWith('u_001');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const mockRequest = { user: { userId: 'non-existent', email: 'test@test.com', role: 'viewer' } };
      mockAuthService.getMe.mockRejectedValue(new UnauthorizedException('User not found'));

      await expect(controller.getMe(mockRequest)).rejects.toThrow(UnauthorizedException);
    });
  });
});
