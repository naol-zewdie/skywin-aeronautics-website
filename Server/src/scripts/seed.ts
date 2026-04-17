// Seed script for initializing the database with default data.

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Add seed logic here

  await app.close();
}

bootstrap();