import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ collection: 'notifications', timestamps: true })
export class Notification {
  @Prop({ required: true, enum: ['info', 'success', 'warning', 'error'] })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: false })
  read: boolean;

  @Prop()
  userId?: string;

  @Prop({ type: [String], default: [] })
  readBy?: string[];
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
