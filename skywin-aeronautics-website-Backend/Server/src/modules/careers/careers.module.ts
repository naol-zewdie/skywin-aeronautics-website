import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CareersController } from './careers.controller';
import { CareerOpening, CareerOpeningSchema } from './schemas/career-opening.schema';
import { CareersService } from './careers.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: CareerOpening.name, schema: CareerOpeningSchema }])],
  controllers: [CareersController],
  providers: [CareersService],
  exports: [CareersService],
})
export class CareersModule {}
