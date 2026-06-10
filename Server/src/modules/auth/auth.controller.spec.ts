import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
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
        token: 'mock-jwt-token',
        user,
      };

      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(loginResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(loginResult);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto = { email: 'invalid@example.com', password: 'wrongpassword' };
      mockAuthService.validateUser.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error when email is missing', async () => {
      const loginDto = { email: '', password: 'admin123' };
      mockAuthService.validateUser.mockRejectedValue(new Error('Email is required'));

      await expect(controller.login(loginDto)).rejects.toThrow();
    });

    it('should throw error when password is too short', async () => {
      const loginDto = { email: 'test@example.com', password: '123' };
      mockAuthService.validateUser.mockRejectedValue(new Error('Password must be at least 6 characters'));

      await expect(controller.login(loginDto)).rejects.toThrow();
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
