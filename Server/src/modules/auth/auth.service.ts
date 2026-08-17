import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { User } from "../users/schemas/user.schema";
import { MailService } from "../../common/mail/mail.service";
import { TokenBlacklistService } from "./token-blacklist.service";
import { toOpaqueRole } from "../../common/utils/role-obfuscator";

export interface TokenPayload {
  email: string;
  sub: string;
  role: string;
  type: "access" | "refresh";
  tokenVersion: number;
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
  private readonly dummyHash: string;

  /**
   * Creates the service instance and pre-computes a dummy bcrypt hash.
   * The dummy hash is used for constant-time comparison when a user is not
   * found, preventing timing-based user enumeration attacks.
   */
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private mailService: MailService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {
    this.dummyHash = bcrypt.hashSync("dummy", 12);
  }

  /**
   * Validates a user's email + password credentials.
   *
   * Security: Performs a constant-time dummy bcrypt compare even when the user
   * is not found, preventing timing-based enumeration of registered emails.
   * Returns a safe subset of user fields (no password hash).
   *
   * @throws UnauthorizedException if credentials are invalid or user is inactive.
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: boolean;
  }> {
    const invalidCredentialsError = new UnauthorizedException(
      "Authentication failed",
    );

    const user = await this.userModel
      .findOne({ email: String(email).toLowerCase().trim() })
      .exec();

    if (!user) {
      await bcrypt.compare("dummy", this.dummyHash); // timing protection
      this.logger.warn("Login failed: user not found");
      throw invalidCredentialsError;
    }

    if (!user.status) {
      await bcrypt.compare("dummy", this.dummyHash);
      this.logger.warn("Login failed: user inactive");
      throw invalidCredentialsError;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn("Login failed: incorrect password");
      throw invalidCredentialsError;
    }

    this.logger.log("User authenticated successfully");
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }
  /**
   * Generates a JWT access + refresh token pair for the given user.
   * Reads the current tokenVersion from the database to embed in both tokens,
   * enabling instant session revocation via version increment.
   *
   * @param user - Validated user data (must already be authenticated).
   * @returns Access token, refresh token, and expiry timestamp.
   */
  async login(user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: boolean;
  }): Promise<LoginResult> {
    // Read current tokenVersion from DB
    const isObjId = Types.ObjectId.isValid(user.id);
    const userQuery: any = isObjId
      ? { $or: [{ _id: user.id }, { _id: new Types.ObjectId(user.id) }] }
      : { _id: user.id };
    const dbUser = await this.userModel
      .findOne(userQuery)
      .select("tokenVersion")
      .exec();
    const tokenVersion = dbUser?.tokenVersion ?? 0;

    const tokens = await this.generateTokens({
      email: user.email,
      sub: user.id,
      role: user.role,
      tokenVersion,
    });

    this.logger.log("User logged in");

    return {
      ...tokens,
      user: {
        ...user,
        role: toOpaqueRole(user.role),
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new UnauthorizedException("Refresh token support not configured");
    }
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: refreshSecret,
      });

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid token type");
      }

      // Check if refresh token is blacklisted
      if (await this.tokenBlacklistService.isBlacklisted(refreshToken)) {
        throw new UnauthorizedException("Refresh token has been revoked");
      }

      // Read current user from DB — validate status AND tokenVersion
      const sub = payload.sub;
      const isSubObjId = Types.ObjectId.isValid(sub);
      const subQuery: any = isSubObjId
        ? { $or: [{ _id: sub }, { _id: new Types.ObjectId(sub) }] }
        : { _id: sub };
      const user = await this.userModel.findOne(subQuery).exec();
      if (!user || !user.status) {
        throw new UnauthorizedException("User not found or inactive");
      }

      if (
        payload.tokenVersion !== undefined &&
        payload.tokenVersion !== user.tokenVersion
      ) {
        throw new UnauthorizedException(
          "Session invalidated — please log in again",
        );
      }

      // C1 FIX: Blacklist the old refresh token (rotation)
      const oldPayload = this.jwtService.decode<{ exp?: number }>(refreshToken);
      if (oldPayload?.exp) {
        const expiresAt = new Date(oldPayload.exp * 1000);
        await this.tokenBlacklistService.addToBlacklist(
          refreshToken,
          expiresAt,
        );
      }

      return this.generateTokens({
        email: user.email,
        sub: payload.sub,
        role: user.role,
        tokenVersion: user.tokenVersion,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      // S6 fix: Guard access to .message — error is typed as unknown in strict mode.
      const message =
        error instanceof Error ? error.message : "Token verification failed";
      this.logger.warn(`Token refresh failed: ${message}`);
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  private async generateTokens(payload: {
    email: string;
    sub: string;
    role: string;
    tokenVersion: number;
  }): Promise<AuthTokens> {
    const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
    const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new UnauthorizedException("Refresh token support not configured");
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          email: payload.email,
          sub: payload.sub,
          role: payload.role,
          type: "access",
          tokenVersion: payload.tokenVersion,
        } as Record<string, unknown>,
        {
          expiresIn:
            accessTokenExpiresIn as `${number}${"s" | "m" | "h" | "d"}`,
        },
      ),
      this.jwtService.signAsync(
        {
          email: payload.email,
          sub: payload.sub,
          role: payload.role,
          type: "refresh",
          tokenVersion: payload.tokenVersion,
        } as Record<string, unknown>,
        {
          expiresIn:
            refreshTokenExpiresIn as `${number}${"s" | "m" | "h" | "d"}`,
          secret: refreshSecret,
        },
      ),
    ]);

    // Calculate expiration timestamp
    const expiresInSeconds =
      this.parseExpirationToSeconds(accessTokenExpiresIn);
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

  /**
   * Returns the public profile of a user by their ID.
   * Used by the /auth/me endpoint after JWT validation.
   *
   * @throws UnauthorizedException if the user ID does not exist in the database.
   */
  async getMe(userId: string): Promise<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: boolean;
  } | null> {
    const isObjId = Types.ObjectId.isValid(userId);
    const userQuery: any = isObjId
      ? { $or: [{ _id: userId }, { _id: new Types.ObjectId(userId) }] }
      : { _id: userId };
    const user = await this.userModel.findOne(userQuery).exec();
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: toOpaqueRole(user.role),
      status: user.status,
    };
  }

  /**
   * Invalidates the current session by blacklisting both tokens and incrementing
   * the user's tokenVersion to invalidate all remaining active tokens.
   *
   * @param rawToken  - The access token from the Authorization header or cookie.
   * @param refreshToken - Optional refresh token from the cookie to also blacklist.
   */
  async logout(rawToken: string, refreshToken?: string): Promise<void> {
    let payload;
    try {
      // Verify signature to prevent IDOR via forged tokens, but ignore expiration
      // so users with expired tokens can still properly invalidate their sessions.
      payload = this.jwtService.verify<{ exp?: number; sub?: string }>(
        rawToken,
        { ignoreExpiration: true },
      );
    } catch {
      // Invalid signature: token is forged or corrupted.
      // Do not trust any data in it to prevent IDOR and blacklist pollution.
      payload = null;
    }

    // Blacklist access token
    if (payload?.exp) {
      const expiresAt = new Date(payload.exp * 1000);
      await this.tokenBlacklistService.addToBlacklist(rawToken, expiresAt);
    }

    // Increment tokenVersion in DB to invalidate all active tokens for this user
    if (payload?.sub) {
      await this.userModel
        .findByIdAndUpdate(payload.sub, { $inc: { tokenVersion: 1 } })
        .exec();
    }

    // Blacklist refresh token if provided
    if (refreshToken) {
      const refreshSecret = process.env.JWT_REFRESH_SECRET;
      if (refreshSecret) {
        try {
          const refreshPayload = this.jwtService.verify<{ exp?: number }>(
            refreshToken,
            {
              secret: refreshSecret,
            },
          );
          if (refreshPayload?.exp) {
            const expiresAt = new Date(refreshPayload.exp * 1000);
            await this.tokenBlacklistService.addToBlacklist(
              refreshToken,
              expiresAt,
            );
          }
        } catch {
          // Refresh token already invalid/expired, nothing to blacklist
        }
      }
    }

    this.logger.log("Token(s) blacklisted and session invalidated on logout");
  }

  /**
   * Initiates the password reset flow for the given email address.
   *
   * Security: Performs dummy bcrypt work when the email is not found so that
   * response timing does not reveal whether the address is registered.
   * A cryptographically random reset token is generated, hashed, and stored
   * with a configurable expiry (default 1 hour).
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userModel
      .findOne({ email: String(email).toLowerCase().trim() })
      .exec();

    if (!user) {
      // Timing equalization: perform dummy work to match the time taken when user exists
      await bcrypt.hash("dummy", 10);
      this.logger.log("Password reset requested");
      return;
    } else {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = await bcrypt.hash(resetToken, 10);

      const expiresIn = process.env.PASSWORD_RESET_EXPIRES_IN || "1h";
      const expiresMs = this.parseExpirationToMs(expiresIn);

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = new Date(Date.now() + expiresMs);
      user.audit.updatedAt = new Date();
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3003";
      const resetLink = `${frontendUrl}/reset-password#token=${resetToken}&email=${encodeURIComponent(user.email)}`;

      // Build a human-readable label that matches the configured expiry
      const expiryLabel = this.formatExpiry(expiresIn);

      await this.mailService.sendMail({
        to: user.email,
        subject: "Skywin Admin — Password Reset Request",
        html: this.buildResetEmailHtml(user.fullName, resetLink, expiryLabel),
      });

      this.logger.log("Password reset email sent");
    }
  }

  /**
   * Completes the password reset flow by verifying the one-time token and
   * setting the user's new password.
   *
   * The reset token and expiry fields are cleared on use, and the user's
   * tokenVersion is incremented to invalidate all active sessions.
   *
   * @throws BadRequestException if the token is missing, expired, or invalid.
   */
  async resetPassword(
    token: string,
    email: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel
      .findOne({ email: String(email).toLowerCase().trim() })
      .exec();

    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    if (user.passwordResetExpires.getTime() < Date.now()) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw new BadRequestException("Reset token has expired");
    }

    const isTokenValid = await bcrypt.compare(token, user.passwordResetToken);
    if (!isTokenValid) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.audit.updatedAt = new Date();
    await user.save();

    this.logger.log("Password reset successful");
  }

  /**
   * Converts a duration string (e.g. '1h', '30m', '2d', '90s') into a
   * human-readable label suitable for display in the password reset email.
   */
  private formatExpiry(expiresIn: string): string {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return '1 hour';
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const labels: Record<string, [string, string]> = {
      s: ['second', 'seconds'],
      m: ['minute', 'minutes'],
      h: ['hour', 'hours'],
      d: ['day', 'days'],
    };
    const [singular, plural] = labels[unit] || ['hour', 'hours'];
    return `${value} ${value === 1 ? singular : plural}`;
  }

  private parseExpirationToMs(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600000; // default 1 hour

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
    };

    return value * (multipliers[unit] || 3600000);
  }

  private buildResetEmailHtml(fullName: string, resetLink: string, expiryLabel: string): string {
    const escapedName = fullName
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    const escapedLink = resetLink
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;");
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0">
          <tr>
            <td align="center">
              <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
                <tr>
                  <td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:32px 40px;text-align:center">
                    <h1 style="margin:0;font-size:20px;color:#ffffff;letter-spacing:-0.5px">Skywin Aeronautics</h1>
                    <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.8)">Admin Dashboard</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 40px">
                    <h2 style="margin:0 0 8px;font-size:18px;color:#18181b">Password Reset Request</h2>
                    <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.6">Hello ${escapedName},</p>
                    <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.6">We received a request to reset your password for your Skywin Admin account. Click the button below to set a new password. This link expires in ${expiryLabel}.</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
                      <tr>
                        <td align="center">
                          <a href="${escapedLink}" style="display:inline-block;padding:12px 32px;background-color:#1e40af;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">Reset Password</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.6">Or copy this link into your browser:</p>
                    <p style="margin:0 0 16px;font-size:12px;color:#71717a;word-break:break-all;background-color:#f4f4f5;padding:12px;border-radius:6px">${escapedLink}</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#52525b;line-height:1.6">If you did not request this, please ignore this email.</p>
                    <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0">
                    <p style="margin:0;font-size:12px;color:#a1a1aa">Skywin Aeronautics Admin Dashboard</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
