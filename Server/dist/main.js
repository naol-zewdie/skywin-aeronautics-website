"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "blob:"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3003';
    app.enableCors({
        origin: corsOrigin.split(',').map(o => o.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count'],
        maxAge: 86400,
    });
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter(), new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: false,
        },
        validationError: {
            target: false,
            value: false,
        },
    }));
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
        setHeaders: (res) => {
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            res.setHeader('Access-Control-Allow-Origin', '*');
        },
    });
    if (process.env.NODE_ENV !== 'production') {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('Skywin Backend API')
            .setDescription('API documentation for the Skywin Aeronautics backend')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter JWT access token',
        }, 'JWT-auth')
            .build();
        const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('swagger', app, swaggerDocument, {
            swaggerOptions: {
                persistAuthorization: true,
                docExpansion: 'none',
            },
        });
    }
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Swagger documentation: http://localhost:${port}/swagger`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map