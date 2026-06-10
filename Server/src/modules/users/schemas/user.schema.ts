import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Audit } from '../../../common/schemas/audit.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: true })
  status: boolean;

  @Prop({ type: Audit })
  audit: Audit;
}

export const UserSchema = SchemaFactory.createForClass(User);
