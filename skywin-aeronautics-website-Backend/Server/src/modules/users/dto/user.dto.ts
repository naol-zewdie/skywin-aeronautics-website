import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'u_001' })
  id: string;

  @ApiProperty({ example: 'Amelia Hart' })
  fullName: string;

  @ApiProperty({ example: 'amelia@skywin.aero' })
  email: string;

  @ApiProperty({ example: 'admin' })
  role: string;

  @ApiProperty({ example: true })
  status: boolean;
}
