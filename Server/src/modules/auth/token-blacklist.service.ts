import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TokenBlacklist } from "../../common/schemas/token-blacklist.schema";

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);

  constructor(
    @InjectModel(TokenBlacklist.name)
    private blacklistModel: Model<TokenBlacklist>,
  ) {}

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
