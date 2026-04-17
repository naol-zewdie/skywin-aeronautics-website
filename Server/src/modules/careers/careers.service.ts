import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { CreateCareerOpeningDto } from './dto/create-career-opening.dto';
import { CareerOpeningDto } from './dto/career-opening.dto';
import { UpdateCareerOpeningDto } from './dto/update-career-opening.dto';
import { CareerOpeningEntity } from './entities/career-opening.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CareersService {
  private readonly fallbackOpenings: CareerOpeningDto[] = [
    {
      id: 'c_001',
      title: 'Manufacturing Engineer',
      location: 'Bangalore, India',
      employmentType: 'Full-time',
    },
    {
      id: 'c_002',
      title: 'Quality Assurance Specialist',
      location: 'Pune, India',
      employmentType: 'Full-time',
    },
  ];

  constructor(
    @Optional()
    @InjectRepository(CareerOpeningEntity)
    private readonly careersRepository?: Repository<CareerOpeningEntity>,
  ) {}

  async findAll(): Promise<CareerOpeningDto[]> {
    if (!this.careersRepository) {
      return this.fallbackOpenings;
    }

    return this.careersRepository.find();
  }

  async findOne(id: string): Promise<CareerOpeningDto> {
    if (!this.careersRepository) {
      const opening = this.fallbackOpenings.find((item) => item.id === id);
      if (!opening) {
        throw new NotFoundException(`Career opening with id ${id} not found`);
      }
      return opening;
    }

    const opening = await this.careersRepository.findOne({ where: { id } });
    if (!opening) {
      throw new NotFoundException(`Career opening with id ${id} not found`);
    }
    return opening;
  }

  async create(payload: CreateCareerOpeningDto): Promise<CareerOpeningDto> {
    if (!this.careersRepository) {
      const created: CareerOpeningDto = { id: randomUUID(), ...payload };
      this.fallbackOpenings.push(created);
      return created;
    }

    const created = this.careersRepository.create(payload);
    return this.careersRepository.save(created);
  }

  async update(
    id: string,
    payload: UpdateCareerOpeningDto,
  ): Promise<CareerOpeningDto> {
    if (!this.careersRepository) {
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

    const opening = await this.findOne(id);
    const merged = this.careersRepository.merge(opening, payload);
    return this.careersRepository.save(merged);
  }

  async remove(id: string): Promise<void> {
    if (!this.careersRepository) {
      const index = this.fallbackOpenings.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`Career opening with id ${id} not found`);
      }
      this.fallbackOpenings.splice(index, 1);
      return;
    }

    const result = await this.careersRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Career opening with id ${id} not found`);
    }
  }
}
