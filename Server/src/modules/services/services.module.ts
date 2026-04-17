import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServiceEntity } from './entities/service.entity';
import { ServicesService } from './services.service';

@Module({
  imports:
    process.env.ENABLE_DB === 'true'
      ? [TypeOrmModule.forFeature([ServiceEntity])]
      : [],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
