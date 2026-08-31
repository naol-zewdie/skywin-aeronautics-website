import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TokenBlacklist } from "../../common/schemas/token-blacklist.schema";

@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  private readonly logger = new Logger(TokenBlacklistService.name);

  constructor(
    @InjectModel(TokenBlacklist.name)
    private blacklistModel: Model<TokenBlacklist>,
  ) {}

  /**
   * Guarantees that MongoDB indexes (including the TTL expireAfterSeconds index)
   * are synchronized and active upon application startup, preventing unbounded
   * collection growth even when Mongoose autoIndex is disabled in production.
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.blacklistModel.syncIndexes();
      this.logger.log("TokenBlacklist indexes verified and synchronized");
    } catch (err: any) {
      this.logger.warn(
        `Failed to synchronize TokenBlacklist indexes on startup: ${err?.message}`,
      );
    }
  }

  async addToBlacklist(token: string, expiresAt: Date): Promise<void> {
    try {
      await this.blacklistModel.create({ token, expiresAt });
      this.logger.log("Token added to blacklist");
    } catch (err: any) {
      // Ignore duplicate key errors (token already blacklisted)
      if (err?.code === 11000) return;
      throw err;
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const exists = await this.blacklistModel.findOne({ token }).lean().exec();
    return !!exists;
  }
}

