import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { PostsService } from "./posts.service";
import { ContentType } from "./schemas/post.schema";

describe("PostsService", () => {
  let service: PostsService;

  const mockPosts = [
    {
      _id: "507f1f77bcf86cd799439011",
      title: "SkyWin Announces Partnership",
      content: "Exciting new partnership details.",
      type: ContentType.NEWS,
      author: "Admin",
      status: true,
      audit: {
        createdBy: "u_001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    {
      _id: "507f1f77bcf86cd799439012",
      title: "New Blog Post",
      content: "Blog content here.",
      type: ContentType.BLOG,
      author: "Admin",
      status: true,
      audit: {
        createdBy: "u_001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    {
      _id: "507f1f77bcf86cd799439013",
      title: "Company Update",
      content: "Update content.",
      type: ContentType.NEWS,
      author: "Admin",
      status: true,
      audit: {
        createdBy: "u_001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ];

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

  const mockPostModel: any = jest.fn().mockImplementation((payload) => ({
    ...payload,
    _id: payload._id || "new-generated-id",
    save: jest.fn().mockResolvedValue({ _id: "new-generated-id", ...payload }),
  }));
  mockPostModel.find = jest.fn().mockImplementation(() => mockChain([]));
  mockPostModel.findOne = jest.fn().mockImplementation(() => mockExec(null));
  mockPostModel.findById = jest.fn().mockImplementation(() => mockExec(null));
  mockPostModel.findByIdAndUpdate = jest
    .fn()
    .mockImplementation(() => mockExec(null));
  mockPostModel.findByIdAndDelete = jest
    .fn()
    .mockImplementation(() => mockExec(null));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getModelToken("Post"), useValue: mockPostModel },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all posts", async () => {
      mockPostModel.find.mockReturnValue(mockChain(mockPosts));

      const posts = await service.findAll();
      expect(posts).toHaveLength(3);
      expect(mockPostModel.find).toHaveBeenCalled();
    });

    it("should filter by type", async () => {
      const newsPosts = mockPosts.filter((p) => p.type === ContentType.NEWS);
      mockPostModel.find.mockReturnValue(mockChain(newsPosts));

      const posts = await service.findAll({ type: ContentType.NEWS });
      expect(posts).toHaveLength(2);
    });

    it("should filter by search", async () => {
      const filtered = mockPosts.filter((p) => p.title.includes("Partnership"));
      mockPostModel.find.mockReturnValue(mockChain(filtered));

      const posts = await service.findAll({ search: "partnership" });
      expect(posts).toHaveLength(1);
    });
  });

  describe("findByType", () => {
    it("should return posts by type", async () => {
      const blogPosts = mockPosts.filter((p) => p.type === ContentType.BLOG);
      mockPostModel.find.mockReturnValue(mockChain(blogPosts));

      const posts = await service.findByType(ContentType.BLOG);
      expect(posts).toHaveLength(1);
    });
  });

  describe("create", () => {
    it("should create a new post", async () => {
      const savedPost = {
        _id: "new-id",
        title: "Test Post",
        content: "This is a test post content",
        type: ContentType.NEWS,
        author: "Test Author",
        status: true,
        audit: {
          createdBy: "u_001",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const MockConstructor = jest.fn().mockImplementation((payload) => ({
        ...payload,
        save: jest.fn().mockResolvedValue({ _id: "new-id", ...payload }),
      }));

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PostsService,
          { provide: getModelToken("Post"), useValue: MockConstructor },
        ],
      }).compile();
      const svc = module.get<PostsService>(PostsService);

      const result = await svc.create(
        {
          title: "Test Post",
          content: "This is a test post content",
          type: ContentType.NEWS,
          author: "Test Author",
        },
        "admin",
        "u_001",
      );

      expect(result.title).toBe("Test Post");
    });
  });

  describe("exportToCsv", () => {
    it("should export posts to CSV format", async () => {
      const posts = [
        {
          id: "1",
          title: "Test",
          type: ContentType.NEWS,
          author: "Admin",
          content: "Content",
          status: true,
        },
      ];
      const csv = service.exportToCsv(posts);
      expect(csv).toContain("id");
      expect(csv).toContain("title");
    });
  });

  describe("exportToPdf", () => {
    it("should export posts to PDF format", async () => {
      const posts = [
        {
          id: "1",
          title: "Test Post",
          type: ContentType.NEWS,
          author: "Admin",
          content: "Content",
          status: true,
        },
      ];
      const pdfBuffer = await service.exportToPdf(posts);
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });
});
