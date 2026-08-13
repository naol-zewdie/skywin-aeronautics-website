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
import { CreateCareerOpeningDto } from "./dto/create-career-opening.dto";
import { CareerOpeningDto } from "./dto/career-opening.dto";
import { UpdateCareerOpeningDto } from "./dto/update-career-opening.dto";
import { CareersService } from "./careers.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles, Role } from "../../common/guards/roles.guard";

const MAX_EXPORT_RECORDS = 10000;

/** Typed request shape after JWT validation has populated req.user. */
interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags("Careers")
@Controller("careers")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("JWT-auth")
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: "List open career positions" })
  @ApiOkResponse({ type: CareerOpeningDto, isArray: true })
  getOpenings(@Req() req: AuthenticatedRequest): Promise<CareerOpeningDto[]> {
    return this.careersService.findAll(
      undefined,
      req.user?.role,
      req.user?.userId,
    );
  }

  @Get(":id")
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: "Get career opening by id" })
  @ApiParam({ name: "id", type: "string", description: "Career Opening ID" })
  @ApiOkResponse({ type: CareerOpeningDto })
  getOpening(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<CareerOpeningDto> {
    return this.careersService.findOne(id, req.user?.role, req.user?.userId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Create career opening" })
  @ApiCreatedResponse({ type: CareerOpeningDto })
  createOpening(
    @Body() payload: CreateCareerOpeningDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CareerOpeningDto> {
    return this.careersService.create(
      payload,
      req.user?.role,
      req.user?.userId,
    );
  }

  @Patch(":id/toggle-status")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Toggle career opening status" })
  @ApiParam({ name: "id", type: "string", description: "Career Opening ID" })
  @ApiOkResponse({ type: CareerOpeningDto })
  toggleOpeningStatus(
    @Param("id") id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<CareerOpeningDto> {
    return this.careersService.toggleStatus(
      id,
      req.user?.role,
      req.user?.userId,
    );
  }

  @Patch(":id")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Update career opening" })
  @ApiParam({ name: "id", type: "string", description: "Career Opening ID" })
  @ApiOkResponse({ type: CareerOpeningDto })
  updateOpening(
    @Param("id") id: string,
    @Body() payload: UpdateCareerOpeningDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CareerOpeningDto> {
    return this.careersService.update(
      id,
      payload,
      req.user?.role,
      req.user?.userId,
    );
  }

  @Delete(":id")
  @HttpCode(204)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Delete career opening" })
  @ApiParam({ name: "id", type: "string", description: "Career Opening ID" })
  @ApiNoContentResponse({ description: "Career opening deleted" })
  removeOpening(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<void> {
    return this.careersService.remove(id, req.user?.role, req.user?.userId);
  }

  @Get("export/csv")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Export career openings to CSV" })
  async exportCsv(
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
  ): Promise<string> {
    const openings = await this.careersService.findAll({
      limit: MAX_EXPORT_RECORDS,
    });
    const filtered =
      req.user?.role !== "admin"
        ? openings.filter((o) => o.audit?.createdBy === req.user?.userId)
        : openings;
    const csv = this.careersService.exportToCsv(filtered);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=careers.csv");
    return csv;
  }

  @Get("export/pdf")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Export career openings to PDF" })
  async exportPdf(
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
  ): Promise<Buffer> {
    const openings = await this.careersService.findAll({
      limit: MAX_EXPORT_RECORDS,
    });
    const filtered =
      req.user?.role !== "admin"
        ? openings.filter((o) => o.audit?.createdBy === req.user?.userId)
        : openings;
    const pdfBuffer = await this.careersService.exportToPdf(filtered);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=careers.pdf");
    return pdfBuffer;
  }
}
