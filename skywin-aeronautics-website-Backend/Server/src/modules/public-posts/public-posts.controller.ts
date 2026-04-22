import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { PostsService } from '../posts/posts.service';
import { ContentType } from '../posts/schemas/post.schema';
import { PostDto } from '../posts/dto/post.dto';

@ApiTags('Public Posts')
@Controller('public/posts')
export class PublicPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all published posts with optional filters',
    description: 'Get all published posts with filtering by type, search, author, and tags',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ContentType,
    description: 'Filter by content type (news, blog, event)',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title, content, and excerpt' })
  @ApiQuery({ name: 'author', required: false, description: 'Filter by author' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiOkResponse({ type: PostDto, isArray: true })
  getPosts(
    @Query('type') type?: ContentType,
    @Query('search') search?: string,
    @Query('author') author?: string,
    @Query('tags') tags?: string,
  ): Promise<PostDto[]> {
    const tagArray = tags ? tags.split(',').map(t => t.trim()) : undefined;
    return this.postsService.findAll({
      type,
      search,
      author,
      status: true, // Only return published posts
      tags: tagArray,
    });
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get published posts by content type' })
  @ApiParam({ name: 'type', enum: ContentType, description: 'Content type' })
  @ApiOkResponse({ type: PostDto, isArray: true })
  getPostsByType(@Param('type') type: ContentType): Promise<PostDto[]> {
    return this.postsService.findAll({ type, status: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get published post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiOkResponse({ type: PostDto })
  getPost(@Param('id') id: string): Promise<PostDto> {
    return this.postsService.findOne(id);
  }
}
