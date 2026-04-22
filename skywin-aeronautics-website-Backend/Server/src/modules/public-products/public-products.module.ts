import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { PublicProductsController } from './public-products.controller';

@Module({
  imports: [ProductsModule],
  controllers: [PublicProductsController],
})
export class PublicProductsModule {}

