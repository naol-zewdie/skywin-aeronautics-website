import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Precision CNC Machining', description: 'Service name' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({
    example: 'High-accuracy machining for aerospace-grade components.',
    description: 'Service description',
  })
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description: string;

  @ApiProperty({ example: true, description: 'Service status', required: false })
  @IsOptional()
  @IsBoolean({ message: 'Status must be a boolean value' })
  status?: boolean;
}
