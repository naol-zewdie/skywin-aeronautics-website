import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ServicesModule } from './modules/services/services.module';
import { ProductsModule } from './modules/products/products.module';
import { CareersModule } from './modules/careers/careers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadModule } from './modules/upload/upload.module';
import { ActivityModule } from './modules/activity/activity.module';
import { PostsModule } from './modules/posts/posts.module';
import { PublicPostsModule } from './modules/public-posts/public-posts.module';
import { PublicServicesModule } from './modules/public-services/public-services.module';
import { PublicProductsModule } from './modules/public-products/public-products.module';
import { PublicCareersModule } from './modules/public-careers/public-careers.module';
import { AdminPostsModule } from './modules/admin-posts/admin-posts.module';

const imports: any[] = [
  ConfigModule.forRoot({ isGlobal: true }),
  AuthModule,
  UsersModule,
  ServicesModule,
  ProductsModule,
  CareersModule,
  NotificationsModule,
  UploadModule,
  ActivityModule,
  PostsModule,
  PublicPostsModule,
  PublicServicesModule,
  PublicProductsModule,
  PublicCareersModule,
  AdminPostsModule,
];

// Only add MongooseModule if database is enabled
if (process.env.ENABLE_DB !== 'false') {
  imports.unshift(
    MongooseModule.forRoot(
      process.env.DATABASE_URL || 'mongodb://localhost:27017/skywin',
    )
  );
}

@Module({
  imports,
})
export class AppModule {}