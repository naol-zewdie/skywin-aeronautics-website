import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Parser } from '@json2csv/plainjs';
import PDFDocument from 'pdfkit';
import { CreateCareerOpeningDto } from './dto/create-career-opening.dto';
import { CareerOpeningDto } from './dto/career-opening.dto';
import { UpdateCareerOpeningDto } from './dto/update-career-opening.dto';
import { CareerOpening } from './schemas/career-opening.schema';

@Injectable()
export class CareersService {
  private readonly fallbackOpenings: CareerOpeningDto[] = [
    {
      id: 'c_001',
      title: 'Manufacturing Engineer',
      location: 'Bangalore, India',
      employmentType: 'Full-time',
      description: 'Responsible for aerospace component manufacturing and quality control',
      status: true,
    },
    {
      id: 'c_002',
      title: 'Quality Assurance Specialist',
      location: 'Pune, India',
      employmentType: 'Full-time',
      description: 'Ensure compliance with aerospace quality standards',
      status: true,
    },
  ];

  constructor(
    @Optional()
    @InjectModel(CareerOpening.name)
    private readonly careerOpeningModel?: Model<CareerOpening>,
  ) {}

  async findAll(): Promise<CareerOpeningDto[]> {
    if (!this.careerOpeningModel) {
      return this.fallbackOpenings;
    }

    const openings = await this.careerOpeningModel.find().exec();
    return openings.map(opening => ({
      id: opening._id.toString(),
      title: opening.title,
      location: opening.location,
      employmentType: opening.employmentType,
      description: opening.description,
      status: opening.status,
    }));
  }

  async findOne(id: string): Promise<CareerOpeningDto> {
    if (!this.careerOpeningModel) {
      const opening = this.fallbackOpenings.find((item) => item.id === id);
      if (!opening) {
        throw new NotFoundException(`Career opening with id ${id} not found`);
      }
      return opening;
    }

    const opening = await this.careerOpeningModel.findById(id).exec();
    if (!opening) {
      throw new NotFoundException(`Career opening with id ${id} not found`);
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

  async create(payload: CreateCareerOpeningDto): Promise<CareerOpeningDto> {
    if (!this.careerOpeningModel) {
      const created: CareerOpeningDto = { id: randomUUID(), status: true, ...payload };
      this.fallbackOpenings.push(created);
      return created;
    }

    const created = new this.careerOpeningModel({
      ...payload,
      audit: {
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
  ): Promise<CareerOpeningDto> {
    if (!this.careerOpeningModel) {
      const index = this.fallbackOpenings.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`Career opening with id ${id} not found`);
      }

      this.fallbackOpenings[index] = {
        ...this.fallbackOpenings[index],
        ...payload,
      };
      return this.fallbackOpenings[index];
    }

    const updated = await this.careerOpeningModel.findByIdAndUpdate(
      id,
      {
        ...payload,
        'audit.updatedAt': new Date(),
      },
      { new: true }
    ).exec();
    if (!updated) {
      throw new NotFoundException(`Career opening with id ${id} not found`);
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

  async remove(id: string): Promise<void> {
    if (!this.careerOpeningModel) {
      const index = this.fallbackOpenings.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`Career opening with id ${id} not found`);
      }
      this.fallbackOpenings.splice(index, 1);
      return;
    }

    const result = await this.careerOpeningModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Career opening with id ${id} not found`);
    }
  }

  exportToCsv(openings: CareerOpeningDto[]): string {
    const fields = ['id', 'title', 'location', 'employmentType', 'description', 'status'];
    const opts = { fields };
    const parser = new Parser(opts);
    return parser.parse(openings);
  }

  exportToPdf(openings: CareerOpeningDto[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(24).text('Career Openings', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Separator line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      openings.forEach((opening, index) => {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }

        doc.fontSize(16).font('Helvetica-Bold').text(`${index + 1}. ${opening.title}`, { continued: false });
        doc.moveDown(0.5);
        
        doc.fontSize(12).font('Helvetica').text(`Location: ${opening.location}`);
        doc.moveDown(0.3);
        doc.fontSize(12).text(`Employment Type: ${opening.employmentType}`);
        doc.moveDown(0.3);
        doc.fontSize(12).text(`Description: ${opening.description}`);
        doc.moveDown(0.3);
        doc.fontSize(12).text(`Status: ${opening.status ? 'Active' : 'Inactive'}`);
        doc.moveDown(1);

        // Separator line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);
      });

      doc.end();
    });
  }
}
