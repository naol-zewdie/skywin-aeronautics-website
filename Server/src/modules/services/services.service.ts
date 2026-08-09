import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { validate as uuidValidate } from 'uuid';
import { Parser } from '@json2csv/plainjs';
import PDFDocument from 'pdfkit';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './schemas/service.schema';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
  ) {}

  async findAll(filters?: { status?: boolean; limit?: number; offset?: number }, userRole?: string, userId?: string): Promise<ServiceDto[]> {
    const query: any = {};
    if (filters?.status !== undefined) {
      query.status = filters.status;
    }

    if (userRole && userRole !== 'admin') {
      const roleCondition = userRole === 'operator'
        ? { $or: [{ status: true }, { 'audit.createdBy': userId }] }
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
    const services = await this.serviceModel.find(query).skip(offset).limit(limit).exec();
    return services.map(service => ({
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      image: service.image,
      status: service.status,
      audit: service.audit ? {
        createdBy: service.audit.createdBy,
        createdAt: service.audit.createdAt?.toISOString(),
        updatedBy: service.audit.updatedBy,
        updatedAt: service.audit.updatedAt?.toISOString(),
      } : undefined,
    }));
  }

  async findOne(id: string, userRole?: string, userId?: string): Promise<ServiceDto> {
    this.validateId(id);
    const service = await this.serviceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (userRole !== undefined && userRole !== 'admin' && service.audit?.createdBy !== userId) {
      throw new ForbiddenException('You can only view your own resources');
    }

    return {
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      image: service.image,
      status: service.status,
      audit: service.audit ? {
        createdBy: service.audit.createdBy,
        createdAt: service.audit.createdAt?.toISOString(),
        updatedBy: service.audit.updatedBy,
        updatedAt: service.audit.updatedAt?.toISOString(),
      } : undefined,
    };
  }

  async create(payload: CreateServiceDto, userRole: string, userId: string): Promise<ServiceDto> {
    // Set status based on user role: admin can set status, operator defaults to true
    const status = userRole === 'admin' ? (payload.status ?? false) : (payload.status ?? true);

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
      audit: saved.audit ? {
        createdBy: saved.audit.createdBy,
        createdAt: saved.audit.createdAt?.toISOString(),
        updatedBy: saved.audit.updatedBy,
        updatedAt: saved.audit.updatedAt?.toISOString(),
      } : undefined,
    };
  }

  async update(id: string, payload: UpdateServiceDto, userRole: string, userId: string): Promise<ServiceDto> {
    this.validateId(id);
    
    const existing = await this.serviceModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    if (userRole !== 'admin' && existing.audit?.createdBy !== userId) {
      throw new ForbiddenException('You can only modify your own resources');
    }

    const updateData: any = { ...payload, 'audit.updatedAt': new Date() };

    const updated = await this.serviceModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).exec();
    if (!updated) {
      throw new NotFoundException('Service not found');
    }
    return {
      id: updated._id.toString(),
      name: updated.name,
      description: updated.description,
      image: updated.image,
      status: updated.status,
      audit: updated.audit ? {
        createdBy: updated.audit.createdBy,
        createdAt: updated.audit.createdAt?.toISOString(),
        updatedBy: updated.audit.updatedBy,
        updatedAt: updated.audit.updatedAt?.toISOString(),
      } : undefined,
    };
  }

  async remove(id: string, userRole: string, userId: string): Promise<void> {
    this.validateId(id);
    const service = await this.serviceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (userRole !== 'admin' && service.audit?.createdBy !== userId) {
      throw new ForbiddenException('You can only delete your own resources');
    }

    const result = await this.serviceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Service not found');
    }
  }

  async toggleStatus(id: string, userRole: string, userId: string): Promise<ServiceDto> {
    this.validateId(id);
    const service = await this.serviceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (userRole !== 'admin' && service.audit?.createdBy !== userId) {
      throw new ForbiddenException('You can only modify your own resources');
    }

    service.status = !service.status;
    if (!service.audit) service.audit = {} as any;
    service.audit.updatedAt = new Date();
    await service.save();
    return {
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      image: service.image,
      status: service.status,
      audit: service.audit ? {
        createdBy: service.audit.createdBy,
        createdAt: service.audit.createdAt?.toISOString(),
        updatedBy: service.audit.updatedBy,
        updatedAt: service.audit.updatedAt?.toISOString(),
      } : undefined,
    };
  }

  private validateId(id: string): void {
    if (!uuidValidate(id) && !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
  }

  exportToCsv(services: ServiceDto[]): string {
    const fields = ['id', 'name', 'description', 'image', 'status'];
    const opts = {
      fields,
      transforms: [(field: { label: string }, value: unknown) => {
        const str = String(value ?? '');
        if (/^[=+\-@\t\r]/.test(str)) {
          return { [field.label]: "'" + str };
        }
        return { [field.label]: str };
      }],
    };
    const parser = new Parser(opts as any);
    return parser.parse(services);
  }

  exportToPdf(services: ServiceDto[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(24).text('Services Catalog', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Separator line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      services.forEach((service, index) => {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }

        doc.fontSize(16).font('Helvetica-Bold').text(`${index + 1}. ${service.name}`, { continued: false });
        doc.moveDown(0.5);

        doc.fontSize(12).font('Helvetica').text(`Description: ${service.description}`);
        doc.moveDown(0.3);
        doc.fontSize(12).text(`Status: ${service.status ? 'Active' : 'Inactive'}`);
        doc.moveDown(1);

        // Separator line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);
      });

      doc.end();
    });
  }
}
