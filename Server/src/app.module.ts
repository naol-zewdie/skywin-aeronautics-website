import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { CsrfGuard } from "./common/guards/csrf.guard";
import { JwtAuthGuard } from "./modules/auth/jwt-auth.guard";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ServicesModule } from "./modules/services/services.module";
import { ProductsModule } from "./modules/products/products.module";
import { CareersModule } from "./modules/careers/careers.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { UploadModule } from "./modules/upload/upload.module";
import { ActivityModule } from "./modules/activity/activity.module";
import { PostsModule } from "./modules/posts/posts.module";
import { PublicModule } from "./modules/public/public.module";
import { RateLimitModule } from "./common/rate-limit.module";

/**
 * Returns the MongoDB connection URL from environment variables.
 * Throws a descriptive error at startup if DATABASE_URL is not set,
 * rather than failing silently at connection time.
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is required. Set it before starting the server.",
    );
  }
  return url;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(getDatabaseUrl()),
    AuthModule,
    UsersModule,
    ServicesModule,
    ProductsModule,
    CareersModule,
    NotificationsModule,
    UploadModule,
    ActivityModule,
    PostsModule,
    PublicModule,
    RateLimitModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
