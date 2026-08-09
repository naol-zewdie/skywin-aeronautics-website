import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/guards/public.decorator';
import { ServicesService } from '../services/services.service';
import { ProductsService } from '../products/products.service';
import { CareersService } from '../careers/careers.service';
import { PostsService } from '../posts/posts.service';
import { ContentType } from '../posts/schemas/post.schema';

function sanitizePublic(record: any) {
  if (!record) return record;
  const copy = { ...record };
  delete copy.audit;
  delete copy.tokenVersion;
  return copy;
}

@ApiTags('Public')
@Public()
@Controller('public')
export class PublicController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly productsService: ProductsService,
    private readonly careersService: CareersService,
    private readonly postsService: PostsService,
  ) {}

  @Get('services')
  @ApiOperation({ summary: 'List active services (public)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiOkResponse({ description: 'Active services' })
  async getActiveServices(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const services = await this.servicesService.findAll({
      status: true,
      limit: limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 20,
      offset: offset ? Math.max(parseInt(offset, 10), 0) : 0,
    });
    return services.map(sanitizePublic);
  }

  @Get('products')
  @ApiOperation({ summary: 'List active products (public)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiOkResponse({ description: 'Active products' })
  async getActiveProducts(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const products = await this.productsService.findAll({
      status: true,
      limit: limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 20,
      offset: offset ? Math.max(parseInt(offset, 10), 0) : 0,
    });
    return products.map(sanitizePublic);
  }

  @Get('careers')
  @ApiOperation({ summary: 'List active careers (public)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiOkResponse({ description: 'Active careers' })
  async getActiveCareers(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const careers = await this.careersService.findAll({
      status: true,
      limit: limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 20,
      offset: offset ? Math.max(parseInt(offset, 10), 0) : 0,
    });
    return careers.map(sanitizePublic);
  }

  @Get('posts')
  @ApiOperation({ summary: 'List active posts (public)' })
  @ApiQuery({ name: 'type', required: false, enum: ContentType })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'author', required: false })
  @ApiQuery({ name: 'tags', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiOkResponse({ description: 'Active posts' })
  async getActivePosts(
    @Query('type') type?: ContentType,
    @Query('search') search?: string,
    @Query('author') author?: string,
    @Query('tags') tags?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const tagArray = tags ? tags.split(',').map(t => t.trim()) : undefined;
    const posts = await this.postsService.findAll({
      type,
      search,
      author,
      tags: tagArray,
      status: true,
      limit: limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 20,
      offset: offset ? Math.max(parseInt(offset, 10), 0) : 0,
    });
    return posts.map(sanitizePublic);
  }

  @Get('posts/by-type/:type')
  @ApiOperation({ summary: 'List active posts by type (public)' })
  @ApiParam({ name: 'type', enum: ContentType })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiOkResponse({ description: 'Active posts filtered by type' })
  async getActivePostsByType(
    @Param('type') type: ContentType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const posts = await this.postsService.findAll({
      type,
      status: true,
      limit: limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 20,
      offset: offset ? Math.max(parseInt(offset, 10), 0) : 0,
    });
    return posts.map(sanitizePublic);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get active post by id (public)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ description: 'Active post details' })
  async getActivePost(@Param('id') id: string) {
    const post = await this.postsService.findOne(id);
    if (!post.status) {
      throw new NotFoundException('Post not found');
    }
    return sanitizePublic(post);
  }
}
