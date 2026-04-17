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
import { CreateCareerOpeningDto } from './dto/create-career-opening.dto';
import { CareerOpeningDto } from './dto/career-opening.dto';
import { UpdateCareerOpeningDto } from './dto/update-career-opening.dto';
import { CareersService } from './careers.service';

@ApiTags('Careers')
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get()
  @ApiOperation({ summary: 'List open career positions' })
  @ApiOkResponse({ type: CareerOpeningDto, isArray: true })
  getOpenings(): Promise<CareerOpeningDto[]> {
    return this.careersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get career opening by id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: CareerOpeningDto })
  getOpening(@Param('id') id: string): Promise<CareerOpeningDto> {
    return this.careersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create career opening' })
  @ApiCreatedResponse({ type: CareerOpeningDto })
  createOpening(
    @Body() payload: CreateCareerOpeningDto,
  ): Promise<CareerOpeningDto> {
    return this.careersService.create(payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update career opening' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: CareerOpeningDto })
  updateOpening(
    @Param('id') id: string,
    @Body() payload: UpdateCareerOpeningDto,
  ): Promise<CareerOpeningDto> {
    return this.careersService.update(id, payload);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete career opening' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiNoContentResponse({ description: 'Career opening deleted' })
  removeOpening(@Param('id') id: string): Promise<void> {
    return this.careersService.remove(id);
  }
}
