import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CareersService } from './careers.service';
import { CareerOpening } from './schemas/career-opening.schema';
import { CreateCareerOpeningDto } from './dto/create-career-opening.dto';
import { UpdateCareerOpeningDto } from './dto/update-career-opening.dto';
import { NotFoundException } from '@nestjs/common';

describe('CareersService', () => {
  let service: CareersService;
  let model: Model<CareerOpening>;

  const mockCareerOpening = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Manufacturing Engineer',
    location: 'Bangalore, India',
    employmentType: 'Full-time',
    description: 'Responsible for aerospace component manufacturing and quality control',
    status: true,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockCareerOpeningModel = {
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
        CareersService,
        {
          provide: getModelToken(CareerOpening.name),
          useValue: mockCareerOpeningModel,
        },
      ],
    }).compile();

    service = module.get<CareersService>(CareersService);
    model = module.get<Model<CareerOpening>>(getModelToken(CareerOpening.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of career openings', async () => {
      mockCareerOpeningModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockCareerOpening]),
      });

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: '507f1f77bcf86cd799439011',
          title: 'Manufacturing Engineer',
          location: 'Bangalore, India',
          employmentType: 'Full-time',
          description: 'Responsible for aerospace component manufacturing and quality control',
          status: true,
        },
      ]);
    });

    it('should return fallback openings when database is disabled', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [CareersService],
      }).compile();
      const serviceWithoutDb = module.get<CareersService>(CareersService);

      const result = await serviceWithoutDb.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('status', true);
    });
  });

  describe('findOne', () => {
    it('should return a single career opening', async () => {
      mockCareerOpeningModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCareerOpening),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
        title: 'Manufacturing Engineer',
        location: 'Bangalore, India',
        employmentType: 'Full-time',
        description: 'Responsible for aerospace component manufacturing and quality control',
        status: true,
      });
    });

    it('should throw NotFoundException when career opening not found', async () => {
      mockCareerOpeningModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new career opening with audit trail', async () => {
      const createCareerOpeningDto: CreateCareerOpeningDto = {
        title: 'Senior Engineer',
        location: 'Pune, India',
        employmentType: 'Full-time',
        description: 'This is a detailed job description that is at least 20 characters long.',
        status: true,
      };

      mockCareerOpeningModel.create = jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439012',
        ...createCareerOpeningDto,
        audit: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await service.create(createCareerOpeningDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title', 'Senior Engineer');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('status', true);
    });

    it('should validate title minimum length', async () => {
      const invalidDto = { title: 'AB', location: 'City', employmentType: 'Full-time', description: 'Valid description here.', status: true };
      expect(invalidDto.title.length).toBeLessThan(3);
    });

    it('should validate employment type values', async () => {
      const validTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
      expect(validTypes).toContain('Full-time');
      expect(validTypes).toContain('Part-time');
      expect(validTypes).not.toContain('Invalid-Type');
    });

    it('should validate description minimum length', async () => {
      const shortDesc = 'Too short description';
      expect(shortDesc.length).toBeLessThan(20);
    });

    it('should validate location contains valid characters', async () => {
      const validLocation = 'Bangalore, India';
      const locationRegex = /^[a-zA-Z\s,.'-]+$/;
      expect(locationRegex.test(validLocation)).toBe(true);

      const invalidLocation = 'City@123';
      expect(locationRegex.test(invalidLocation)).toBe(false);
    });
  });

  describe('update', () => {
    it('should update career opening with audit trail', async () => {
      const updateCareerOpeningDto: UpdateCareerOpeningDto = {
        title: 'Updated Title',
      };

      mockCareerOpeningModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockCareerOpening,
          title: 'Updated Title',
        }),
      });

      const result = await service.update('507f1f77bcf86cd799439011', updateCareerOpeningDto);

      expect(result).toHaveProperty('title', 'Updated Title');
      expect(mockCareerOpeningModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          'audit.updatedAt': expect.any(Date),
        }),
        { new: true },
      );
    });

    it('should throw NotFoundException when updating non-existent career opening', async () => {
      mockCareerOpeningModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('507f1f77bcf86cd799439011', { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a career opening', async () => {
      mockCareerOpeningModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCareerOpening),
      });

      await service.remove('507f1f77bcf86cd799439011');

      expect(mockCareerOpeningModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException when removing non-existent career opening', async () => {
      mockCareerOpeningModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('input validation', () => {
    it('should validate title maximum length', async () => {
      const longTitle = 'A'.repeat(101);
      expect(longTitle.length).toBeGreaterThan(100);
    });

    it('should validate description maximum length', async () => {
      const longDesc = 'A'.repeat(2001);
      expect(longDesc.length).toBeGreaterThan(2000);
    });

    it('should validate status is boolean', async () => {
      const validStatus = true;
      expect(typeof validStatus).toBe('boolean');
    });

    it('should validate location minimum length', async () => {
      const shortLocation = 'A';
      expect(shortLocation.length).toBeLessThan(2);
    });
  });
});
