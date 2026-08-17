import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type TokenBlacklistDocument = HydratedDocument<TokenBlacklist>;

@Schema({ timestamps: false })
export class TokenBlacklist {
  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const TokenBlacklistSchema =
  SchemaFactory.createForClass(TokenBlacklist);

TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
