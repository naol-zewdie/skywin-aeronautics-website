import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesController } from './services.controller';
import { Service, ServiceSchema } from './schemas/service.schema';
import { ServicesService } from './services.service';

@Module({
  imports:
    process.env.ENABLE_DB === 'true'
      ? [MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }])]
      : [],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
