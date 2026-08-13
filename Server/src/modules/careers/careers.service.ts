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
import { CreateCareerOpeningDto } from "./dto/create-career-opening.dto";
import { CareerOpeningDto } from "./dto/career-opening.dto";
import { UpdateCareerOpeningDto } from "./dto/update-career-opening.dto";
import { CareerOpening } from "./schemas/career-opening.schema";

@Injectable()
export class CareersService {
  constructor(
    @InjectModel(CareerOpening.name)
    private readonly careerOpeningModel: Model<CareerOpening>,
  ) {}

  /**
   * Returns a paginated list of career openings.
   * Role-based visibility is applied: viewers only see active openings,
   * operators also see their own inactive ones, admins see everything.
   */

  async findAll(
    filters?: { status?: boolean; limit?: number; offset?: number },
    userRole?: string,
    userId?: string,
  ): Promise<CareerOpeningDto[]> {
    const query: Record<string, unknown> = {};
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
    const openings = await this.careerOpeningModel
      .find(query)
      .skip(offset)
      .limit(limit)
      .exec();
    return openings.map((opening) => ({
      id: opening._id.toString(),
      title: opening.title,
      location: opening.location,
      employmentType: opening.employmentType,
      description: opening.description,
      status: opening.status,
      audit: opening.audit
        ? {
            createdBy: opening.audit.createdBy,
            createdAt: opening.audit.createdAt?.toISOString(),
            updatedBy: opening.audit.updatedBy,
            updatedAt: opening.audit.updatedAt?.toISOString(),
          }
        : undefined,
    }));
  }

  /**
   * Returns a single career opening by ID.
   *
   * Security (IDOR): Applies role-based visibility at the MongoDB query level.
   * Viewers may only retrieve active (status=true) openings. Operators may also
   * retrieve drafts they created. Admins see all openings.
   * Using a query-level filter prevents timing-based enumeration attacks that
   * would arise from fetching first and then checking ownership.
   *
   * @throws BadRequestException if the ID format is invalid.
   * @throws NotFoundException if no matching opening exists (or is not visible).
   */
  async findOne(
    id: string,
    userRole?: string,
    userId?: string,
  ): Promise<CareerOpeningDto> {
    this.validateId(id);

    const query: Record<string, unknown> = { _id: id };

    // Security (IDOR): Enforce visibility at query level so non-admin users
    // cannot retrieve restricted resources by guessing their IDs.
    if (userRole !== undefined && userRole !== "admin") {
      if (userRole === "operator") {
        // Operators can see their own drafts or any active opening.
        query["$or"] = [{ status: true }, { "audit.createdBy": userId }];
      } else {
        // Viewers can only see active openings.
        query.status = true;
      }
    }

    const opening = await this.careerOpeningModel.findOne(query as any).exec();
    if (!opening) {
      throw new NotFoundException("Career opening not found");
    }

    return {
      id: opening._id.toString(),
      title: opening.title,
      location: opening.location,
      employmentType: opening.employmentType,
      description: opening.description,
      status: opening.status,
      audit: opening.audit
        ? {
            createdBy: opening.audit.createdBy,
            createdAt: opening.audit.createdAt?.toISOString(),
            updatedBy: opening.audit.updatedBy,
            updatedAt: opening.audit.updatedAt?.toISOString(),
          }
        : undefined,
    };
  }

  /**
   * Creates a new career opening.
   * Admins may set any initial status; operators default to active.
   *
   * @param payload  - Validated create DTO.
   * @param userRole - The creator's role.
   * @param userId   - The creator's ID (stored in audit trail).
   */
  async create(
    payload: CreateCareerOpeningDto,
    userRole: string,
    userId: string,
  ): Promise<CareerOpeningDto> {
    // Set status based on user role: admin can set status, operator defaults to true
    const status =
      userRole === "admin"
        ? (payload.status ?? false)
        : (payload.status ?? true);

    const created = new this.careerOpeningModel({
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
      title: saved.title,
      location: saved.location,
      employmentType: saved.employmentType,
      description: saved.description,
      status: saved.status,
    };
  }

  /**
   * Updates an existing career opening.
   * Non-admin users may only update openings they created.
   *
   * @throws NotFoundException  if the opening does not exist.
   * @throws ForbiddenException if the user does not own the opening.
   */
  async update(
    id: string,
    payload: UpdateCareerOpeningDto,
    userRole: string,
    userId: string,
  ): Promise<CareerOpeningDto> {
    this.validateId(id);

    const existing = await this.careerOpeningModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException("Career opening not found");
    }

    if (userRole !== "admin" && existing.audit?.createdBy !== userId) {
      throw new ForbiddenException("You can only modify your own resources");
    }

    const updateData: Record<string, unknown> = {
      ...payload,
      "audit.updatedAt": new Date(),
    };

    const updated = await this.careerOpeningModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException("Career opening not found");
    }
    return {
      id: updated._id.toString(),
      title: updated.title,
      location: updated.location,
      employmentType: updated.employmentType,
      description: updated.description,
      status: updated.status,
    };
  }

  /**
   * Permanently deletes a career opening.
   * Non-admin users may only delete openings they created.
   *
   * @throws NotFoundException  if the opening does not exist.
   * @throws ForbiddenException if the user does not own the opening.
   */
  async remove(id: string, userRole: string, userId: string): Promise<void> {
    this.validateId(id);
    const career = await this.careerOpeningModel.findById(id).exec();
    if (!career) {
      throw new NotFoundException("Career opening not found");
    }

    if (userRole !== "admin" && career.audit?.createdBy !== userId) {
      throw new ForbiddenException("You can only delete your own resources");
    }

    const result = await this.careerOpeningModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException("Career opening not found");
    }
  }

  /**
   * Toggles the active/inactive status of a career opening.
   * Non-admin users may only toggle openings they created.
   *
   * @throws NotFoundException  if the opening does not exist.
   * @throws ForbiddenException if the user does not own the opening.
   */
  async toggleStatus(
    id: string,
    userRole: string,
    userId: string,
  ): Promise<CareerOpeningDto> {
    this.validateId(id);
    const career = await this.careerOpeningModel.findById(id).exec();
    if (!career) {
      throw new NotFoundException("Career opening not found");
    }

    if (userRole !== "admin" && career.audit?.createdBy !== userId) {
      throw new ForbiddenException("You can only modify your own resources");
    }

    career.status = !career.status;
    // Q4 fix: initialise audit with typed object rather than {} as any.
    if (!career.audit) {
      career.audit = { createdBy: userId, createdAt: new Date(), updatedBy: userId, updatedAt: new Date() } as typeof career.audit;
    }
    career.audit.updatedAt = new Date();
    await career.save();
    return {
      id: career._id.toString(),
      title: career.title,
      location: career.location,
      employmentType: career.employmentType,
      description: career.description,
      status: career.status,
    };
  }

  /**
   * Validates that an ID is a 24-char hex MongoDB ObjectId or a valid UUID v4.
   *
   * Security (S3): `Types.ObjectId.isValid()` returns true for any 12-byte
   * string, which is overly permissive. We require the canonical 24-character
   * hex representation to prevent ambiguous ID matches.
   *
   * @throws BadRequestException if the ID does not match either format.
   */
  private validateId(id: string): void {
    const isMongoId = /^[a-f\d]{24}$/i.test(id);
    if (!isMongoId && !uuidValidate(id)) {
      throw new BadRequestException("Invalid ID format");
    }
  }

  /**
   * Exports a list of career openings to CSV format.
   *
   * Security: Values starting with formula-injection characters (=, +, -, @,
   * TAB, CR) are prefixed with a single quote to prevent spreadsheet formula
   * injection when the CSV is opened in Excel or Google Sheets.
   */
  exportToCsv(openings: CareerOpeningDto[]): string {
    const fields = [
      "id",
      "title",
      "location",
      "employmentType",
      "description",
      "status",
    ];
    // Pre-sanitise records using the correct @json2csv/plainjs v7 item API.
    const sanitized = openings.map((o) => {
      const record: Record<string, string> = {};
      for (const field of fields) {
        const str = String((o as unknown as Record<string, unknown>)[field] ?? "");
        record[field] = /^[=+\-@\t\r]/.test(str) ? "'" + str : str;
      }
      return record;
    });
    const parser = new Parser({ fields });
    return parser.parse(sanitized);
  }

  /**
   * Exports a list of career openings to a PDF buffer.
   * Automatically paginates when content would overflow the page.
   */
  exportToPdf(openings: CareerOpeningDto[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Title
      doc.fontSize(24).text("Career Openings", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown(2);

      // Separator line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      openings.forEach((opening, index) => {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }

        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(`${index + 1}. ${opening.title}`, { continued: false });
        doc.moveDown(0.5);

        doc
          .fontSize(12)
          .font("Helvetica")
          .text(`Location: ${opening.location}`);
        doc.moveDown(0.3);
        doc.fontSize(12).text(`Employment Type: ${opening.employmentType}`);
        doc.moveDown(0.3);
        doc.fontSize(12).text(`Description: ${opening.description}`);
        doc.moveDown(0.3);
        doc
          .fontSize(12)
          .text(`Status: ${opening.status ? "Active" : "Inactive"}`);
        doc.moveDown(1);

        // Separator line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);
      });

      doc.end();
    });
  }
}
