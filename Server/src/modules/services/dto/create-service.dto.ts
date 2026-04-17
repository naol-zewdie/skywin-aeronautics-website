import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'Precision CNC Machining' })
  name: string;

  @ApiProperty({
    example: 'High-accuracy machining for aerospace-grade components.',
  })
  description: string;
}
