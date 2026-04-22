import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  Query,
  Res,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { PostsService } from '../posts/posts.service';
import { CreatePostDto } from '../posts/dto/create-post.dto';
import { PostDto } from '../posts/dto/post.dto';
import { UpdatePostDto } from '../posts/dto/update-post.dto';
import { ContentType } from '../posts/schemas/post.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../../common/guards/roles.guard';

@ApiTags('Admin Posts')
@Controller('admin/posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AdminPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({
    summary: 'List all posts with optional filters (Admin only)',
    description: 'Get all posts (including unpublished) with filtering by type, search, author, status, and tags',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ContentType,
    description: 'Filter by content type (news, blog, event)',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title, content, and excerpt' })
  @ApiQuery({ name: 'author', required: false, description: 'Filter by author' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (true/false)' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiOkResponse({ type: PostDto, isArray: true })
  getPosts(
    @Query('type') type?: ContentType,
    @Query('search') search?: string,
    @Query('author') author?: string,
    @Query('status') status?: string,
    @Query('tags') tags?: string,
  ): Promise<PostDto[]> {
    const tagArray = tags ? tags.split(',').map(t => t.trim()) : undefined;
    return this.postsService.findAll({
      type,
      search,
      author,
      status: status !== undefined ? status === 'true' : undefined,
      tags: tagArray,
    });
  }

  @Get('export/csv')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Export posts to CSV (Admin only)' })
  @ApiOkResponse({ description: 'CSV file' })
  async exportPostsToCsv(
    @Res() res: Response,
    @Query('type') type?: ContentType,
    @Query('search') search?: string,
    @Query('author') author?: string,
    @Query('status') status?: string,
    @Query('tags') tags?: string,
  ): Promise<void> {
    const tagArray = tags ? tags.split(',').map(t => t.trim()) : undefined;
    const posts = await this.postsService.findAll({
      type,
      search,
      author,
      status: status !== undefined ? status === 'true' : undefined,
      tags: tagArray,
    });
    
    const csv = this.postsService.exportToCsv(posts);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=posts.csv');
    res.send(csv);
  }

  @Get('export/pdf')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Export posts to PDF (Admin only)' })
  @ApiOkResponse({ description: 'PDF file' })
  async exportPostsToPdf(
    @Res() res: Response,
    @Query('type') type?: ContentType,
    @Query('search') search?: string,
    @Query('author') author?: string,
    @Query('status') status?: string,
    @Query('tags') tags?: string,
  ): Promise<void> {
    const tagArray = tags ? tags.split(',').map(t => t.trim()) : undefined;
    const posts = await this.postsService.findAll({
      type,
      search,
      author,
      status: status !== undefined ? status === 'true' : undefined,
      tags: tagArray,
    });
    
    const pdfBuffer = await this.postsService.exportToPdf(posts);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=posts.pdf');
    res.send(pdfBuffer);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get post by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiOkResponse({ type: PostDto })
  getPost(@Param('id') id: string): Promise<PostDto> {
    return this.postsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Create a new post (Admin only)' })
  @ApiCreatedResponse({ type: PostDto })
  createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req: Request & { user: { role: string } },
  ): Promise<PostDto> {
    return this.postsService.create(createPostDto, req.user.role);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Update a post (Admin only)' })
  @ApiOkResponse({ type: PostDto })
  updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: Request & { user: { role: string } },
  ): Promise<PostDto> {
    return this.postsService.update(id, updatePostDto, req.user.role);
  }

  @Patch(':id/toggle-status')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Toggle post status (Admin only)' })
  @ApiOkResponse({ type: PostDto })
  togglePostStatus(@Param('id') id: string): Promise<PostDto> {
    return this.postsService.toggleStatus(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a post (Admin only)' })
  @ApiNoContentResponse()
  @HttpCode(204)
  deletePost(@Param('id') id: string): Promise<void> {
    return this.postsService.remove(id);
  }
}
