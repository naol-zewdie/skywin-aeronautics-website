import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({ example: 'p_001' })
  id: string;

  @ApiProperty({ example: 'Wing Spar Assembly' })
  name: string;

  @ApiProperty({ example: 'Aerospace Structures' })
  category: string;

  @ApiProperty({ example: 'High-precision wing spar for commercial aircraft' })
  description: string;

  @ApiProperty({ example: 15000.99 })
  price: number;

  @ApiProperty({ example: 'https://example.com/images/wing-spar.jpg', required: false })
  image?: string;

  @ApiProperty({ example: 25 })
  stock: number;

  @ApiProperty({ example: true })
  status: boolean;
}
