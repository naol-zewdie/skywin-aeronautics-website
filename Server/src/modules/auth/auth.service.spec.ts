import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { MailService } from "../../common/mail/mail.service";
import { TokenBlacklistService } from "./token-blacklist.service";

describe("AuthService", () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mock-jwt-token"),
    signAsync: jest.fn().mockResolvedValue("mock-jwt-token"),
    verify: jest.fn(),
    decode: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockUserModel: any = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockMailService = {
    sendMail: jest.fn().mockResolvedValue(undefined),
  };

  const mockTokenBlacklistService = {
    isBlacklisted: jest.fn().mockResolvedValue(false),
    addToBlacklist: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: getModelToken("User"), useValue: mockUserModel },
        { provide: MailService, useValue: mockMailService },
        { provide: TokenBlacklistService, useValue: mockTokenBlacklistService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe("validateUser", () => {
    it("should throw UnauthorizedException with generic message for invalid email", async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.validateUser("invalid@example.com", "anypassword"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException with generic message for invalid password", async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: "u_001",
          email: "admin@skywin.aero",
          password: "$2b$10$correcthash",
          status: true,
        }),
      });

      await expect(
        service.validateUser("admin@skywin.aero", "wrongpassword"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for disabled user", async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: "u_002",
          email: "disabled@skywin.aero",
          password: "$2b$10$hash",
          status: false,
        }),
      });

      await expect(
        service.validateUser("disabled@skywin.aero", "password"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should return user data on valid credentials", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash("correctpassword", 10);

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: "u_001",
          fullName: "Test User",
          email: "test@skywin.aero",
          password: hashedPassword,
          role: "admin",
          status: true,
        }),
      });

      const result = await service.validateUser(
        "test@skywin.aero",
        "correctpassword",
      );

      expect(result).toEqual({
        id: "u_001",
        fullName: "Test User",
        email: "test@skywin.aero",
        role: "admin",
        status: true,
      });
    });
  });

  describe("login", () => {
    it("should return access token, refresh token, and expiration", async () => {
      const user = {
        id: "u_001",
        fullName: "Test User",
        email: "test@skywin.aero",
        role: "admin",
        status: true,
      };

      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ tokenVersion: 0 }),
        }),
      });

      mockJwtService.signAsync
        .mockResolvedValueOnce("mock-access-token")
        .mockResolvedValueOnce("mock-refresh-token");

      const result = await service.login(user);

      expect(result.accessToken).toBe("mock-access-token");
      expect(result.refreshToken).toBe("mock-refresh-token");
      expect(result.expiresAt).toBeGreaterThan(Date.now());
      expect(result.user).toEqual(user);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ type: "access" }),
        expect.any(Object),
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ type: "refresh" }),
        expect.objectContaining({ secret: expect.any(String) }),
      );
    });
  });

  describe("refreshToken", () => {
    it("should return new tokens on valid refresh token", async () => {
      const refreshToken = "valid-refresh-token";
      const payload = {
        sub: "u_001",
        email: "test@skywin.aero",
        role: "admin",
        type: "refresh" as const,
        tokenVersion: 0,
        iat: Date.now() / 1000,
        exp: Date.now() / 1000 + 86400,
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: "u_001",
          email: "test@skywin.aero",
          role: "admin",
          status: true,
          tokenVersion: 0,
        }),
      });
      mockJwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 86400,
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce("new-access-token")
        .mockResolvedValueOnce("new-refresh-token");

      const result = await service.refreshToken(refreshToken);

      expect(result.accessToken).toBe("new-access-token");
      expect(result.refreshToken).toBe("new-refresh-token");
      expect(mockJwtService.verify).toHaveBeenCalledWith(
        refreshToken,
        expect.any(Object),
      );
    });

    it("should throw UnauthorizedException for access token type", async () => {
      const refreshToken = "access-token-mistake";
      const payload = {
        sub: "u_001",
        email: "test@skywin.aero",
        role: "admin",
        type: "access" as const,
      };

      mockJwtService.verify.mockReturnValue(payload);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException for expired refresh token", async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error("Token expired");
      });

      await expect(service.refreshToken("expired-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("logout", () => {
    it("should blacklist access token and increment tokenVersion", async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 900;
      mockJwtService.verify.mockReturnValue({
        exp: futureExp,
        sub: "user-123",
      });
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      await service.logout("valid-access-token");

      expect(mockTokenBlacklistService.addToBlacklist).toHaveBeenCalledWith(
        "valid-access-token",
        new Date(futureExp * 1000),
      );
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith("user-123", {
        $inc: { tokenVersion: 1 },
      });
    });

    it("should blacklist refresh token when provided", async () => {
      const accessExp = Math.floor(Date.now() / 1000) + 900;
      const refreshExp = Math.floor(Date.now() / 1000) + 86400;
      mockJwtService.verify
        .mockReturnValueOnce({ exp: accessExp, sub: "user-123" })
        .mockReturnValueOnce({ exp: refreshExp, sub: "user-123" });
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      await service.logout("valid-access-token", "valid-refresh-token");

      expect(mockTokenBlacklistService.addToBlacklist).toHaveBeenCalledTimes(2);
      expect(mockTokenBlacklistService.addToBlacklist).toHaveBeenCalledWith(
        "valid-refresh-token",
        new Date(refreshExp * 1000),
      );
    });
  });

  describe("security considerations", () => {
    it("should generate tokens with appropriate expiration", async () => {
      const user = {
        id: "u_001",
        fullName: "Test User",
        email: "test@skywin.aero",
        role: "admin",
        status: true,
      };

      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ tokenVersion: 0 }),
        }),
      });

      mockJwtService.signAsync
        .mockResolvedValueOnce("access-token")
        .mockResolvedValueOnce("refresh-token");

      const result = await service.login(user);

      const expectedExpiry = Date.now() + 15 * 60 * 1000;
      expect(result.expiresAt).toBeGreaterThan(Date.now());
      expect(result.expiresAt).toBeLessThanOrEqual(expectedExpiry + 5000);
    });
  });
});
