import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({ example: 'p_001' })
  id: string;

  @ApiProperty({ example: 'Wing Spar Assembly' })
  name: string;

  @ApiProperty({ example: 'Aerospace Structures' })
  category: string;
}
