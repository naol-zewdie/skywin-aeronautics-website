import { Module } from '@nestjs/common';
import { CareersModule } from '../careers/careers.module';
import { PublicCareersController } from './public-careers.controller';

@Module({
  imports: [CareersModule],
  controllers: [PublicCareersController],
})
export class PublicCareersModule {}

