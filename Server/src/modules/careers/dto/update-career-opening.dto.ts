import { PartialType } from '@nestjs/swagger';
import { CreateCareerOpeningDto } from './create-career-opening.dto';

export class UpdateCareerOpeningDto extends PartialType(CreateCareerOpeningDto) {}
