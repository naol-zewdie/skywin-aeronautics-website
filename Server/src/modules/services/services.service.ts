import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceEntity } from './entities/service.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ServicesService {
  private readonly fallbackServices: ServiceDto[] = [
    {
      id: 's_001',
      name: 'Precision CNC Machining',
      description: 'High-accuracy machining for aerospace-grade components.',
    },
    {
      id: 's_002',
      name: 'Composite Fabrication',
      description: 'Lightweight, high-strength composite structure production.',
    },
  ];

  constructor(
    @Optional()
    @InjectRepository(ServiceEntity)
    private readonly servicesRepository?: Repository<ServiceEntity>,
  ) {}

  async findAll(): Promise<ServiceDto[]> {
    if (!this.servicesRepository) {
      return this.fallbackServices;
    }

    return this.servicesRepository.find();
  }

  async findOne(id: string): Promise<ServiceDto> {
    if (!this.servicesRepository) {
      const service = this.fallbackServices.find((item) => item.id === id);
      if (!service) {
        throw new NotFoundException(`Service with id ${id} not found`);
      }
      return service;
    }

    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return service;
  }

  async create(payload: CreateServiceDto): Promise<ServiceDto> {
    if (!this.servicesRepository) {
      const created: ServiceDto = { id: randomUUID(), ...payload };
      this.fallbackServices.push(created);
      return created;
    }

    const created = this.servicesRepository.create(payload);
    return this.servicesRepository.save(created);
  }

  async update(id: string, payload: UpdateServiceDto): Promise<ServiceDto> {
    if (!this.servicesRepository) {
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

    const service = await this.findOne(id);
    const merged = this.servicesRepository.merge(service, payload);
    return this.servicesRepository.save(merged);
  }

  async remove(id: string): Promise<void> {
    if (!this.servicesRepository) {
      const index = this.fallbackServices.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`Service with id ${id} not found`);
      }
      this.fallbackServices.splice(index, 1);
      return;
    }

    const result = await this.servicesRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
  }
}
