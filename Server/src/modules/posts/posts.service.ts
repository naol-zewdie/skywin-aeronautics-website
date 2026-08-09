import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { validate as uuidValidate } from 'uuid';
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
    limit?: number;
    offset?: number;
  }, userRole?: string, userId?: string): Promise<PostDto[]> {
    const query: any = {};

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.search) {
      const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { content: { $regex: escaped, $options: 'i' } },
        { excerpt: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (filters?.author) {
      query.author = { $regex: filters.author.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    if (filters?.status !== undefined) {
      query.status = filters.status;
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (userRole && userRole !== 'admin') {
      const roleCondition = userRole === 'operator'
        ? { $or: [{ status: true }, { 'audit.createdBy': userId }] }
        : { status: true };

      if (query.$or && roleCondition.$or) {
        query.$and = [{ $or: query.$or }, roleCondition];
        delete query.$or;
      } else {
        Object.assign(query, roleCondition);
      }
    }

    const limit = filters?.limit ?? 20;
    const offset = filters?.offset ?? 0;
    const posts = await this.postModel.find(query).skip(offset).limit(limit).exec();
    return posts.map((post) => this.mapToDto(post));
  }

  async findByType(type: ContentType, userRole?: string, userId?: string): Promise<PostDto[]> {
    return this.findAll({ type }, userRole, userId);
  }

  async findOne(id: string, userRole?: string, userId?: string): Promise<PostDto> {
    this.validateId(id);
    const query: Record<string, unknown> = { _id: id };
    const post = await this.postModel.findOne(query).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (userRole !== undefined && userRole !== 'admin' && post.audit?.createdBy !== userId) {
      throw new ForbiddenException('You can only view your own resources');
    }

    // Increment views
    await this.postModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
    post.views = (post.views || 0) + 1;

    return this.mapToDto(post);
  }

  async create(payload: CreatePostDto, userRole: string, userId: string): Promise<PostDto> {
    // Set status based on user role: admin can set status, operator defaults to true
    const status = userRole === 'admin' ? (payload.status ?? false) : (payload.status ?? true);

    const created = new this.postModel({
      ...payload,
      status,
      audit: {
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const saved = await created.save();
    return this.mapToDto(saved);
  }

  async update(id: string, payload: UpdatePostDto, userRole: string, userId: string): Promise<PostDto> {
    this.validateId(id);
    
    const existing = await this.postModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    if (userRole !== 'admin' && existing.audit?.createdBy !== userId) {
      throw new ForbiddenException('You can only modify your own resources');
    }

    const updateData: any = { ...payload, 'audit.updatedAt': new Date() };

    const updated = await this.postModel
      .findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException('Post not found');
    }
    return this.mapToDto(updated);
  }

  async remove(id: string, userRole: string, userId: string): Promise<void> {
    this.validateId(id);
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (userRole !== 'admin' && post.audit?.createdBy !== userId) {
      throw new ForbiddenException('You can only delete your own resources');
    }

    const result = await this.postModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Post not found');
    }
  }

  async toggleStatus(id: string, userRole: string, userId: string): Promise<PostDto> {
    this.validateId(id);
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (userRole !== 'admin' && post.audit?.createdBy !== userId) {
      throw new ForbiddenException('You can only modify your own resources');
    }

    post.status = !post.status;
    if (!post.audit) post.audit = {} as any;
    post.audit.updatedAt = new Date();
    await post.save();
    return this.mapToDto(post);
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
    const opts = {
      fields,
      transforms: [(field: { label: string }, value: unknown) => {
        const str = String(value ?? '');
        if (/^[=+\-@\t\r]/.test(str)) {
          return { [field.label]: "'" + str };
        }
        return { [field.label]: str };
      }],
    };
    const parser = new Parser(opts as any);
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

  private validateId(id: string): void {
    if (!uuidValidate(id) && !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
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
      audit: post.audit ? {
        createdBy: post.audit.createdBy,
        createdAt: post.audit.createdAt?.toISOString(),
        updatedBy: post.audit.updatedBy,
        updatedAt: post.audit.updatedAt?.toISOString(),
      } : undefined,
    };
  }
}
