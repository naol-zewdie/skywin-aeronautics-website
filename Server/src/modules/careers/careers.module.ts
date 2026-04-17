import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CareersController } from './careers.controller';
import { CareerOpening, CareerOpeningSchema } from './schemas/career-opening.schema';
import { CareersService } from './careers.service';

@Module({
  imports:
    process.env.ENABLE_DB === 'true'
      ? [MongooseModule.forFeature([{ name: CareerOpening.name, schema: CareerOpeningSchema }])]
      : [],
  controllers: [CareersController],
  providers: [CareersService],
})
export class CareersModule {}
