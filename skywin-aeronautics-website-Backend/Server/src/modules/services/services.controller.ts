import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import type { Response } from 'express';
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
  createService(@Body() payload: CreateServiceDto, @Req() req): Promise<ServiceDto> {
    return this.servicesService.create(payload, req.user?.role);
  }

  @Patch(':id/toggle-status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Toggle service status (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Service ID' })
  @ApiOkResponse({ type: ServiceDto })
  toggleServiceStatus(@Param('id') id: string): Promise<ServiceDto> {
    return this.servicesService.toggleStatus(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Update service' })
  @ApiParam({ name: 'id', type: 'string', description: 'Service ID' })
  @ApiOkResponse({ type: ServiceDto })
  updateService(
    @Param('id') id: string,
    @Body() payload: UpdateServiceDto,
    @Req() req,
  ): Promise<ServiceDto> {
    return this.servicesService.update(id, payload, req.user?.role);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Delete service' })
  @ApiParam({ name: 'id', type: 'string', description: 'Service ID' })
  @ApiNoContentResponse({ description: 'Service deleted' })
  removeService(@Param('id') id: string): Promise<void> {
    return this.servicesService.remove(id);
  }

  @Get('export/csv')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Export services to CSV' })
  async exportCsv(
    @Res() res: Response,
    @Query('search') search?: string,
  ): Promise<void> {
    const services = await this.servicesService.findAll();
    const csv = this.servicesService.exportToCsv(services);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=services.csv');
    res.send(csv);
  }

  @Get('export/pdf')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Export services to PDF' })
  async exportPdf(
    @Res() res: Response,
    @Query('search') search?: string,
  ): Promise<void> {
    const services = await this.servicesService.findAll();
    const pdfBuffer = await this.servicesService.exportToPdf(services);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=services.pdf');
    res.send(pdfBuffer);
  }
}
