import { Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';
import { AdminPostsController } from './admin-posts.controller';

@Module({
  imports: [PostsModule],
  controllers: [AdminPostsController],
})
export class AdminPostsModule {}
