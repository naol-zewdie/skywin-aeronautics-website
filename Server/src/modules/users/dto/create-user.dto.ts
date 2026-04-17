import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Amelia Hart' })
  fullName: string;

  @ApiProperty({ example: 'amelia@skywin.aero' })
  email: string;

  @ApiProperty({ example: 'admin' })
  role: string;
}
