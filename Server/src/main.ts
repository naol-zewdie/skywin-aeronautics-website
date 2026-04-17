import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for admin dashboard
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3003',
    credentials: true,
  });

  // Enable global validation with detailed error messages
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    validationError: {
      target: false,
      value: false,
    },
  }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Skywin Backend API')
    .setDescription('API documentation for the Skywin Aeronautics backend')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, swaggerDocument);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/swagger`);
}
bootstrap();
