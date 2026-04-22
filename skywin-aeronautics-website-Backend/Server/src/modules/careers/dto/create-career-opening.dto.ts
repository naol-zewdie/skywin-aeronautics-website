import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsOptional,
  IsIn,
  Matches,
} from 'class-validator';

export class CreateCareerOpeningDto {
  @ApiProperty({ example: 'Manufacturing Engineer', description: 'Job title' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  title: string;

  @ApiProperty({ example: 'Bangalore, India', description: 'Job location' })
  @IsString({ message: 'Location must be a string' })
  @MinLength(2, { message: 'Location must be at least 2 characters' })
  @MaxLength(100, { message: 'Location cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z\s,.'-]+$/, { message: 'Location contains invalid characters' })
  location: string;

  @ApiProperty({ example: 'Full-time', description: 'Employment type', enum: ['Full-time', 'Part-time', 'Contract', 'Internship'] })
  @IsString({ message: 'Employment type must be a string' })
  @IsIn(['Full-time', 'Part-time', 'Contract', 'Internship'], { message: 'Employment type must be Full-time, Part-time, Contract, or Internship' })
  employmentType: string;

  @ApiProperty({ example: 'Responsible for aerospace component manufacturing and quality control', description: 'Job description' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(20, { message: 'Description must be at least 20 characters' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description: string;

  @ApiProperty({ example: true, description: 'Opening status', required: false })
  @IsOptional()
  @IsBoolean({ message: 'Status must be a boolean value' })
  status?: boolean;
}
