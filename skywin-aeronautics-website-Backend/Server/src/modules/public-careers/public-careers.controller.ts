import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CareersService } from '../careers/careers.service';
import { CareerOpeningDto } from '../careers/dto/career-opening.dto';

@ApiTags('Public Careers')
@Controller('public/careers')
export class PublicCareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get()
  @ApiOperation({ summary: 'List published career openings (public)' })
  @ApiOkResponse({ type: CareerOpeningDto, isArray: true })
  getOpenings(): Promise<CareerOpeningDto[]> {
    return this.careersService.findAll({ status: true });
  }
}

