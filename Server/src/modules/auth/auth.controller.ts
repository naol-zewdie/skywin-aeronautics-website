import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
  Res,
  Logger,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Public } from "../../common/guards/public.decorator";
import { RateLimitGuard } from "../../common/guards/rate-limit.guard";
import { CsrfGuard, generateCsrfToken } from "../../common/guards/csrf.guard";
import {
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./dto/auth.dto";
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

interface LoginResponse {
  accessToken: string;
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

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly rateLimitGuard: RateLimitGuard,
  ) {}

  @Public()
  @Get("csrf-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get a CSRF token (sets csrf-token cookie)" })
  /**
   * Issues a CSRF token via an HttpOnly-false cookie with sameSite: 'strict'
   * so the browser JavaScript layer can read it and echo it back in the
   * X-CSRF-Token header on all mutating requests.
   */
  getCsrfToken(@Res({ passthrough: true }) res: ExpressResponse): {
    token: string;
  } {
    const token = generateCsrfToken();
    const cookieSecure = this.areCookiesSecure();
    res.cookie("csrf-token", token, {
      httpOnly: false,
      secure: cookieSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1 hour — regenerated on login
    });
    return { token };
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: "Login with email and password" })
  @ApiBody({ type: LoginDto })
  /**
   * Authenticates a user with email + password credentials.
   * On success, sets httpOnly cookies for the access and refresh tokens,
   * rotates the CSRF token, and returns the access token plus user info.
   * On failure, records the failed attempt for IP-based rate limiting.
   */
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        accessToken: {
          type: "string",
          description: "JWT access token (short-lived)",
        },
        expiresAt: {
          type: "number",
          description: "Token expiration timestamp (ms)",
        },
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            fullName: { type: "string" },
            email: { type: "string" },
            role: { type: "string" },
            status: { type: "boolean" },
          },
        },
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<Omit<LoginResponse, "refreshToken">> {
    try {
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );
      await this.rateLimitGuard.resetAttempts(req);
      const result = await this.authService.login(user);
      this.setAuthCookies(
        res,
        result.accessToken,
        result.refreshToken,
        result.expiresAt,
      );
      // Regenerate CSRF token on login with lax sameSite protection
      const csrfToken = generateCsrfToken();
      const cookieSecure = this.areCookiesSecure();
      res.cookie("csrf-token", csrfToken, {
        httpOnly: false,
        secure: cookieSecure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 1000,
      });
      const { refreshToken, ...safeResult } = result;
      return safeResult;
    } catch (error) {
      await this.rateLimitGuard.recordFailedAttempt(req);
      throw error;
    }
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: "Refresh access token using refresh token" })
  @ApiBody({ type: RefreshTokenDto })
  /**
   * Issues a new access + refresh token pair by verifying the provided refresh
   * token. The old refresh token is immediately blacklisted (rotation).
   * Token may be supplied via body or the refreshToken httpOnly cookie.
   */
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        accessToken: { type: "string" },
        expiresAt: { type: "number" },
      },
    },
  })
  async refreshToken(
    @Body() refreshDto: RefreshTokenDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<{ accessToken: string; expiresAt: number }> {
    const token =
      refreshDto?.refreshToken ||
      (req.cookies?.["refreshToken"] as string | undefined);
    if (!token) {
      throw new UnauthorizedException("Refresh token is required");
    }
    const result = await this.authService.refreshToken(token);
    this.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.expiresAt,
    );
    const { refreshToken: _, ...safeResult } = result;
    return safeResult;
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: "Request a password reset email" })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          // Security: uniform message prevents email enumeration
          example:
            "If that email is registered, a password reset link has been sent.",
        },
      },
    },
  })
  /**
   * Initiates a password reset flow for the given email address.
   *
   * Security: Always returns the same response message regardless of whether
   * the email address is registered, preventing email-enumeration attacks.
   */
  async forgotPassword(
    @Body() forgotDto: ForgotPasswordDto,
    @Req() _req: ExpressRequest,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(forgotDto.email);
    // Security (S1): Return a uniform message — never disclose whether the email exists.
    return {
      message:
        "If that email is registered, a password reset link has been sent.",
    };
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: "Reset password using a reset token" })
  @ApiBody({ type: ResetPasswordDto })
  /**
   * Validates a one-time reset token and sets the user's new password.
   * The token is consumed on use and the user's session version is incremented
   * to invalidate all existing tokens.
   */
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "Password has been reset successfully.",
        },
      },
    },
  })
  async resetPassword(
    @Body() resetDto: ResetPasswordDto,
    @Req() req: ExpressRequest,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(
      resetDto.token,
      resetDto.email,
      resetDto.password,
    );
    return { message: "Password has been reset successfully." };
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Logout current user" })
  /**
   * Invalidates the current session by blacklisting the access and refresh
   * tokens, incrementing the user's tokenVersion, and clearing auth cookies.
   * Proceeds silently even if the token is already expired or invalid.
   */
  async logout(
    @Request()
    req: {
      headers: { authorization?: string };
      cookies?: Record<string, string>;
    },
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<void> {
    const authHeader = req.headers.authorization;
    const rawToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const cookieToken = req.cookies?.["accessToken"] as string | undefined;
    const token = rawToken || cookieToken;
    const refreshToken = req.cookies?.["refreshToken"] as string | undefined;

    if (token) {
      try {
        await this.authService.logout(token, refreshToken);
      } catch (e) {
        // Log unexpected errors (e.g. DB failures) but do not block cookie clearing,
        // which must always succeed so the client session is terminated.
        if (e instanceof Error) {
          this.logger.warn(`[AuthController] logout warning: ${e.message}`);
        }
      }
    }

    this.clearAuthCookies(res);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current authenticated user" })
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        fullName: { type: "string" },
        email: { type: "string" },
        role: { type: "string" },
        status: { type: "boolean" },
      },
    },
  })
  /**
   * Returns the profile of the currently authenticated user.
   * The user identity is derived from the validated JWT payload — no
   * user-supplied ID is trusted.
   */
  async getMe(
    @Request() req: { user: { userId: string } },
  ): Promise<UserResponse> {
    const user = await this.authService.getMe(req.user.userId);
    if (!user) {
      // Bug B1 fix: throw a proper 404 instead of a generic Error (500).
      throw new NotFoundException("User not found");
    }
    return user;
  }

  private setAuthCookies(
    res: ExpressResponse,
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
  ): void {
    const cookieSecure = this.areCookiesSecure();
    const cookieOptions = {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: "lax" as const,
      path: "/",
    };

    const accessMaxAge = this.parseExpirationToMs(
      process.env.JWT_EXPIRES_IN || "15m",
    );
    const refreshMaxAge = this.parseExpirationToMs(
      process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    );

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: accessMaxAge,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: refreshMaxAge,
      path: "/",
    });
  }

  private clearAuthCookies(res: ExpressResponse): void {
    const cookieSecure = this.areCookiesSecure();
    const cookieOpts = {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: "lax" as const,
    };
    res.clearCookie("accessToken", { ...cookieOpts, path: "/" });
    res.clearCookie("refreshToken", { ...cookieOpts, path: "/" });
    res.clearCookie("csrf-token", {
      ...cookieOpts,
      path: "/",
      httpOnly: false,
    });
  }

  /**
   * Cookies must match the flag they were set with (Secure cookies are ignored
   * over plain HTTP). Default to secure in production, but allow deployments
   * without TLS to override with COOKIE_SECURE=false.
   */
  private areCookiesSecure(): boolean {
    const override = process.env.COOKIE_SECURE;
    if (override === "true") return true;
    if (override === "false") return false;
    return process.env.NODE_ENV === "production";
  }

  private parseExpirationToMs(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900000; // default 15 min
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
    };
    return value * (multipliers[unit] || 60000);
  }
}
