import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
import { ContentType } from './schemas/post.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../../common/guards/roles.guard';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all posts with optional filters',
    description: 'Get all posts with filtering by type, search, author, status, and tags',
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

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get posts by content type' })
  @ApiParam({ name: 'type', enum: ContentType, description: 'Content type' })
  @ApiOkResponse({ type: PostDto, isArray: true })
  getPostsByType(@Param('type') type: ContentType): Promise<PostDto[]> {
    return this.postsService.findByType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiOkResponse({ type: PostDto })
  getPost(@Param('id') id: string): Promise<PostDto> {
    return this.postsService.findOne(id);
  }

  @Get('export/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Export posts to CSV' })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Export posts to PDF' })
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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiCreatedResponse({ type: PostDto })
  createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req: Request & { user: { role: string } },
  ): Promise<PostDto> {
    return this.postsService.create(createPostDto, req.user.role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Update a post' })
  @ApiOkResponse({ type: PostDto })
  updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: Request & { user: { role: string } },
  ): Promise<PostDto> {
    return this.postsService.update(id, updatePostDto, req.user.role);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Toggle post status' })
  @ApiOkResponse({ type: PostDto })
  togglePostStatus(@Param('id') id: string): Promise<PostDto> {
    return this.postsService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiNoContentResponse()
  @HttpCode(204)
  deletePost(@Param('id') id: string): Promise<void> {
    return this.postsService.remove(id);
  }

  }
