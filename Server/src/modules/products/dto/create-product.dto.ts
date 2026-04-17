import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Wing Spar Assembly' })
  name: string;

  @ApiProperty({ example: 'Aerospace Structures' })
  category: string;
}
