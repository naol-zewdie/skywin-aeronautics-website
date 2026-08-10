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
  Req,
} from "@nestjs/common";
import type { Response } from "express";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateServiceDto } from "./dto/create-service.dto";
import { ServiceDto } from "./dto/service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { ServicesService } from "./services.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles, Role } from "../../common/guards/roles.guard";

const MAX_EXPORT_RECORDS = 10000;

@ApiTags("Services")
@Controller("services")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("JWT-auth")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: "List all services" })
  @ApiOkResponse({ type: ServiceDto, isArray: true })
  getServices(@Req() req): Promise<ServiceDto[]> {
    return this.servicesService.findAll(
      undefined,
      req.user?.role,
      req.user?.userId,
    );
  }

  @Get(":id")
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: "Get service by id" })
  @ApiParam({ name: "id", type: "string", description: "Service ID" })
  @ApiOkResponse({ type: ServiceDto })
  getService(@Param("id") id: string, @Req() req): Promise<ServiceDto> {
    return this.servicesService.findOne(id, req.user?.role, req.user?.userId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Create service" })
  @ApiCreatedResponse({ type: ServiceDto })
  createService(
    @Body() payload: CreateServiceDto,
    @Req() req,
  ): Promise<ServiceDto> {
    return this.servicesService.create(
      payload,
      req.user?.role,
      req.user?.userId,
    );
  }

  @Patch(":id/toggle-status")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Toggle service status" })
  @ApiParam({ name: "id", type: "string", description: "Service ID" })
  @ApiOkResponse({ type: ServiceDto })
  toggleServiceStatus(
    @Param("id") id: string,
    @Req() req,
  ): Promise<ServiceDto> {
    return this.servicesService.toggleStatus(
      id,
      req.user?.role,
      req.user?.userId,
    );
  }

  @Patch(":id")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Update service" })
  @ApiParam({ name: "id", type: "string", description: "Service ID" })
  @ApiOkResponse({ type: ServiceDto })
  updateService(
    @Param("id") id: string,
    @Body() payload: UpdateServiceDto,
    @Req() req,
  ): Promise<ServiceDto> {
    return this.servicesService.update(
      id,
      payload,
      req.user?.role,
      req.user?.userId,
    );
  }

  @Delete(":id")
  @HttpCode(204)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Delete service" })
  @ApiParam({ name: "id", type: "string", description: "Service ID" })
  @ApiNoContentResponse({ description: "Service deleted" })
  removeService(@Param("id") id: string, @Req() req): Promise<void> {
    return this.servicesService.remove(id, req.user?.role, req.user?.userId);
  }

  @Get("export/csv")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Export services to CSV" })
  async exportCsv(
    @Res({ passthrough: true }) res: Response,
    @Req() req,
  ): Promise<string> {
    const services = await this.servicesService.findAll({
      limit: MAX_EXPORT_RECORDS,
    });
    const filtered =
      req.user?.role !== "admin"
        ? services.filter((s) => s.audit?.createdBy === req.user?.userId)
        : services;
    const csv = this.servicesService.exportToCsv(filtered);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=services.csv");
    return csv;
  }

  @Get("export/pdf")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Export services to PDF" })
  async exportPdf(
    @Res({ passthrough: true }) res: Response,
    @Req() req,
  ): Promise<Buffer> {
    const services = await this.servicesService.findAll({
      limit: MAX_EXPORT_RECORDS,
    });
    const filtered =
      req.user?.role !== "admin"
        ? services.filter((s) => s.audit?.createdBy === req.user?.userId)
        : services;
    const pdfBuffer = await this.servicesService.exportToPdf(filtered);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=services.pdf");
    return pdfBuffer;
  }
}
