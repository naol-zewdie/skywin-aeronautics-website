import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, ContentType } from './schemas/post.schema';
import { Parser } from '@json2csv/plainjs';
import PDFDocument from 'pdfkit';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
  ) {}

  async findAll(filters?: {
    type?: ContentType;
    search?: string;
    author?: string;
    status?: boolean;
    tags?: string[];
  }): Promise<PostDto[]> {
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

    const posts = await this.postModel.find(query).exec();
    return posts.map((post) => this.mapToDto(post));
  }

  async findByType(type: ContentType): Promise<PostDto[]> {
    return this.findAll({ type });
  }

  async findOne(id: string): Promise<PostDto> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    // Increment views
    await this.postModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
    post.views = (post.views || 0) + 1;

    return this.mapToDto(post);
  }

  async create(payload: CreatePostDto, userRole?: string): Promise<PostDto> {
    // Set status based on user role: admin can set status, operator defaults to false
    const status = userRole === 'admin' ? (payload.status ?? false) : false;

    const created = new this.postModel({
      ...payload,
      status,
      audit: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const saved = await created.save();
    return this.mapToDto(saved);
  }

  async update(id: string, payload: UpdatePostDto, userRole?: string): Promise<PostDto> {
    // Non-admin users cannot change status
    if (userRole !== 'admin' && payload.status !== undefined) {
      delete payload.status;
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
    const result = await this.postModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
  }

  async toggleStatus(id: string): Promise<PostDto> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    post.status = !post.status;
    post.audit.updatedAt = new Date();
    const saved = await post.save();

    return this.mapToDto(saved);
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
