import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuditDocument = HydratedDocument<Audit>;

@Schema({ _id: false })
export class Audit {
  @Prop({ type: String, ref: 'User' })
  createdBy: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: String, ref: 'User' })
  updatedBy: string;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);
