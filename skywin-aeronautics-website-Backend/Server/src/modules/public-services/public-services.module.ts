import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { PublicServicesController } from './public-services.controller';

@Module({
  imports: [ServicesModule],
  controllers: [PublicServicesController],
})
export class PublicServicesModule {}

