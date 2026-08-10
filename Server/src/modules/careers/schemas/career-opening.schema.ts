import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Audit } from "../../../common/schemas/audit.schema";

export type CareerOpeningDocument = HydratedDocument<CareerOpening>;

@Schema()
export class CareerOpening {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  employmentType: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: false })
  status: boolean;

  @Prop({ type: Audit })
  audit: Audit;
}

export const CareerOpeningSchema = SchemaFactory.createForClass(CareerOpening);
