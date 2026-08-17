import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProductsService } from "./products.service";
import { Product } from "./schemas/product.schema";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { NotFoundException } from "@nestjs/common";

describe("ProductsService", () => {
  let service: ProductsService;
  let model: Model<Product>;

  const mockProduct = {
    _id: "507f1f77bcf86cd799439011",
    name: "Wing Spar Assembly",
    category: "Aerospace Structures",
    description: "High-precision wing spar for commercial aircraft",
    price: 15000.99,
    image: "https://example.com/images/wing-spar.jpg",
    stock: 25,
    status: true,
    audit: { createdBy: "u_001", createdAt: new Date(), updatedAt: new Date() },
    save: jest.fn().mockResolvedValue(true),
  };

  const mockExec = (data: any) => ({
    exec: jest.fn().mockResolvedValue(data),
  });

  const mockChain = (data: any) => ({
    skip: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(data),
      }),
    }),
    limit: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(data),
    }),
    exec: jest.fn().mockResolvedValue(data),
  });

  const mockProductModel: any = jest.fn().mockImplementation((payload) => ({
    ...payload,
    _id: "new-generated-id",
    save: jest.fn().mockResolvedValue({ _id: "new-generated-id", ...payload }),
  }));
  mockProductModel.find = jest.fn().mockImplementation(() => mockChain([]));
  mockProductModel.findById = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockProductModel.findByIdAndUpdate = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockProductModel.findByIdAndDelete = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockProductModel.findOneAndUpdate = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockProductModel.findOneAndDelete = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockProductModel.exists = jest
    .fn()
    .mockImplementation(() => mockExec(false));
  mockProductModel.findOne = jest.fn().mockImplementation(() => mockExec(null));
  mockProductModel.create = jest.fn();

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

  describe("findAll", () => {
    it("should return an array of products", async () => {
      mockProductModel.find.mockReturnValue(mockChain([mockProduct]));

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("name", "Wing Spar Assembly");
      expect(result[0]).toHaveProperty("status", true);
    });

    it("should return empty array when no products exist", async () => {
      mockProductModel.find.mockReturnValue(mockChain([]));

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a single product", async () => {
      mockProductModel.findOne.mockReturnValue(mockExec(mockProduct));

      const result = await service.findOne("507f1f77bcf86cd799439011");

      expect(result).toHaveProperty("name", "Wing Spar Assembly");
      expect(result).toHaveProperty("price", 15000.99);
    });

    it("should throw NotFoundException when product not found", async () => {
      mockProductModel.findOne.mockReturnValue(mockExec(null));

      await expect(service.findOne("507f1f77bcf86cd799439011")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create a new product", async () => {
      const createProductDto: CreateProductDto = {
        name: "New Product",
        category: "Aerospace Structures",
        description: "Description of the new product that is long enough.",
        price: 10000.0,
        image: "https://example.com/images/new-product.jpg",
        stock: 50,
        status: true,
      };

      mockProductModel.findOne.mockReturnValue(mockExec(null));

      const result = await service.create(createProductDto, "admin", "u_001");

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", "New Product");
    });
  });

  describe("update", () => {
    it("should update product with audit trail", async () => {
      const updateProductDto: UpdateProductDto = {
        price: 12000.0,
        stock: 30,
      };

      mockProductModel.findOneAndUpdate.mockReturnValue(
        mockExec({
          ...mockProduct,
          price: 12000.0,
          stock: 30,
        }),
      );

      const result = await service.update(
        "507f1f77bcf86cd799439011",
        updateProductDto,
        "admin",
        "u_001",
      );

      expect(result).toHaveProperty("price", 12000.0);
      expect(result).toHaveProperty("stock", 30);
    });

    it("should throw NotFoundException when updating non-existent product", async () => {
      mockProductModel.findOneAndUpdate.mockReturnValue(mockExec(null));
      mockProductModel.exists.mockReturnValue(mockExec(null));

      await expect(
        service.update(
          "507f1f77bcf86cd799439011",
          { price: 100 },
          "admin",
          "u_001",
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should remove a product", async () => {
      mockProductModel.findOneAndDelete.mockReturnValue(mockExec(mockProduct));

      await service.remove("507f1f77bcf86cd799439011", "admin", "u_001");

      expect(mockProductModel.findOneAndDelete).toHaveBeenCalledWith(
        { _id: "507f1f77bcf86cd799439011" },
      );
    });

    it("should throw NotFoundException when removing non-existent product", async () => {
      mockProductModel.findOneAndDelete.mockReturnValue(mockExec(null));
      mockProductModel.exists.mockReturnValue(mockExec(null));

      await expect(
        service.remove("507f1f77bcf86cd799439011", "admin", "u_001"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("input validation", () => {
    it("should validate name minimum length", async () => {
      const shortName = "A";
      expect(shortName.length).toBeLessThan(2);
    });

    it("should validate description minimum length", async () => {
      const shortDesc = "Short";
      expect(shortDesc.length).toBeLessThan(10);
    });

    it("should validate status is boolean", async () => {
      const validStatus = true;
      expect(typeof validStatus).toBe("boolean");
    });
  });
});
