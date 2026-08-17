import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Request } from "express";
import { RateLimit, RateLimitDocument } from "../schemas/rate-limit.schema";

@Injectable()
export class RateLimitGuard implements CanActivate {
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000;
  private static readonly LOCKOUT_MS = 30 * 60 * 1000;

  constructor(
    @InjectModel(RateLimit.name)
    private rateLimitModel: Model<RateLimitDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.NODE_ENV !== "production") {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const ip = RateLimitGuard.getClientIp(request);
    const key = `login:${ip}`;

    const entry = await this.rateLimitModel.findOne({ key }).exec();

    if (entry?.lockedUntil && new Date() < entry.lockedUntil) {
      const minutesRemaining = Math.ceil(
        (entry.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new HttpException(
        `Too many login attempts. Please try again in ${minutesRemaining} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  async recordFailedAttempt(request: Request): Promise<void> {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const ip = RateLimitGuard.getClientIp(request);
    const key = `login:${ip}`;
    const now = new Date();

    const entry = await this.rateLimitModel
      .findOneAndUpdate(
        { key },
        {
          $inc: { attempts: 1 },
          $setOnInsert: {
            key,
            firstAttempt: now,
            expiresAt: new Date(
              now.getTime() +
                RateLimitGuard.WINDOW_MS +
                RateLimitGuard.LOCKOUT_MS,
            ),
          },
        },
        { upsert: true, returnDocument: "after" },
      )
      .exec();

    if (entry.attempts >= RateLimitGuard.MAX_ATTEMPTS) {
      await this.rateLimitModel
        .updateOne(
          { key },
          {
            $set: {
              lockedUntil: new Date(now.getTime() + RateLimitGuard.LOCKOUT_MS),
            },
          },
        )
        .exec();
    }
  }

  async resetAttempts(request: Request): Promise<void> {
    const ip = RateLimitGuard.getClientIp(request);
    const key = `login:${ip}`;
    await this.rateLimitModel.deleteOne({ key }).exec();
  }

  private static getClientIp(request: Request): string {
    if (process.env.TRUST_PROXY === "true") {
      return request.ip || request.socket?.remoteAddress || "unknown";
    }
    return request.socket?.remoteAddress || request.ip || "unknown";
  }
}
