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
    });
  }

  @Get('export/csv')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Export products to CSV' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  async exportCsv(
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ): Promise<void> {
    const products = await this.productsService.findAll({ search, category });
    const csv = this.productsService.exportToCsv(products);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csv);
  }

  @Get('export/pdf')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Export products to PDF' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  async exportPdf(
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ): Promise<void> {
    const products = await this.productsService.findAll({ search, category });
    const pdfBuffer = await this.productsService.exportToPdf(products);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=products.pdf');
    res.send(pdfBuffer);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiOkResponse({ type: ProductDto })
  getProduct(@Param('id') id: string): Promise<ProductDto> {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Create product' })
  @ApiCreatedResponse({ type: ProductDto })
  createProduct(@Body() payload: CreateProductDto, @Req() req): Promise<ProductDto> {
    return this.productsService.create(payload, req.user?.role);
  }

  @Patch(':id/toggle-status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Toggle product status (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiOkResponse({ type: ProductDto })
  toggleProductStatus(@Param('id') id: string): Promise<ProductDto> {
    return this.productsService.toggleStatus(id);
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
    return this.productsService.update(id, payload, req.user?.role);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiNoContentResponse({ description: 'Product deleted' })
  removeProduct(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
