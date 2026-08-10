import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RateLimit, RateLimitSchema } from "./schemas/rate-limit.schema";
import { RateLimitGuard } from "./guards/rate-limit.guard";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RateLimit.name, schema: RateLimitSchema },
    ]),
  ],
  providers: [RateLimitGuard],
  exports: [RateLimitGuard, MongooseModule],
})
export class RateLimitModule {}
