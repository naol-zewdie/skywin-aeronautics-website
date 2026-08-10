import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  TokenBlacklist,
  TokenBlacklistSchema,
} from "../../common/schemas/token-blacklist.schema";
import { TokenBlacklistService } from "./token-blacklist.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TokenBlacklist.name, schema: TokenBlacklistSchema },
    ]),
  ],
  providers: [TokenBlacklistService],
  exports: [TokenBlacklistService],
})
export class TokenBlacklistModule {}
