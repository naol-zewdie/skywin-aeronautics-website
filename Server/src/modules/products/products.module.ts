import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductEntity } from './entities/product.entity';
import { ProductsService } from './products.service';

@Module({
  imports:
    process.env.ENABLE_DB === 'true'
      ? [TypeOrmModule.forFeature([ProductEntity])]
      : [],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
