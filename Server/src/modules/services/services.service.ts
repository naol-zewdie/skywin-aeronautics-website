import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { validate as uuidValidate } from "uuid";
import { Parser } from "@json2csv/plainjs";
import PDFDocument from "pdfkit";
import { CreateServiceDto } from "./dto/create-service.dto";
import { ServiceDto } from "./dto/service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { Service } from "./schemas/service.schema";

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
  ) {}

  /**
   * Returns a paginated list of services.
   * Viewers only see active services. Operators also see their own inactive ones.
   * Admins see everything.
   */
  async findAll(
    filters?: { status?: boolean; limit?: number; offset?: number },
    userRole?: string,
    userId?: string,
  ): Promise<ServiceDto[]> {
    const query: any = {};
    if (filters?.status !== undefined) {
      query.status = filters.status;
    }

    if (userRole && userRole !== "admin") {
      const roleCondition =
        userRole === "operator"
          ? { $or: [{ status: true }, { "audit.createdBy": userId }] }
          : { status: true };

      if (query.$or && roleCondition.$or) {
        query.$and = [{ $or: query.$or }, roleCondition];
        delete query.$or;
      } else {
        Object.assign(query, roleCondition);
      }
    }

    const limit = filters?.limit ?? 20;
    const offset = filters?.offset ?? 0;
    const services = await this.serviceModel
      .find(query)
      .skip(offset)
      .limit(limit)
      .exec();
    return services.map((service) => ({
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      image: service.image,
      status: service.status,
      audit: service.audit
        ? {
            createdBy: service.audit.createdBy,
            createdAt: service.audit.createdAt?.toISOString(),
            updatedBy: service.audit.updatedBy,
            updatedAt: service.audit.updatedAt?.toISOString(),
          }
        : undefined,
    }));
  }

  /**
   * Returns a single service by ID.
   * Non-admin users may only view active services or ones they created.
   *
   * @throws BadRequestException if the ID format is invalid.
   * @throws NotFoundException if no service is found.
   * @throws ForbiddenException if the user cannot view this service.
   */
  async findOne(
    id: string,
    userRole?: string,
    userId?: string,
  ): Promise<ServiceDto> {
    this.validateId(id);

    const query: Record<string, unknown> = { _id: id };

    // Security (IDOR): Enforce visibility at query level so non-admin users
    // cannot probe or retrieve restricted services by ID.
    if (userRole !== undefined && userRole !== "admin") {
      if (userRole === "operator") {
        query["$or"] = [{ status: true }, { "audit.createdBy": userId }];
      } else {
        query.status = true;
      }
    }

    const service = await this.serviceModel.findOne(query as any).exec();
    if (!service) {
      throw new NotFoundException("Service not found");
    }

    return {
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      image: service.image,
      status: service.status,
      audit: service.audit
        ? {
            createdBy: service.audit.createdBy,
            createdAt: service.audit.createdAt?.toISOString(),
            updatedBy: service.audit.updatedBy,
            updatedAt: service.audit.updatedAt?.toISOString(),
          }
        : undefined,
    };
  }

  /**
   * Creates a new service.
   * Admins may set the initial status; operators default to active.
   *
   * @param payload  - Validated create-service DTO.
   * @param userRole - The creator's role.
   * @param userId   - The creator's user ID (stored in audit trail).
   */
  async create(
    payload: CreateServiceDto,
    userRole: string,
    userId: string,
  ): Promise<ServiceDto> {
    // Set status based on user role: admin can set status, operator defaults to true
    const status =
      userRole === "admin"
        ? (payload.status ?? false)
        : (payload.status ?? true);

    const created = new this.serviceModel({
      ...payload,
      status,
      audit: {
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const saved = await created.save();
    return {
      id: saved._id.toString(),
      name: saved.name,
      description: saved.description,
      image: saved.image,
      status: saved.status,
      audit: saved.audit
        ? {
            createdBy: saved.audit.createdBy,
            createdAt: saved.audit.createdAt?.toISOString(),
            updatedBy: saved.audit.updatedBy,
            updatedAt: saved.audit.updatedAt?.toISOString(),
          }
        : undefined,
    };
  }

  /**
   * Updates an existing service.
   * Non-admin users may only update services they created.
   *
   * @throws BadRequestException if the ID format is invalid.
   * @throws NotFoundException if the service does not exist.
   * @throws ForbiddenException if the user does not own the service.
   */
  async update(
    id: string,
    payload: UpdateServiceDto,
    userRole: string,
    userId: string,
  ): Promise<ServiceDto> {
    this.validateId(id);

    // Security (IDOR TOCTOU fix): embed the ownership check atomically inside
    // the update query instead of using a separate findById + findByIdAndUpdate.
    // This eliminates the race window where a role change between the two DB
    // calls could allow an escalated operation.
    const ownerFilter =
      userRole === "admin"
        ? { _id: id }
        : { _id: id, "audit.createdBy": userId };

    const updateData: Record<string, unknown> = {
      ...payload,
      "audit.updatedBy": userId,
      "audit.updatedAt": new Date(),
    };

    const updated = await this.serviceModel
      .findOneAndUpdate(ownerFilter, { $set: updateData }, { returnDocument: "after" })
      .exec();

    if (!updated) {
      // Could be: not found, or ownership check failed. To prevent enumeration
      // we do not distinguish between the two cases for non-admin users.
      const exists = await this.serviceModel.exists({ _id: id }).exec();
      if (!exists) {
        throw new NotFoundException("Service not found");
      }
      throw new ForbiddenException("You can only modify your own resources");
    }

    return {
      id: updated._id.toString(),
      name: updated.name,
      description: updated.description,
      image: updated.image,
      status: updated.status,
      audit: updated.audit
        ? {
            createdBy: updated.audit.createdBy,
            createdAt: updated.audit.createdAt?.toISOString(),
            updatedBy: updated.audit.updatedBy,
            updatedAt: updated.audit.updatedAt?.toISOString(),
          }
        : undefined,
    };
  }

  /**
   * Permanently deletes a service.
   * Non-admin users may only delete services they created.
   */
  async remove(id: string, userRole: string, userId: string): Promise<void> {
    this.validateId(id);

    // Security (IDOR TOCTOU fix): atomic ownership-check-and-delete so no race
    // window exists between fetching the document and deleting it.
    const ownerFilter =
      userRole === "admin"
        ? { _id: id }
        : { _id: id, "audit.createdBy": userId };

    const deleted = await this.serviceModel.findOneAndDelete(ownerFilter).exec();

    if (!deleted) {
      const exists = await this.serviceModel.exists({ _id: id }).exec();
      if (!exists) {
        throw new NotFoundException("Service not found");
      }
      throw new ForbiddenException("You can only delete your own resources");
    }
  }

  /**
   * Toggles the active/inactive status of a service.
   * Non-admin users may only toggle their own services.
   */
  async toggleStatus(
    id: string,
    userRole: string,
    userId: string,
  ): Promise<ServiceDto> {
    this.validateId(id);
    const service = await this.serviceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException("Service not found");
    }

    if (userRole !== "admin" && service.audit?.createdBy !== userId) {
      throw new ForbiddenException("You can only modify your own resources");
    }

    service.status = !service.status;
    // Q4 fix: initialise audit with proper field shapes instead of {} as any.
    if (!service.audit) {
      service.audit = { createdBy: userId, createdAt: new Date(), updatedBy: userId, updatedAt: new Date() } as typeof service.audit;
    }
    service.audit.updatedAt = new Date();
    await service.save();
    return {
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      image: service.image,
      status: service.status,
      audit: service.audit
        ? {
            createdBy: service.audit.createdBy,
            createdAt: service.audit.createdAt?.toISOString(),
            updatedBy: service.audit.updatedBy,
            updatedAt: service.audit.updatedAt?.toISOString(),
          }
        : undefined,
    };
  }

  /**
   * Validates that an ID is a 24-char hex MongoDB ObjectId or a valid UUID.
   * @throws BadRequestException if the format is not recognised.
   */
  private validateId(id: string): void {
    const isMongoId = /^[a-f\d]{24}$/i.test(id);
    if (!isMongoId && !uuidValidate(id)) {
      throw new BadRequestException("Invalid ID format");
    }
  }

  /**
   * Exports a list of services to CSV format.
   * Sanitises values to prevent formula injection when opened in spreadsheet apps.
   */
  exportToCsv(services: ServiceDto[]): string {
    const fields = ["id", "name", "description", "image", "status"];
    const sanitized = services.map((s) => {
      const record: Record<string, string> = {};
      for (const field of fields) {
        const str = String((s as unknown as Record<string, unknown>)[field] ?? "");
        record[field] = /^[=+\-@\t\r]/.test(str) ? "'" + str : str;
      }
      return record;
    });
    const parser = new Parser({ fields });
    return parser.parse(sanitized);
  }

  exportToPdf(services: ServiceDto[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Title
      doc.fontSize(24).text("Services Catalog", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown(2);

      // Separator line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      services.forEach((service, index) => {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }

        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(`${index + 1}. ${service.name}`, { continued: false });
        doc.moveDown(0.5);

        doc
          .fontSize(12)
          .font("Helvetica")
          .text(`Description: ${service.description}`);
        doc.moveDown(0.3);
        doc
          .fontSize(12)
          .text(`Status: ${service.status ? "Active" : "Inactive"}`);
        doc.moveDown(1);

        // Separator line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);
      });

      doc.end();
    });
  }
}
