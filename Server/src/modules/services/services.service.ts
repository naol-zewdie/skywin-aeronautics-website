import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Parser } from '@json2csv/plainjs';
import PDFDocument from 'pdfkit';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './schemas/service.schema';

@Injectable()
export class ServicesService {
  private readonly fallbackServices: ServiceDto[] = [
    {
      id: 's_001',
      name: 'Precision CNC Machining',
      description: 'High-accuracy machining for aerospace-grade components.',
      status: true,
    },
    {
      id: 's_002',
      name: 'Composite Fabrication',
      description: 'Lightweight, high-strength composite structure production.',
      status: true,
    },
  ];

  constructor(
    @Optional()
    @InjectModel(Service.name)
    private readonly serviceModel?: Model<Service>,
  ) {}

  async findAll(): Promise<ServiceDto[]> {
    if (!this.serviceModel) {
      return this.fallbackServices;
    }

    const services = await this.serviceModel.find().exec();
    return services.map(service => ({
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      status: service.status,
    }));
  }

  async findOne(id: string): Promise<ServiceDto> {
    if (!this.serviceModel) {
      const service = this.fallbackServices.find((item) => item.id === id);
      if (!service) {
        throw new NotFoundException(`Service with id ${id} not found`);
      }
      return service;
    }

    const service = await this.serviceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return {
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      status: service.status,
    };
  }

  async create(payload: CreateServiceDto): Promise<ServiceDto> {
    if (!this.serviceModel) {
      const created: ServiceDto = { id: randomUUID(), status: true, ...payload };
      this.fallbackServices.push(created);
      return created;
    }

    const created = new this.serviceModel({
      ...payload,
      audit: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const saved = await created.save();
    return {
      id: saved._id.toString(),
      name: saved.name,
      description: saved.description,
      status: saved.status,
    };
  }

  async update(id: string, payload: UpdateServiceDto): Promise<ServiceDto> {
    if (!this.serviceModel) {
      const index = this.fallbackServices.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`Service with id ${id} not found`);
      }

      this.fallbackServices[index] = {
        ...this.fallbackServices[index],
        ...payload,
      };
      return this.fallbackServices[index];
    }

    const updated = await this.serviceModel.findByIdAndUpdate(
      id,
      {
        ...payload,
        'audit.updatedAt': new Date(),
      },
      { new: true }
    ).exec();
    if (!updated) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return {
      id: updated._id.toString(),
      name: updated.name,
      description: updated.description,
      status: updated.status,
    };
  }

  async remove(id: string): Promise<void> {
    if (!this.serviceModel) {
      const index = this.fallbackServices.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`Service with id ${id} not found`);
      }
      this.fallbackServices.splice(index, 1);
      return;
    }

    const result = await this.serviceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
  }

  exportToCsv(services: ServiceDto[]): string {
    const fields = ['id', 'name', 'description', 'status'];
    const opts = { fields };
    const parser = new Parser(opts);
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
