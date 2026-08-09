import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RateLimitDocument = RateLimit & Document;

@Schema({ collection: 'ratelimits', timestamps: false })
export class RateLimit {
  @Prop({ required: true, index: true })
  key: string;

  @Prop({ required: true, default: 0 })
  attempts: number;

  @Prop({ required: true })
  firstAttempt: Date;

  @Prop()
  lockedUntil?: Date;

  @Prop({ required: true, index: true, expires: 0 })
  expiresAt: Date;
}

export const RateLimitSchema = SchemaFactory.createForClass(RateLimit);
