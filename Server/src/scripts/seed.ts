import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // TODO: Add seed logic here for TypeORM/PostgreSQL
  console.log('Seed script placeholder - implement based on your entities');

  await app.close();
}

bootstrap();