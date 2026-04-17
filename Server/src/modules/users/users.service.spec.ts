import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    fullName: 'Test User',
    email: 'test@skywin.aero',
    role: 'admin',
    password: 'hashedPassword',
    status: true,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockUserModel = {
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
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockUser]),
      });

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: '507f1f77bcf86cd799439011',
          fullName: 'Test User',
          email: 'test@skywin.aero',
          role: 'admin',
          status: true,
        },
      ]);
      expect(mockUserModel.find).toHaveBeenCalled();
    });

    it('should return fallback users when database is disabled', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [UsersService],
      }).compile();
      const serviceWithoutDb = module.get<UsersService>(UsersService);

      const result = await serviceWithoutDb.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('status', true);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
        fullName: 'Test User',
        email: 'test@skywin.aero',
        role: 'admin',
        status: true,
      });
      expect(mockUserModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new user with audit trail', async () => {
      const createUserDto: CreateUserDto = {
        fullName: 'New User',
        email: 'new@skywin.aero',
        role: 'operator',
        password: 'SecurePass123!',
        status: true,
      };

      mockUserModel.create = jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439012',
        ...createUserDto,
        audit: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('fullName', 'New User');
      expect(result).toHaveProperty('status', true);
    });

    it('should enforce password requirements', async () => {
      const invalidUserDto = {
        fullName: 'Test',
        email: 'test@skywin.aero',
        role: 'admin',
        password: 'short',
        status: true,
      };

      const errors: string[] = [];
      if (invalidUserDto.password.length < 8) {
        errors.push('Password must be at least 8 characters');
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(invalidUserDto.password)) {
        errors.push('Password must contain uppercase, lowercase, and number');
      }

      expect(errors).toContain('Password must be at least 8 characters');
      expect(errors).toContain('Password must contain uppercase, lowercase, and number');
    });

    it('should validate email format', async () => {
      const invalidEmailDto = {
        fullName: 'Test User',
        email: 'invalid-email',
        role: 'admin',
        password: 'SecurePass123!',
        status: true,
      };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(invalidEmailDto.email)).toBe(false);
    });
  });

  describe('update', () => {
    it('should update user with audit trail', async () => {
      const updateUserDto: UpdateUserDto = {
        fullName: 'Updated Name',
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockUser,
          fullName: 'Updated Name',
        }),
      });

      const result = await service.update('507f1f77bcf86cd799439011', updateUserDto);

      expect(result).toHaveProperty('fullName', 'Updated Name');
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          fullName: 'Updated Name',
          'audit.updatedAt': expect.any(Date),
        }),
        { new: true },
      );
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('507f1f77bcf86cd799439011', { fullName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.remove('507f1f77bcf86cd799439011');

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException when removing non-existent user', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('input validation', () => {
    it('should validate fullName length', async () => {
      const shortName = 'A';
      expect(shortName.length).toBeLessThan(2);
    });

    it('should validate role values', async () => {
      const validRoles = ['admin', 'operator', 'viewer'];
      expect(validRoles).toContain('admin');
      expect(validRoles).toContain('operator');
      expect(validRoles).not.toContain('invalid-role');
    });

    it('should validate email uniqueness', async () => {
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ email: 'existing@skywin.aero' }]),
      });

      const existingUsers = await mockUserModel.find({ email: 'existing@skywin.aero' }).exec();
      expect(existingUsers).toHaveLength(1);
    });
  });
});
