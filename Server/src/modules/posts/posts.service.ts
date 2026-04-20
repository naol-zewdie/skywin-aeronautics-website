import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, ContentType } from './schemas/post.schema';
import { Parser } from '@json2csv/plainjs';
import PDFDocument from 'pdfkit';

@Injectable()
export class PostsService {
  private readonly fallbackPosts: PostDto[] = [
    {
      id: 'post_001',
      title: 'Skywin Aeronautics Announces New Partnership',
      content: 'We are excited to announce our partnership with leading aerospace manufacturers to bring cutting-edge technology to the industry. This collaboration will enable us to deliver enhanced products and services to our global customer base.',
      type: ContentType.NEWS,
      author: 'Admin Team',
      excerpt: 'New partnership announcement with leading aerospace manufacturers',
      status: true,
      views: 150,
      tags: ['partnership', 'news', 'aerospace'],
    },
    {
      id: 'post_002',
      title: 'Understanding Aerospace Composite Materials',
      content: 'Composite materials have revolutionized the aerospace industry. In this blog post, we explore the benefits of using advanced composites in aircraft manufacturing, including weight reduction, fuel efficiency, and durability.',
      type: ContentType.BLOG,
      author: 'Engineering Team',
      excerpt: 'An in-depth look at composite materials in aerospace',
      status: true,
      views: 89,
      tags: ['composites', 'materials', 'engineering'],
    },
    {
      id: 'post_003',
      title: 'Annual Aerospace Innovation Summit 2026',
      content: 'Join us for the Annual Aerospace Innovation Summit where industry leaders will discuss the future of aviation technology. Network with professionals and learn about the latest innovations.',
      type: ContentType.EVENT,
      author: 'Events Team',
      excerpt: 'Annual summit bringing together aerospace innovators',
      status: true,
      views: 245,
      eventDate: new Date('2026-06-15T09:00:00Z'),
      eventLocation: 'Convention Center, Dubai',
      tags: ['summit', 'networking', 'innovation'],
    },
  ];

  constructor(
    @Optional()
    @InjectModel(Post.name)
    private readonly postModel?: Model<Post>,
  ) {}

  async findAll(filters?: {
    type?: ContentType;
    search?: string;
    author?: string;
    status?: boolean;
    tags?: string[];
  }): Promise<PostDto[]> {
    let posts = this.fallbackPosts;

    if (this.postModel) {
      const query: any = {};

      if (filters?.type) {
        query.type = filters.type;
      }

      if (filters?.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { content: { $regex: filters.search, $options: 'i' } },
          { excerpt: { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters?.author) {
        query.author = { $regex: filters.author, $options: 'i' };
      }

      if (filters?.status !== undefined) {
        query.status = filters.status;
      }

      if (filters?.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      const dbPosts = await this.postModel.find(query).exec();
      posts = dbPosts.map((post) => this.mapToDto(post));
    }

    // Apply filters to fallback data too
    if (filters) {
      if (filters.type) {
        posts = posts.filter((p) => p.type === filters.type);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        posts = posts.filter(
          (p) =>
            p.title.toLowerCase().includes(searchLower) ||
            p.content.toLowerCase().includes(searchLower) ||
            (p.excerpt && p.excerpt.toLowerCase().includes(searchLower)),
        );
      }

      if (filters.author) {
        const authorLower = filters.author.toLowerCase();
        posts = posts.filter((p) =>
          p.author.toLowerCase().includes(authorLower),
        );
      }

      if (filters.status !== undefined) {
        posts = posts.filter((p) => p.status === filters.status);
      }

      if (filters.tags && filters.tags.length > 0) {
        posts = posts.filter((p) =>
          p.tags?.some((tag) => filters.tags!.includes(tag)),
        );
      }
    }

    return posts;
  }

  async findByType(type: ContentType): Promise<PostDto[]> {
    return this.findAll({ type });
  }

  async findOne(id: string): Promise<PostDto> {
    if (!this.postModel) {
      const post = this.fallbackPosts.find((item) => item.id === id);
      if (!post) {
        throw new NotFoundException(`Post with id ${id} not found`);
      }
      // Increment views for fallback data (in-memory)
      post.views = (post.views || 0) + 1;
      return post;
    }

    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    // Increment views
    await this.postModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
    post.views = (post.views || 0) + 1;

    return this.mapToDto(post);
  }

  async create(payload: CreatePostDto): Promise<PostDto> {
    if (!this.postModel) {
      const created: PostDto = {
        id: randomUUID(),
        ...payload,
        status: payload.status ?? true,
        views: 0,
      };
      this.fallbackPosts.push(created);
      return created;
    }

    const created = new this.postModel({
      ...payload,
      audit: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const saved = await created.save();
    return this.mapToDto(saved);
  }

  async update(id: string, payload: UpdatePostDto): Promise<PostDto> {
    if (!this.postModel) {
      const index = this.fallbackPosts.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`Post with id ${id} not found`);
      }

      this.fallbackPosts[index] = {
        ...this.fallbackPosts[index],
        ...payload,
      };
      return this.fallbackPosts[index];
    }

    const updated = await this.postModel
      .findByIdAndUpdate(
        id,
        {
          ...payload,
          'audit.updatedAt': new Date(),
        },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return this.mapToDto(updated);
  }

  async remove(id: string): Promise<void> {
    if (!this.postModel) {
      const index = this.fallbackPosts.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`Post with id ${id} not found`);
      }
      this.fallbackPosts.splice(index, 1);
      return;
    }

    const result = await this.postModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
  }

  exportToCsv(posts: PostDto[]): string {
    const fields = [
      'id',
      'title',
      'type',
      'author',
      'excerpt',
      'status',
      'views',
      'eventDate',
      'eventLocation',
      'tags',
    ];
    const opts = { fields };
    const parser = new Parser(opts);
    return parser.parse(posts);
  }

  exportToPdf(posts: PostDto[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(24).text('Content Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, {
        align: 'center',
      });
      doc.moveDown(2);

      // Separator line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      posts.forEach((post, index) => {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }

        // Post title
        doc.fontSize(16).text(post.title, { underline: true });
        doc.moveDown(0.5);

        // Post details
        doc.fontSize(10);
        doc.text(`Type: ${post.type.toUpperCase()}`, { continued: true });
        doc.text(`    Author: ${post.author}`, { continued: true });
        doc.text(`    Status: ${post.status ? 'Active' : 'Inactive'}`);
        doc.text(`Views: ${post.views || 0}`);

        if (post.eventDate) {
          doc.text(
            `Event Date: ${new Date(post.eventDate).toLocaleDateString()}`,
          );
        }
        if (post.eventLocation) {
          doc.text(`Location: ${post.eventLocation}`);
        }
        if (post.tags && post.tags.length > 0) {
          doc.text(`Tags: ${post.tags.join(', ')}`);
        }
        doc.moveDown(0.5);

        // Content preview (first 300 characters)
        const contentPreview = post.content.substring(0, 300);
        doc.text(contentPreview + (post.content.length > 300 ? '...' : ''), {
          align: 'justify',
        });
        doc.moveDown();

        // Excerpt if available
        if (post.excerpt) {
          doc.fontSize(9).fillColor('gray').text(`Excerpt: ${post.excerpt}`);
          doc.fillColor('black');
          doc.moveDown();
        }

        // Separator between posts
        if (index < posts.length - 1) {
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown();
        }
      });

      doc.end();
    });
  }

  private mapToDto(post: any): PostDto {
    return {
      id: post._id ? post._id.toString() : post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      author: post.author,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      tags: post.tags,
      eventDate: post.eventDate,
      eventLocation: post.eventLocation,
      status: post.status,
      views: post.views,
    };
  }
}
