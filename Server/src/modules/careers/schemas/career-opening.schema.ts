import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Audit } from '../../../common/schemas/audit.schema';

export type CareerOpeningDocument = HydratedDocument<CareerOpening>;

@Schema()
export class CareerOpening {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  employmentType: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: true })
  status: boolean;

  @Prop({ type: Audit })
  audit: Audit;
}

export const CareerOpeningSchema = SchemaFactory.createForClass(CareerOpening);
