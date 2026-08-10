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

  async findAll(
    filters?: { status?: boolean; limit?: number; offset?: number },
    userRole?: string,
    userId?: string,
  ): Promise<CareerOpeningDto[]> {
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

  async findOne(
    id: string,
    userRole?: string,
    userId?: string,
  ): Promise<CareerOpeningDto> {
    this.validateId(id);
    const opening = await this.careerOpeningModel.findById(id).exec();
    if (!opening) {
      throw new NotFoundException("Career opening not found");
    }

    if (
      userRole !== undefined &&
      userRole !== "admin" &&
      opening.audit?.createdBy !== userId
    ) {
      throw new ForbiddenException("You can only view your own resources");
    }

    return {
      id: opening._id.toString(),
      title: opening.title,
      location: opening.location,
      employmentType: opening.employmentType,
      description: opening.description,
      status: opening.status,
    };
  }

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

    const updateData: any = { ...payload, "audit.updatedAt": new Date() };

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
    if (!career.audit) career.audit = {} as any;
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

  private validateId(id: string): void {
    if (!uuidValidate(id) && !Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ID format");
    }
  }

  exportToCsv(openings: CareerOpeningDto[]): string {
    const fields = [
      "id",
      "title",
      "location",
      "employmentType",
      "description",
      "status",
    ];
    const opts = {
      fields,
      transforms: [
        (field: { label: string }, value: unknown) => {
          const str = String(value ?? "");
          if (/^[=+\-@\t\r]/.test(str)) {
            return { [field.label]: "'" + str };
          }
          return { [field.label]: str };
        },
      ],
    };
    const parser = new Parser(opts as any);
    return parser.parse(openings);
  }

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
