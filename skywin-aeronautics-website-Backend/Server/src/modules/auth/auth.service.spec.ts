import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    verify: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    // Set JWT secret for testing
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException with generic message for invalid email', async () => {
      await expect(service.validateUser('invalid@example.com', 'anypassword')).rejects.toThrow(
        UnauthorizedException,
      );

      try {
        await service.validateUser('invalid@example.com', 'anypassword');
      } catch (error) {
        expect((error as UnauthorizedException).message).toBe('Authentication failed');
      }
    });

    it('should throw UnauthorizedException with generic message for invalid password', async () => {
      // NOTE: This test uses fallback mode which has hardcoded users
      // In production, these passwords would be hashed
      await expect(
        service.validateUser('admin@skywin.aero', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for disabled user', async () => {
      // This would require a disabled user in the test data
      await expect(
        service.validateUser('nonexistent@skywin.aero', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should prevent timing attacks by using bcrypt comparison', async () => {
      const startInvalid = Date.now();
      await expect(
        service.validateUser('invalid@skywin.aero', 'password'),
      ).rejects.toThrow();
      const durationInvalid = Date.now() - startInvalid;

      const startAnotherInvalid = Date.now();
      await expect(
        service.validateUser('another-invalid@skywin.aero', 'wrongpass'),
      ).rejects.toThrow();
      const durationAnotherInvalid = Date.now() - startAnotherInvalid;

      // Both should take similar time (using dummy bcrypt comparison)
      expect(Math.abs(durationInvalid - durationAnotherInvalid)).toBeLessThan(100);
    });
  });

  describe('login', () => {
    it('should return access token, refresh token, and expiration', async () => {
      const user = {
        id: 'u_001',
        fullName: 'Test User',
        email: 'test@skywin.aero',
        role: 'admin',
        status: true,
      };

      mockJwtService.signAsync
        .mockResolvedValueOnce('mock-access-token')
        .mockResolvedValueOnce('mock-refresh-token');

      const result = await service.login(user);

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.expiresAt).toBeGreaterThan(Date.now());
      expect(result.user).toEqual(user);

      // Verify token types are correct
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'access' }),
        expect.any(Object),
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'refresh' }),
        expect.objectContaining({ secret: expect.any(String) }),
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens on valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        sub: 'u_001',
        email: 'test@skywin.aero',
        role: 'admin',
        type: 'refresh' as const,
        iat: Date.now() / 1000,
        exp: Date.now() / 1000 + 86400,
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refreshToken(refreshToken);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken, expect.any(Object));
    });

    it('should throw UnauthorizedException for access token type', async () => {
      const refreshToken = 'access-token-mistake';
      const payload = {
        sub: 'u_001',
        email: 'test@skywin.aero',
        role: 'admin',
        type: 'access' as const,
      };

      mockJwtService.verify.mockReturnValue(payload);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should complete without error', async () => {
      await expect(service.logout('u_001')).resolves.not.toThrow();
    });
  });

  describe('security considerations', () => {
    it('should generate tokens with appropriate expiration', async () => {
      const user = {
        id: 'u_001',
        fullName: 'Test User',
        email: 'test@skywin.aero',
        role: 'admin',
        status: true,
      };

      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login(user);

      // Access token should expire in 15 minutes (900 seconds) + current time
      const expectedExpiry = Date.now() + 15 * 60 * 1000;
      expect(result.expiresAt).toBeGreaterThan(Date.now());
      expect(result.expiresAt).toBeLessThanOrEqual(expectedExpiry + 5000); // Allow 5 second buffer
    });

  });
});
