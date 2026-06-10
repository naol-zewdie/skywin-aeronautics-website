import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsOptional,
  Matches,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Amelia Hart', description: 'User full name' })
  @IsString({ message: 'Full name must be a string' })
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'Full name can only contain letters, spaces, hyphens and apostrophes',
  })
  fullName: string;

  @ApiProperty({ example: 'amelia@skywin.aero', description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email: string;

  @ApiProperty({ example: 'admin', description: 'User role', enum: ['admin', 'operator', 'viewer'] })
  @IsString({ message: 'Role must be a string' })
  @IsIn(['admin', 'operator', 'viewer'], { message: 'Role must be admin, operator, or viewer' })
  role: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'User password' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({ example: true, description: 'User account status', required: false })
  @IsOptional()
  @IsBoolean({ message: 'Status must be a boolean value' })
  status?: boolean;
}
