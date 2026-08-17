import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Audit } from "../../../common/schemas/audit.schema";

export type ServiceDocument = HydratedDocument<Service>;

@Schema()
export class Service {
  @Prop({ type: MongooseSchema.Types.Mixed, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false })
  image?: string;

  @Prop({ required: true, default: false })
  status: boolean;

  @Prop({ type: Audit })
  audit: Audit;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
