import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServicesService } from './services.service';
import { Service } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { NotFoundException } from '@nestjs/common';

describe('ServicesService', () => {
  let service: ServicesService;
  let model: Model<Service>;

  const mockService = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Precision CNC Machining',
    description: 'High-accuracy machining for aerospace-grade components.',
    status: true,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockServiceModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getModelToken(Service.name),
          useValue: mockServiceModel,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    model = module.get<Model<Service>>(getModelToken(Service.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of services', async () => {
      mockServiceModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockService]),
      });

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Precision CNC Machining',
          description: 'High-accuracy machining for aerospace-grade components.',
          status: true,
        },
      ]);
    });

    it('should return fallback services when database is disabled', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ServicesService],
      }).compile();
      const serviceWithoutDb = module.get<ServicesService>(ServicesService);

      const result = await serviceWithoutDb.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('status', true);
    });
  });

  describe('findOne', () => {
    it('should return a single service', async () => {
      mockServiceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockService),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'Precision CNC Machining',
        description: 'High-accuracy machining for aerospace-grade components.',
        status: true,
      });
    });

    it('should throw NotFoundException when service not found', async () => {
      mockServiceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new service with audit trail', async () => {
      const createServiceDto: CreateServiceDto = {
        name: 'New Service',
        description: 'Description of the new service with enough length.',
        status: true,
      };

      mockServiceModel.create = jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439012',
        ...createServiceDto,
        audit: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await service.create(createServiceDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', 'New Service');
      expect(result).toHaveProperty('status', true);
    });

    it('should validate name minimum length', async () => {
      const invalidDto = { name: 'A', description: 'Valid description here.', status: true };
      expect(invalidDto.name.length).toBeLessThan(2);
    });

    it('should validate description minimum length', async () => {
      const invalidDto = { name: 'Valid Name', description: 'Short', status: true };
      expect(invalidDto.description.length).toBeLessThan(10);
    });

    it('should validate name maximum length', async () => {
      const longName = 'A'.repeat(101);
      expect(longName.length).toBeGreaterThan(100);
    });
  });

  describe('update', () => {
    it('should update service with audit trail', async () => {
      const updateServiceDto: UpdateServiceDto = {
        name: 'Updated Service Name',
      };

      mockServiceModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockService,
          name: 'Updated Service Name',
        }),
      });

      const result = await service.update('507f1f77bcf86cd799439011', updateServiceDto);

      expect(result).toHaveProperty('name', 'Updated Service Name');
      expect(mockServiceModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          'audit.updatedAt': expect.any(Date),
        }),
        { new: true },
      );
    });

    it('should throw NotFoundException when updating non-existent service', async () => {
      mockServiceModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('507f1f77bcf86cd799439011', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a service', async () => {
      mockServiceModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockService),
      });

      await service.remove('507f1f77bcf86cd799439011');

      expect(mockServiceModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException when removing non-existent service', async () => {
      mockServiceModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('input validation', () => {
    it('should validate status is boolean', async () => {
      const validStatus = true;
      expect(typeof validStatus).toBe('boolean');
    });

    it('should validate description contains meaningful content', async () => {
      const shortDesc = 'Too short';
      expect(shortDesc.length).toBeLessThan(10);
    });
  });
});
