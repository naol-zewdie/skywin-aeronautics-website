import { Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';
import { PublicPostsController } from './public-posts.controller';

@Module({
  imports: [PostsModule],
  controllers: [PublicPostsController],
})
export class PublicPostsModule {}
