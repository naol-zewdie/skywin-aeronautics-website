import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "admin@skywin.aero", description: "User email address" })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({ example: "SecurePass123!", description: "User password" })
  @IsString()
  @MinLength(1, { message: "Password is required" })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ required: false, description: "Refresh token (optional — primarily read from the HTTP-only cookie)" })
  // Optional because the token is primarily read from the HTTP-only cookie
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: "admin@skywin.aero", description: "Email address for the account" })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: "admin@skywin.aero", description: "Email address for the account" })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({ description: "One-time reset token from the password reset email" })
  @IsString()
  @MinLength(1, { message: "Reset token is required" })
  token: string;

  @ApiProperty({ example: "NewSecurePass123!", description: "New password (min 8 chars, must contain uppercase, lowercase and a number)" })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @MaxLength(100, { message: "Password cannot exceed 100 characters" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  })
  password: string;
}
