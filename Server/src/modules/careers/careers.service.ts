import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
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
}
