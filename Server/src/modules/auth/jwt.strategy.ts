import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TokenBlacklistService } from "./token-blacklist.service";
import { User } from "../users/schemas/user.schema";
import type { Request } from "express";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: "access" | "refresh";
  tokenVersion?: number;
  iat: number;
  exp: number;
}

const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["accessToken"];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private tokenBlacklistService: TokenBlacklistService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET environment variable is required. Set it before starting the server.",
      );
    }

    super({
      jwtFromRequest: (req: Request) => {
        const headerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        const cookieToken = cookieExtractor(req);
        return headerToken || cookieToken;
      },
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      algorithms: ["HS256"],
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload) {
    if (payload.type !== "access") {
      throw new UnauthorizedException("Invalid token type");
    }

    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException("Invalid token payload");
    }

    const authHeader = request.headers.authorization;
    const rawToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const cookieToken = cookieExtractor(request);
    const token = rawToken || cookieToken;

    if (token && (await this.tokenBlacklistService.isBlacklisted(token))) {
      throw new UnauthorizedException("Token has been revoked");
    }

    // Validate user status, tokenVersion, AND role from DB — never trust role from JWT alone.
    // This prevents privilege escalation when an admin changes a user's role while their JWT is still valid.
    const user = await this.userModel
      .findById(payload.sub)
      .select("tokenVersion status role")
      .exec();
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

    return {
      userId: payload.sub,
      email: payload.email,
      role: user.role,
    };
  }
}
