import { ApiProperty } from '@nestjs/swagger';

export class CreateCareerOpeningDto {
  @ApiProperty({ example: 'Manufacturing Engineer' })
  title: string;

  @ApiProperty({ example: 'Bangalore, India' })
  location: string;

  @ApiProperty({ example: 'Full-time' })
  employmentType: string;
}
