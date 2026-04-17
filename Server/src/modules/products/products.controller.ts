import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiOkResponse({ type: ProductDto, isArray: true })
  getProducts(): Promise<ProductDto[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: ProductDto })
  getProduct(@Param('id') id: string): Promise<ProductDto> {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiCreatedResponse({ type: ProductDto })
  createProduct(@Body() payload: CreateProductDto): Promise<ProductDto> {
    return this.productsService.create(payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: ProductDto })
  updateProduct(
    @Param('id') id: string,
    @Body() payload: UpdateProductDto,
  ): Promise<ProductDto> {
    return this.productsService.update(id, payload);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiNoContentResponse({ description: 'Product deleted' })
  removeProduct(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
