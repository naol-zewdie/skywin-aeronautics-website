import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDate,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContentType } from '../schemas/post.schema';

export class CreatePostDto {
  @ApiProperty({ example: 'Breaking News: New Product Launch', description: 'Post title' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(2, { message: 'Title must be at least 2 characters' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @ApiProperty({ example: 'Full content of the post...', description: 'Post content' })
  @IsString({ message: 'Content must be a string' })
  @MinLength(10, { message: 'Content must be at least 10 characters' })
  content: string;

  @ApiProperty({ example: 'news', enum: ContentType, description: 'Type of content' })
  @IsEnum(ContentType, { message: 'Type must be one of: news, blog, event' })
  type: ContentType;

  @ApiProperty({ example: 'John Doe', description: 'Author name' })
  @IsString({ message: 'Author must be a string' })
  @MinLength(1, { message: 'Author is required' })
  author: string;

  @ApiProperty({ example: 'Short excerpt...', description: 'Short excerpt/summary', required: false })
  @IsOptional()
  @IsString({ message: 'Excerpt must be a string' })
  @MaxLength(500, { message: 'Excerpt cannot exceed 500 characters' })
  excerpt?: string;

  @ApiProperty({ example: '/uploads/image.jpg', description: 'Cover image URL or path', required: false })
  @IsOptional()
  @IsString({ message: 'Cover image must be a valid path or URL' })
  coverImage?: string;

  @ApiProperty({ example: ['tag1', 'tag2'], description: 'Tags for the post', required: false, type: [String] })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiProperty({ example: '2026-04-20T10:00:00Z', description: 'Event date (for events)', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Event date must be a valid date' })
  eventDate?: Date;

  @ApiProperty({ example: 'New York, NY', description: 'Event location (for events)', required: false })
  @IsOptional()
  @IsString({ message: 'Event location must be a string' })
  eventLocation?: string;

  @ApiProperty({ example: true, description: 'Post status', required: false })
  @IsOptional()
  @IsBoolean({ message: 'Status must be a boolean' })
  status?: boolean;
}
