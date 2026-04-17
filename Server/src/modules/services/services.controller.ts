import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all services' })
  @ApiOkResponse({ type: ServiceDto, isArray: true })
  getServices(): Promise<ServiceDto[]> {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: ServiceDto })
  getService(@Param('id') id: string): Promise<ServiceDto> {
    return this.servicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create service' })
  @ApiCreatedResponse({ type: ServiceDto })
  createService(@Body() payload: CreateServiceDto): Promise<ServiceDto> {
    return this.servicesService.create(payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: ServiceDto })
  updateService(
    @Param('id') id: string,
    @Body() payload: UpdateServiceDto,
  ): Promise<ServiceDto> {
    return this.servicesService.update(id, payload);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete service' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiNoContentResponse({ description: 'Service deleted' })
  removeService(@Param('id') id: string): Promise<void> {
    return this.servicesService.remove(id);
  }
}
