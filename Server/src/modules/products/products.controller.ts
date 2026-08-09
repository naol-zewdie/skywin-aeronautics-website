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
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../../common/guards/roles.guard';

const MAX_EXPORT_RECORDS = 10000;

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: 'List all products with optional search and filter' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or description' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price filter' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum price filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (true/false)' })
  @ApiOkResponse({ type: ProductDto, isArray: true })
  getProducts(
    @Req() req,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('status') status?: string,
  ): Promise<ProductDto[]> {
    return this.productsService.findAll({
      search,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      status: status !== undefined ? status === 'true' : undefined,
    }, req.user?.role, req.user?.userId);
  }

  @Get('export/csv')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Export products to CSV' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  async exportCsv(
    @Res({ passthrough: true }) res: Response,
    @Req() req,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ): Promise<string> {
    const products = await this.productsService.findAll({ search, category, limit: MAX_EXPORT_RECORDS });
    const filtered = req.user?.role !== 'admin'
      ? products.filter(p => p.audit?.createdBy === req.user?.userId)
      : products;
    const csv = this.productsService.exportToCsv(filtered);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    return csv;
  }

  @Get('export/pdf')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Export products to PDF' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  async exportPdf(
    @Res({ passthrough: true }) res: Response,
    @Req() req,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ): Promise<Buffer> {
    const products = await this.productsService.findAll({ search, category, limit: MAX_EXPORT_RECORDS });
    const filtered = req.user?.role !== 'admin'
      ? products.filter(p => p.audit?.createdBy === req.user?.userId)
      : products;
    const pdfBuffer = await this.productsService.exportToPdf(filtered);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=products.pdf');
    return pdfBuffer;
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiOkResponse({ type: ProductDto })
  getProduct(@Param('id') id: string, @Req() req): Promise<ProductDto> {
    return this.productsService.findOne(id, req.user?.role, req.user?.userId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Create product' })
  @ApiCreatedResponse({ type: ProductDto })
  createProduct(@Body() payload: CreateProductDto, @Req() req): Promise<ProductDto> {
    return this.productsService.create(payload, req.user?.role, req.user?.userId);
  }

  @Patch(':id/toggle-status')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Toggle product status' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiOkResponse({ type: ProductDto })
  toggleProductStatus(@Param('id') id: string, @Req() req): Promise<ProductDto> {
    return this.productsService.toggleStatus(id, req.user?.role, req.user?.userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiOkResponse({ type: ProductDto })
  updateProduct(
    @Param('id') id: string,
    @Body() payload: UpdateProductDto,
    @Req() req,
  ): Promise<ProductDto> {
    return this.productsService.update(id, payload, req.user?.role, req.user?.userId);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiNoContentResponse({ description: 'Product deleted' })
  removeProduct(@Param('id') id: string, @Req() req): Promise<void> {
    return this.productsService.remove(id, req.user?.role, req.user?.userId);
  }
}
