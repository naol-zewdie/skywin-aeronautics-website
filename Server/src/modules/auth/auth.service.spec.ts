import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    exec: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password on valid credentials (fallback mode)', async () => {
      // In fallback mode (no DB), uses hardcoded users
      const result = await service.validateUser('admin@skywin.aero', 'admin123');

      expect(result).toBeDefined();
      expect(result.email).toBe('admin@skywin.aero');
      expect(result.password).toBeUndefined();
      expect(result.role).toBe('admin');
    });

    it('should return user without password for IT user (fallback mode)', async () => {
      const result = await service.validateUser('rohan@skywin.aero', 'rohan123');

      expect(result).toBeDefined();
      expect(result.email).toBe('rohan@skywin.aero');
      expect(result.role).toBe('it');
      expect(result.password).toBeUndefined();
    });

    it('should throw UnauthorizedException on invalid email (fallback mode)', async () => {
      await expect(service.validateUser('invalid@example.com', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on invalid password (fallback mode)', async () => {
      await expect(service.validateUser('admin@skywin.aero', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when both email and password are wrong', async () => {
      await expect(service.validateUser('wrong@example.com', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return JWT token and user data', async () => {
      const user = {
        id: 'u_001',
        fullName: 'Amelia Hart',
        email: 'admin@skywin.aero',
        role: 'admin',
        status: true,
      };

      const result = await service.login(user);

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user).toEqual(user);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        role: user.role,
      });
    });

    it('should handle user with _id instead of id', async () => {
      const user = {
        _id: 'u_002',
        fullName: 'Rohan Mehta',
        email: 'rohan@skywin.aero',
        role: 'it',
        status: true,
      };

      const result = await service.login(user);

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.id).toBe('u_002');
    });
  });

  describe('getMe', () => {
    it('should return user profile without password (fallback mode)', async () => {
      const result = await service.getMe('u_001');

      expect(result).toBeDefined();
      expect(result.id).toBe('u_001');
      expect(result.email).toBe('admin@skywin.aero');
      expect(result.password).toBeUndefined();
    });

    it('should throw UnauthorizedException for non-existent user (fallback mode)', async () => {
      await expect(service.getMe('non-existent-id')).rejects.toThrow(UnauthorizedException);
    });

    it('should return HR user profile', async () => {
      const result = await service.getMe('u_003');

      expect(result).toBeDefined();
      expect(result.role).toBe('hr');
      expect(result.email).toBe('sara@skywin.aero');
    });
  });
});
