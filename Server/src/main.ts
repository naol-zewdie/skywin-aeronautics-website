import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { Request, Response, NextFunction } from "express";
import { AppModule } from "./app.module";
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
} from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { join } from "path";

async function bootstrap() {
  // Security: Refuse to start with placeholder or weak JWT secrets
  const placeholderSecrets = [
    "your-super-secret-jwt-key-change-this-in-production",
    "your-different-refresh-secret-change-this-in-production",
    "REPLACE_WITH_RANDOM_128_CHAR_HEX_STRING",
    "replace_with_your_random_64_byte_hex_secret",
  ];
  const jwtSecret = process.env.JWT_SECRET || "";
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || "";
  if (
    placeholderSecrets.includes(jwtSecret) ||
    placeholderSecrets.includes(jwtRefreshSecret) ||
    jwtSecret.length < 32 ||
    jwtRefreshSecret.length < 32
  ) {
    console.error(
      "FATAL: JWT secrets must be at least 32 characters (128 bits) and not placeholders. Generate real secrets:",
    );
    console.error("  npx -y @skywin/generate-secrets");
    console.error(
      "  node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"",
    );
    process.exit(1);
  }

  // Security: Validate NODE_ENV is a recognized value
  const validNodeEnvs = ["development", "production", "test"];
  if (!validNodeEnvs.includes(process.env.NODE_ENV || "")) {
    console.error(
      `FATAL: NODE_ENV must be one of: ${validNodeEnvs.join(", ")}. Got: "${process.env.NODE_ENV}"`,
    );
    process.exit(1);
  }

  // Security: Refuse to start in production without CORS_ORIGIN
  if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
    console.error("FATAL: CORS_ORIGIN must be set in production");
    process.exit(1);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security: Parse cookies for token extraction
  app.use(cookieParser());

  // Security: Prevent caching of sensitive API responses
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private",
    );
    res.setHeader("Pragma", "no-cache");
    next();
  });

  // Security: Trust first proxy when behind reverse proxy (enables correct client IP)
  if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
  }

  // Security: Global rate limiting to prevent brute-force and DoS
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 100 : 1000, // Higher limit in development
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: "Too many requests, please try again later",
    },
  });
  app.use(limiter);

  // Stricter rate limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // 20 login attempts per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: "Too many login attempts, please try again later",
    },
    skipSuccessfulRequests: true,
  });
  app.use("/v1/auth/login", authLimiter);

  // Stricter rate limit for refresh token endpoint
  const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: "Too many token refresh attempts, please try again later",
    },
  });
  app.use("/v1/auth/refresh", refreshLimiter);

  // Stricter rate limit for forgot-password (prevents email enumeration / mail bombing)
  const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: "Too many password reset requests, please try again later",
    },
  });
  app.use("/v1/auth/forgot-password", forgotPasswordLimiter);

  // Stricter rate limit for reset-password (prevents token brute-force)
  const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: "Too many password reset attempts, please try again later",
    },
  });
  app.use("/v1/auth/reset-password", resetPasswordLimiter);

  // Stricter rate limit for file uploads (prevent disk/memory exhaustion)
  const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // 20 uploads per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: "Too many upload attempts, please try again later",
    },
  });
  app.use("/v1/upload", uploadLimiter);

  // Security: Enable Helmet for security headers
  const isProduction = process.env.NODE_ENV === "production";
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: isProduction ? ["'self'"] : ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          formAction: ["'self'"],
          baseUri: ["'self'"],
          ...(isProduction ? { upgradeInsecureRequests: [] as string[] } : {}),
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Enable CORS for admin dashboard with secure defaults
  const corsOrigin =
    process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:3003";
  app.enableCors({
    origin: corsOrigin.split(",").map((o) => o.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-CSRF-Token",
    ],
    exposedHeaders: ["X-Total-Count"],
    maxAge: 86400, // 24 hours
  });

  // Security: Global exception filters
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Security: Limit request body size (10MB max)
  app.useBodyParser("json", { limit: "10mb" });
  app.useBodyParser("urlencoded", { limit: "10mb", extended: true });

  // Security: Global validation with strict settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-defined properties
      forbidNonWhitelisted: true, // Throw error on non-defined properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: false,
      },
      validationError: {
        target: false, // Don't expose target in error
        value: false, // Don't expose value in error
      },
    }),
  );

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  });

  // Swagger Documentation (only in development)
  if (process.env.NODE_ENV !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Skywin Backend API")
      .setDescription("API documentation for the Skywin Aeronautics backend")
      .setVersion("1.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT access token",
        },
        "JWT-auth",
      )
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("swagger", app, swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "none",
      },
    });
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  if (process.env.NODE_ENV !== "production") {
    console.log(`Application is running on: http://localhost:${port}`);
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`Swagger documentation: http://localhost:${port}/swagger`);
  }
}

bootstrap();
