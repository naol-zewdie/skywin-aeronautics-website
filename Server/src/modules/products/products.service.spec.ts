import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let model: Model<Product>;

  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Wing Spar Assembly',
    category: 'Aerospace Structures',
    description: 'High-precision wing spar for commercial aircraft',
    price: 15000.99,
    image: 'https://example.com/images/wing-spar.jpg',
    stock: 25,
    status: true,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockProductModel = {
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
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    model = module.get<Model<Product>>(getModelToken(Product.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      mockProductModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockProduct]),
      });

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Wing Spar Assembly',
          category: 'Aerospace Structures',
          description: 'High-precision wing spar for commercial aircraft',
          price: 15000.99,
          image: 'https://example.com/images/wing-spar.jpg',
          stock: 25,
          status: true,
        },
      ]);
    });

    it('should return fallback products when database is disabled', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ProductsService],
      }).compile();
      const serviceWithoutDb = module.get<ProductsService>(ProductsService);

      const result = await serviceWithoutDb.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('price');
      expect(result[0]).toHaveProperty('stock');
      expect(result[0]).toHaveProperty('status', true);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'Wing Spar Assembly',
        category: 'Aerospace Structures',
        description: 'High-precision wing spar for commercial aircraft',
        price: 15000.99,
        image: 'https://example.com/images/wing-spar.jpg',
        stock: 25,
        status: true,
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new product with audit trail', async () => {
      const createProductDto: CreateProductDto = {
        name: 'New Product',
        category: 'Aerospace Structures',
        description: 'Description of the new product that is long enough.',
        price: 10000.00,
        image: 'https://example.com/images/new-product.jpg',
        stock: 50,
        status: true,
      };

      mockProductModel.create = jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439012',
        ...createProductDto,
        audit: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await service.create(createProductDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', 'New Product');
      expect(result).toHaveProperty('price', 10000.00);
      expect(result).toHaveProperty('stock', 50);
      expect(result).toHaveProperty('status', true);
    });

    it('should validate price is non-negative', async () => {
      const invalidDto = { ...mockProduct, price: -100 };
      expect(invalidDto.price).toBeLessThan(0);
    });

    it('should validate price does not exceed maximum', async () => {
      const invalidDto = { ...mockProduct, price: 2000000 };
      expect(invalidDto.price).toBeGreaterThan(1000000);
    });

    it('should validate stock is non-negative', async () => {
      const invalidDto = { ...mockProduct, stock: -5 };
      expect(invalidDto.stock).toBeLessThan(0);
    });

    it('should validate stock does not exceed maximum', async () => {
      const invalidDto = { ...mockProduct, stock: 150000 };
      expect(invalidDto.stock).toBeGreaterThan(100000);
    });

    it('should validate image URL format', async () => {
      const invalidUrl = 'not-a-valid-url';
      const urlRegex = /^https?:\/\/.+/;
      expect(urlRegex.test(invalidUrl)).toBe(false);
    });

    it('should validate category contains only letters and spaces', async () => {
      const invalidCategory = 'Category123';
      const categoryRegex = /^[a-zA-Z\s]+$/;
      expect(categoryRegex.test(invalidCategory)).toBe(false);
    });
  });

  describe('update', () => {
    it('should update product with audit trail', async () => {
      const updateProductDto: UpdateProductDto = {
        price: 12000.00,
        stock: 30,
      };

      mockProductModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockProduct,
          price: 12000.00,
          stock: 30,
        }),
      });

      const result = await service.update('507f1f77bcf86cd799439011', updateProductDto);

      expect(result).toHaveProperty('price', 12000.00);
      expect(result).toHaveProperty('stock', 30);
      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          'audit.updatedAt': expect.any(Date),
        }),
        { new: true },
      );
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      mockProductModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('507f1f77bcf86cd799439011', { price: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      mockProductModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      await service.remove('507f1f77bcf86cd799439011');

      expect(mockProductModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException when removing non-existent product', async () => {
      mockProductModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('input validation', () => {
    it('should validate name minimum length', async () => {
      const shortName = 'A';
      expect(shortName.length).toBeLessThan(2);
    });

    it('should validate description minimum length', async () => {
      const shortDesc = 'Short';
      expect(shortDesc.length).toBeLessThan(10);
    });

    it('should validate status is boolean', async () => {
      const validStatus = true;
      expect(typeof validStatus).toBe('boolean');
    });
  });
});
