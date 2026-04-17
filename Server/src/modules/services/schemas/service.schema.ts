import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Audit } from '../../../common/schemas/audit.schema';

export type ServiceDocument = HydratedDocument<Service>;

@Schema()
export class Service {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: true })
  status: boolean;

  @Prop({ type: Audit })
  audit: Audit;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
