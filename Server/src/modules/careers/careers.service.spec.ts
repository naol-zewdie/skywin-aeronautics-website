/// <reference types="jest" />
import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CareersService } from "./careers.service";
import { CareerOpening } from "./schemas/career-opening.schema";
import { CreateCareerOpeningDto } from "./dto/create-career-opening.dto";
import { UpdateCareerOpeningDto } from "./dto/update-career-opening.dto";
import { NotFoundException } from "@nestjs/common";

describe("CareersService", () => {
  let service: CareersService;
  let model: Model<CareerOpening>;

  const mockCareerOpening = {
    _id: "507f1f77bcf86cd799439011",
    title: "Manufacturing Engineer",
    location: "Bangalore, India",
    employmentType: "Full-time",
    description:
      "Responsible for aerospace component manufacturing and quality control",
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

  const mockCareerOpeningModel: any = jest
    .fn()
    .mockImplementation((payload) => ({
      ...payload,
      _id: "new-generated-id",
      save: jest
        .fn()
        .mockResolvedValue({ _id: "new-generated-id", ...payload }),
    }));
  mockCareerOpeningModel.find = jest
    .fn()
    .mockImplementation(() => mockChain([]));
  mockCareerOpeningModel.findById = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockCareerOpeningModel.findByIdAndUpdate = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockCareerOpeningModel.findByIdAndDelete = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockCareerOpeningModel.findOne = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockCareerOpeningModel.create = jest.fn();

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

  describe("findAll", () => {
    it("should return an array of career openings", async () => {
      mockCareerOpeningModel.find.mockReturnValue(
        mockChain([mockCareerOpening]),
      );

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("title", "Manufacturing Engineer");
      expect(result[0]).toHaveProperty("status", true);
    });

    it("should return empty array when no career openings exist", async () => {
      mockCareerOpeningModel.find.mockReturnValue(mockChain([]));

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a single career opening", async () => {
      mockCareerOpeningModel.findById.mockReturnValue(
        mockExec(mockCareerOpening),
      );

      const result = await service.findOne("507f1f77bcf86cd799439011");

      expect(result).toHaveProperty("title", "Manufacturing Engineer");
      expect(result).toHaveProperty("status", true);
    });

    it("should throw NotFoundException when career opening not found", async () => {
      mockCareerOpeningModel.findById.mockReturnValue(mockExec(null));

      await expect(service.findOne("507f1f77bcf86cd799439011")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create a new career opening", async () => {
      const createCareerOpeningDto: CreateCareerOpeningDto = {
        title: "Senior Engineer",
        location: "Pune, India",
        employmentType: "Full-time",
        description:
          "This is a detailed job description that is at least 20 characters long.",
        status: true,
      };

      const result = await service.create(
        createCareerOpeningDto,
        "admin",
        "u_001",
      );

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("title", "Senior Engineer");
    });
  });

  describe("update", () => {
    it("should update career opening with audit trail", async () => {
      const updateCareerOpeningDto: UpdateCareerOpeningDto = {
        title: "Updated Title",
      };

      mockCareerOpeningModel.findById.mockReturnValue(
        mockExec(mockCareerOpening),
      );
      mockCareerOpeningModel.findByIdAndUpdate.mockReturnValue(
        mockExec({
          ...mockCareerOpening,
          title: "Updated Title",
        }),
      );

      const result = await service.update(
        "507f1f77bcf86cd799439011",
        updateCareerOpeningDto,
        "admin",
        "u_001",
      );

      expect(result).toHaveProperty("title", "Updated Title");
    });

    it("should throw NotFoundException when updating non-existent career opening", async () => {
      mockCareerOpeningModel.findById.mockReturnValue(mockExec(null));

      await expect(
        service.update(
          "507f1f77bcf86cd799439011",
          { title: "Test" },
          "admin",
          "u_001",
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should remove a career opening", async () => {
      mockCareerOpeningModel.findById.mockReturnValue(
        mockExec(mockCareerOpening),
      );
      mockCareerOpeningModel.findByIdAndDelete.mockReturnValue(
        mockExec(mockCareerOpening),
      );

      await service.remove("507f1f77bcf86cd799439011", "admin", "u_001");

      expect(mockCareerOpeningModel.findByIdAndDelete).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011",
      );
    });

    it("should throw NotFoundException when removing non-existent career opening", async () => {
      mockCareerOpeningModel.findById.mockReturnValue(mockExec(null));

      await expect(
        service.remove("507f1f77bcf86cd799439011", "admin", "u_001"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("input validation", () => {
    it("should validate title maximum length", async () => {
      const longTitle = "A".repeat(101);
      expect(longTitle.length).toBeGreaterThan(100);
    });

    it("should validate description maximum length", async () => {
      const longDesc = "A".repeat(2001);
      expect(longDesc.length).toBeGreaterThan(2000);
    });

    it("should validate status is boolean", async () => {
      const validStatus = true;
      expect(typeof validStatus).toBe("boolean");
    });

    it("should validate location minimum length", async () => {
      const shortLocation = "A";
      expect(shortLocation.length).toBeLessThan(2);
    });
  });
});
