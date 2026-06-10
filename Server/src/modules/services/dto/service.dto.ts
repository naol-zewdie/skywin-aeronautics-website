import { ApiProperty } from '@nestjs/swagger';

export class ServiceDto {
  @ApiProperty({ example: 's_001' })
  id: string;

  @ApiProperty({ example: 'Precision CNC Machining' })
  name: string;

  @ApiProperty({
    example: 'High-accuracy machining for aerospace-grade components.',
  })
  description: string;

  @ApiProperty({ example: true })
  status: boolean;
}
