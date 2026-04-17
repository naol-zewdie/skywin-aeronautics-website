import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Audit } from '../../../common/schemas/audit.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;
  
  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  stock: number;

  @Prop({ required: true, default: true })
  status: boolean;

  @Prop({ type: Audit })
  audit: Audit;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
