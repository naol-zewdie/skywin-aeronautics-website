import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareersController } from './careers.controller';
import { CareerOpeningEntity } from './entities/career-opening.entity';
import { CareersService } from './careers.service';

@Module({
  imports:
    process.env.ENABLE_DB === 'true'
      ? [TypeOrmModule.forFeature([CareerOpeningEntity])]
      : [],
  controllers: [CareersController],
  providers: [CareersService],
})
export class CareersModule {}
