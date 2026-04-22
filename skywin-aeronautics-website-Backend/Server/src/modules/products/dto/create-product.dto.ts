import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wing Spar Assembly', description: 'Product name' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({ example: 'Aerospace Structures', description: 'Product category' })
  @IsString({ message: 'Category must be a string' })
  @MinLength(2, { message: 'Category must be at least 2 characters' })
  @MaxLength(50, { message: 'Category cannot exceed 50 characters' })
  category: string;

  @ApiProperty({ example: 'High-precision wing spar for commercial aircraft', description: 'Product description' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description: string;

  @ApiProperty({ example: 15000.99, description: 'Product price' })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @ApiProperty({ example: 'https://example.com/images/wing-spar.jpg', description: 'Product image URL', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  @MaxLength(500, { message: 'Image URL cannot exceed 500 characters' })
  image?: string;

  @ApiProperty({ example: 25, description: 'Product stock quantity' })
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;

  @ApiProperty({ example: true, description: 'Product status', required: false })
  @IsOptional()
  @IsBoolean({ message: 'Status must be a boolean value' })
  status?: boolean;
}
