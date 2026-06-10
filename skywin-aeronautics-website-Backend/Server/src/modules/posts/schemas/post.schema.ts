import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Audit } from '../../../common/schemas/audit.schema';

export enum ContentType {
  NEWS = 'news',
  BLOG = 'blog',
  EVENT = 'event',
}

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: ContentType })
  type: ContentType;

  @Prop({ required: true })
  author: string;

  @Prop({ required: false })
  excerpt?: string;

  @Prop({ required: false })
  coverImage?: string;

  @Prop({ required: false })
  tags?: string[];

  @Prop({ required: false })
  eventDate?: Date;

  @Prop({ required: false })
  eventLocation?: string;

  @Prop({ required: true, default: false })
  status: boolean;

  @Prop({ required: false, default: 0 })
  views?: number;

  @Prop({ type: Audit })
  audit: Audit;
}

export const PostSchema = SchemaFactory.createForClass(Post);
