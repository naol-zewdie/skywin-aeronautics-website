import { ApiProperty } from '@nestjs/swagger';

export class CareerOpeningDto {
  @ApiProperty({ example: 'c_001' })
  id: string;

  @ApiProperty({ example: 'Manufacturing Engineer' })
  title: string;

  @ApiProperty({ example: 'Bangalore, India' })
  location: string;

  @ApiProperty({ example: 'Full-time' })
  employmentType: string;

  @ApiProperty({ example: 'Responsible for aerospace component manufacturing and quality control' })
  description: string;

  @ApiProperty({ example: true })
  status: boolean;
}
