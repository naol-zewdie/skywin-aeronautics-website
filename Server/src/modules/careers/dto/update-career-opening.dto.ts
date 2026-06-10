import { PartialType } from '@nestjs/mapped-types';
import { CreateCareerOpeningDto } from './create-career-opening.dto';

export class UpdateCareerOpeningDto extends PartialType(CreateCareerOpeningDto) {}
