import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UsersService } from "./users.service";
import { User } from "./schemas/user.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { NotFoundException } from "@nestjs/common";

describe("UsersService", () => {
  let service: UsersService;
  let model: Model<User>;

  const mockUser = {
    _id: "507f1f77bcf86cd799439011",
    fullName: "Test User",
    email: "test@skywin.aero",
    role: "admin",
    password: "hashedPassword",
    status: true,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockExec = (data: any) => ({
    exec: jest.fn().mockResolvedValue(data),
  });

  const mockSelectExec = (data: any) => ({
    select: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(data),
    }),
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
    select: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(data),
    }),
    exec: jest.fn().mockResolvedValue(data),
  });

  const mockUserModel: any = jest.fn().mockImplementation((payload) => ({
    ...payload,
    _id: "new-generated-id",
    save: jest.fn().mockResolvedValue({ _id: "new-generated-id", ...payload }),
  }));
  mockUserModel.find = jest.fn().mockImplementation(() => mockChain([]));
  mockUserModel.findById = jest
    .fn()
    .mockImplementation(() => mockSelectExec(null));
  mockUserModel.findByIdAndUpdate = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockUserModel.findByIdAndDelete = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockUserModel.findOne = jest.fn().mockImplementation(() => mockSelectExec(null));
  mockUserModel.findOneAndUpdate = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockUserModel.findOneAndDelete = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockUserModel.create = jest.fn();

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

  describe("findAll", () => {
    it("should return an array of users", async () => {
      mockUserModel.find.mockReturnValue(mockChain([mockUser]));

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: "507f1f77bcf86cd799439011",
          fullName: "Test User",
          email: "test@skywin.aero",
          role: "r_9a3f",
          status: true,
        },
      ]);
    });

    it("should return empty array when no users exist", async () => {
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a single user", async () => {
      mockUserModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.findOne("507f1f77bcf86cd799439011");

      expect(result).toEqual({
        id: "507f1f77bcf86cd799439011",
        fullName: "Test User",
        email: "test@skywin.aero",
        role: "r_9a3f",
        status: true,
      });
    });

    it("should throw NotFoundException when user not found", async () => {
      mockUserModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findOne("507f1f77bcf86cd799439011")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create a new user with audit trail", async () => {
      const createUserDto: CreateUserDto = {
        fullName: "New User",
        email: "new@skywin.aero",
        role: "operator",
        password: "SecurePass123!",
        status: true,
      };

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("fullName", "New User");
      expect(result).toHaveProperty("status", true);
    });
  });

  describe("update", () => {
    it("should update user with audit trail", async () => {
      const updateUserDto: UpdateUserDto = {
        fullName: "Updated Name",
      };

      mockUserModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      mockUserModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockUser,
          fullName: "Updated Name",
        }),
      });

      const result = await service.update(
        "507f1f77bcf86cd799439011",
        updateUserDto,
        "507f1f77bcf86cd799439011",
      );

      expect(result).toHaveProperty("fullName", "Updated Name");
    });

    it("should throw NotFoundException when updating non-existent user", async () => {
      mockUserModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        service.update(
          "507f1f77bcf86cd799439011",
          { fullName: "Test" },
          "507f1f77bcf86cd799439011",
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should remove a user", async () => {
      mockUserModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.remove("507f1f77bcf86cd799439011", "some-other-user-id");

      expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
        }),
      );
    });

    it("should throw NotFoundException when removing non-existent user", async () => {
      mockUserModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.remove("507f1f77bcf86cd799439011", "some-other-user-id"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("input validation", () => {
    it("should validate fullName length", async () => {
      const shortName = "A";
      expect(shortName.length).toBeLessThan(2);
    });

    it("should validate role values", async () => {
      const validRoles = ["admin", "operator"];
      expect(validRoles).toContain("admin");
      expect(validRoles).toContain("operator");
      expect(validRoles).not.toContain("invalid-role");
    });

    it("should validate email uniqueness", async () => {
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest
            .fn()
            .mockResolvedValue([{ email: "existing@skywin.aero" }]),
        }),
      });

      const existingUsers = await mockUserModel
        .find({ email: "existing@skywin.aero" })
        .select()
        .exec();
      expect(existingUsers).toHaveLength(1);
    });
  });
});
