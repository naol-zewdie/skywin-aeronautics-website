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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.DATABASE_URL || 'mongodb://localhost:27017/skywin',
    ),
    AuthModule,
    UsersModule,
    ServicesModule,
    ProductsModule,
    CareersModule,
    NotificationsModule,
    UploadModule,
    ActivityModule,
    PostsModule,
  ],
})
export class AppModule {}