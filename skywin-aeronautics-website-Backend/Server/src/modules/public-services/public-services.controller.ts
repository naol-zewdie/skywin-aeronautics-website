import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServicesService } from '../services/services.service';
import { ServiceDto } from '../services/dto/service.dto';

@ApiTags('Public Services')
@Controller('public/services')
export class PublicServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'List published services (public)' })
  @ApiOkResponse({ type: ServiceDto, isArray: true })
  getServices(): Promise<ServiceDto[]> {
    return this.servicesService.findAll({ status: true });
  }
}

