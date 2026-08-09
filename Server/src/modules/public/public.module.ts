import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { ProductsModule } from '../products/products.module';
import { CareersModule } from '../careers/careers.module';
import { PostsModule } from '../posts/posts.module';
import { PublicController } from './public.controller';

@Module({
  imports: [ServicesModule, ProductsModule, CareersModule, PostsModule],
  controllers: [PublicController],
})
export class PublicModule {}
