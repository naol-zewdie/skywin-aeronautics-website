import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Audit } from '../../../common/schemas/audit.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;
  
  @Prop({ required: false })
  image?: string;

  @Prop({ required: true })
  stock: number;

  @Prop({ required: true, default: false })
  status: boolean;

  @Prop({ type: Audit })
  audit: Audit;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
