import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

const shouldEnableDatabase = process.env.ENABLE_DB === 'true';

@Module({
  imports: shouldEnableDatabase
    ? [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_NAME || 'skywin',
          autoLoadEntities: true,
          synchronize: true, // Disable in production
        }),
      ]
    : [],
})
export class DatabaseModule {}
