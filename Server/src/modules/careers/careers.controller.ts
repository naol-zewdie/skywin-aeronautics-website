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
import { CreateCareerOpeningDto } from './dto/create-career-opening.dto';
import { CareerOpeningDto } from './dto/career-opening.dto';
import { UpdateCareerOpeningDto } from './dto/update-career-opening.dto';
import { CareersService } from './careers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../../common/guards/roles.guard';

@ApiTags('Careers')
@Controller('careers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: 'List open career positions' })
  @ApiOkResponse({ type: CareerOpeningDto, isArray: true })
  getOpenings(): Promise<CareerOpeningDto[]> {
    return this.careersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get career opening by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Career Opening ID' })
  @ApiOkResponse({ type: CareerOpeningDto })
  getOpening(@Param('id') id: string): Promise<CareerOpeningDto> {
    return this.careersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Create career opening' })
  @ApiCreatedResponse({ type: CareerOpeningDto })
  createOpening(
    @Body() payload: CreateCareerOpeningDto,
  ): Promise<CareerOpeningDto> {
    return this.careersService.create(payload);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Update career opening' })
  @ApiParam({ name: 'id', type: 'string', description: 'Career Opening ID' })
  @ApiOkResponse({ type: CareerOpeningDto })
  updateOpening(
    @Param('id') id: string,
    @Body() payload: UpdateCareerOpeningDto,
  ): Promise<CareerOpeningDto> {
    return this.careersService.update(id, payload);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Delete career opening' })
  @ApiParam({ name: 'id', type: 'string', description: 'Career Opening ID' })
  @ApiNoContentResponse({ description: 'Career opening deleted' })
  removeOpening(@Param('id') id: string): Promise<void> {
    return this.careersService.remove(id);
  }

  @Get('export/csv')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Export career openings to CSV' })
  async exportCsv(
    @Res() res: Response,
    @Query('search') search?: string,
  ): Promise<void> {
    const openings = await this.careersService.findAll();
    const csv = this.careersService.exportToCsv(openings);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=careers.csv');
    res.send(csv);
  }

  @Get('export/pdf')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Export career openings to PDF' })
  async exportPdf(
    @Res() res: Response,
    @Query('search') search?: string,
  ): Promise<void> {
    const openings = await this.careersService.findAll();
    const pdfBuffer = await this.careersService.exportToPdf(openings);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=careers.pdf');
    res.send(pdfBuffer);
  }
}
