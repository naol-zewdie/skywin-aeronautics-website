import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { ContentType } from './schemas/post.schema';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all posts (fallback data)', async () => {
      const posts = await service.findAll();
      expect(posts).toHaveLength(3);
    });

    it('should filter by type', async () => {
      const posts = await service.findAll({ type: ContentType.NEWS });
      expect(posts).toHaveLength(1);
      expect(posts[0].type).toBe(ContentType.NEWS);
    });

    it('should filter by search', async () => {
      const posts = await service.findAll({ search: 'partnership' });
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toContain('Partnership');
    });
  });

  describe('findByType', () => {
    it('should return posts by type', async () => {
      const posts = await service.findByType(ContentType.BLOG);
      expect(posts).toHaveLength(1);
      expect(posts[0].type).toBe(ContentType.BLOG);
    });
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createDto = {
        title: 'Test Post',
        content: 'This is a test post content',
        type: ContentType.NEWS,
        author: 'Test Author',
      };

      const post = await service.create(createDto);
      expect(post.title).toBe(createDto.title);
      expect(post.type).toBe(ContentType.NEWS);
      expect(post.status).toBe(true);
    });
  });

  describe('exportToCsv', () => {
    it('should export posts to CSV format', async () => {
      const posts = await service.findAll();
      const csv = service.exportToCsv(posts);
      expect(csv).toContain('"id"');
      expect(csv).toContain('"title"');
      expect(csv).toContain('"type"');
      expect(csv).toContain('news');
    });
  });

  describe('exportToPdf', () => {
    it('should export posts to PDF format', async () => {
      const posts = await service.findAll();
      const pdfBuffer = await service.exportToPdf(posts);
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });
});
