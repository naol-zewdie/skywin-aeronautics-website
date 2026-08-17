import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Audit } from "../../../common/schemas/audit.schema";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ type: MongooseSchema.Types.Mixed, default: uuidv4 })
  _id: string | MongooseSchema.Types.ObjectId;

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

  @Prop({ type: String, required: false })
  passwordResetToken?: string;

  @Prop({ type: Date, required: false })
  passwordResetExpires?: Date;

  @Prop({ type: Number, required: true, default: 0 })
  tokenVersion: number;

  @Prop({ type: Audit })
  audit: Audit;
}

export const UserSchema = SchemaFactory.createForClass(User);
