import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../schemas/post.schema';

export class PostDto {
  @ApiProperty({ example: 'post_001' })
  id: string;

  @ApiProperty({ example: 'Breaking News: New Product Launch' })
  title: string;

  @ApiProperty({ example: 'Full content of the post...' })
  content: string;

  @ApiProperty({ example: 'news', enum: ['news', 'blog', 'event'] })
  type: ContentType;

  @ApiProperty({ example: 'John Doe' })
  author: string;

  @ApiProperty({ example: 'Short excerpt...', required: false })
  excerpt?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  coverImage?: string;

  @ApiProperty({ example: ['tag1', 'tag2'], required: false, type: [String] })
  tags?: string[];

  @ApiProperty({ example: '2026-04-20T10:00:00Z', required: false })
  eventDate?: Date;

  @ApiProperty({ example: 'New York, NY', required: false })
  eventLocation?: string;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: 0, required: false })
  views?: number;
}
