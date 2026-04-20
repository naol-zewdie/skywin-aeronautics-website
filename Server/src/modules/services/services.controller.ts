import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../../common/guards/roles.guard';

@ApiTags('Services')
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: 'List all services' })
  @ApiOkResponse({ type: ServiceDto, isArray: true })
  getServices(): Promise<ServiceDto[]> {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get service by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Service ID' })
  @ApiOkResponse({ type: ServiceDto })
  getService(@Param('id') id: string): Promise<ServiceDto> {
    return this.servicesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Create service' })
  @ApiCreatedResponse({ type: ServiceDto })
  createService(@Body() payload: CreateServiceDto): Promise<ServiceDto> {
    return this.servicesService.create(payload);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Update service' })
  @ApiParam({ name: 'id', type: 'string', description: 'Service ID' })
  @ApiOkResponse({ type: ServiceDto })
  updateService(
    @Param('id') id: string,
    @Body() payload: UpdateServiceDto,
  ): Promise<ServiceDto> {
    return this.servicesService.update(id, payload);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete service (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Service ID' })
  @ApiNoContentResponse({ description: 'Service deleted' })
  removeService(@Param('id') id: string): Promise<void> {
    return this.servicesService.remove(id);
  }
}
