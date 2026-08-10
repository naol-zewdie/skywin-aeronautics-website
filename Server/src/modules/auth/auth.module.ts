import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { MailModule } from "../../common/mail/mail.module";
import { User, UserSchema } from "../users/schemas/user.schema";
import { TokenBlacklistModule } from "./token-blacklist.module";
import { RateLimitModule } from "../../common/rate-limit.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>("JWT_EXPIRES_IN", "15m");
        return {
          secret: configService.get<string>("JWT_SECRET"),
          signOptions: {
            expiresIn: expiresIn as `${number}${"s" | "m" | "h" | "d"}`,
            algorithm: "HS256",
          },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MailModule,
    TokenBlacklistModule,
    RateLimitModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
