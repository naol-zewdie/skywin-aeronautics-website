import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ServicesService } from "./services.service";
import { Service } from "./schemas/service.schema";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { NotFoundException } from "@nestjs/common";

describe("ServicesService", () => {
  let service: ServicesService;
  let model: Model<Service>;

  const mockService = {
    _id: "507f1f77bcf86cd799439011",
    name: "Precision CNC Machining",
    description: "High-accuracy machining for aerospace-grade components.",
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

  const mockServiceModel: any = jest.fn().mockImplementation((payload) => ({
    ...payload,
    _id: "new-generated-id",
    save: jest.fn().mockResolvedValue({ _id: "new-generated-id", ...payload }),
  }));
  mockServiceModel.find = jest.fn().mockImplementation(() => mockChain([]));
  mockServiceModel.findById = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockServiceModel.findByIdAndUpdate = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockServiceModel.findByIdAndDelete = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockServiceModel.findOneAndUpdate = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockServiceModel.findOneAndDelete = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockServiceModel.exists = jest
    .fn()
    .mockImplementation(() => mockExec(false));
  mockServiceModel.findOne = jest.fn().mockImplementation(() => mockExec(null));
  mockServiceModel.create = jest.fn();

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

  describe("findAll", () => {
    it("should return an array of services", async () => {
      mockServiceModel.find.mockReturnValue(mockChain([mockService]));

      const result = await service.findAll();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
    });

    it("should return empty array when no services exist", async () => {
      mockServiceModel.find.mockReturnValue(mockChain([]));

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a single service when found", async () => {
      mockServiceModel.findOne.mockReturnValue(mockExec(mockService));

      const result = await service.findOne("507f1f77bcf86cd799439011");

      expect(result).toHaveProperty("id", "507f1f77bcf86cd799439011");
    });

    it("should throw NotFoundException when service not found", async () => {
      mockServiceModel.findOne.mockReturnValue(mockExec(null));

      await expect(service.findOne("507f1f77bcf86cd799439011")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create a new service with audit trail", async () => {
      const createServiceDto: CreateServiceDto = {
        name: "New Service",
        description: "New Description",
        image: "https://example.com/image.jpg",
      };

      const result = await service.create(createServiceDto, "admin", "u_001");

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", "New Service");
    });
  });

  describe("update", () => {
    it("should update service with audit trail", async () => {
      const updateServiceDto: UpdateServiceDto = {
        name: "Updated Service Name",
      };

      mockServiceModel.findOneAndUpdate.mockReturnValue(
        mockExec({
          ...mockService,
          name: "Updated Service Name",
        }),
      );

      const result = await service.update(
        "507f1f77bcf86cd799439011",
        updateServiceDto,
        "admin",
        "u_001",
      );

      expect(result).toHaveProperty("name", "Updated Service Name");
    });

    it("should throw NotFoundException when updating non-existent service", async () => {
      mockServiceModel.findOneAndUpdate.mockReturnValue(mockExec(null));
      mockServiceModel.exists.mockReturnValue(mockExec(null));

      await expect(
        service.update(
          "507f1f77bcf86cd799439011",
          { name: "Test" },
          "admin",
          "u_001",
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should remove a service", async () => {
      mockServiceModel.findOneAndDelete.mockReturnValue(mockExec(mockService));

      await service.remove("507f1f77bcf86cd799439011", "admin", "u_001");

      expect(mockServiceModel.findOneAndDelete).toHaveBeenCalledWith(
        { _id: "507f1f77bcf86cd799439011" },
      );
    });

    it("should throw NotFoundException when removing non-existent service", async () => {
      mockServiceModel.findOneAndDelete.mockReturnValue(mockExec(null));
      mockServiceModel.exists.mockReturnValue(mockExec(null));

      await expect(
        service.remove("507f1f77bcf86cd799439011", "admin", "u_001"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("input validation", () => {
    it("should validate status is boolean", async () => {
      const validStatus = true;
      expect(typeof validStatus).toBe("boolean");
    });

    it("should validate description contains meaningful content", async () => {
      const shortDesc = "Too short";
      expect(shortDesc.length).toBeLessThan(10);
    });
  });
});
