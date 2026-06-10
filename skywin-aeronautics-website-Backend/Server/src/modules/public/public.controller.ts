import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from '../services/services.service';
import { ProductsService } from '../products/products.service';
import { CareersService } from '../careers/careers.service';
import { PostsService } from '../posts/posts.service';
import { ContentType } from '../posts/schemas/post.schema';

@ApiTags('Public')
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
  @ApiOkResponse({ description: 'Active services' })
  async getActiveServices() {
    const services = await this.servicesService.findAll({ status: true });
    return services;
  }

  @Get('products')
  @ApiOperation({ summary: 'List active products (public)' })
  @ApiOkResponse({ description: 'Active products' })
  async getActiveProducts() {
    const products = await this.productsService.findAll({ status: true });
    return products;
  }

  @Get('careers')
  @ApiOperation({ summary: 'List active careers (public)' })
  @ApiOkResponse({ description: 'Active careers' })
  async getActiveCareers() {
    const careers = await this.careersService.findAll({ status: true });
    return careers;
  }

  @Get('posts')
  @ApiOperation({ summary: 'List active posts (public)' })
  @ApiQuery({ name: 'type', required: false, enum: ContentType })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'author', required: false })
  @ApiQuery({ name: 'tags', required: false })
  @ApiOkResponse({ description: 'Active posts' })
  async getActivePosts(
    @Query('type') type?: ContentType,
    @Query('search') search?: string,
    @Query('author') author?: string,
    @Query('tags') tags?: string,
  ) {
    const tagArray = tags ? tags.split(',').map(t => t.trim()) : undefined;
    return this.postsService.findAll({
      type,
      search,
      author,
      tags: tagArray,
      status: true,
    });
  }

  @Get('posts/by-type/:type')
  @ApiOperation({ summary: 'List active posts by type (public)' })
  @ApiParam({ name: 'type', enum: ContentType })
  @ApiOkResponse({ description: 'Active posts filtered by type' })
  async getActivePostsByType(@Param('type') type: ContentType) {
    const posts = await this.postsService.findAll({ type, status: true });
    return posts;
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get active post by id (public)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ description: 'Active post details' })
  async getActivePost(@Param('id') id: string) {
    const post = await this.postsService.findOne(id);
    if (!post.status) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }
}
