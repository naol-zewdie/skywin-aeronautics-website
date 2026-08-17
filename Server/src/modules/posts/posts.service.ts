import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { validate as uuidValidate } from "uuid";
import { CreatePostDto } from "./dto/create-post.dto";
import { PostDto } from "./dto/post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { Post, ContentType } from "./schemas/post.schema";
import { toInternalRole } from "../../common/utils/role-obfuscator";
import { Parser } from "@json2csv/plainjs";
import PDFDocument from "pdfkit";

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
  ) {}

  /**
   * Returns a paginated list of posts, filtered by the provided criteria.
   * Role-based visibility is applied: viewers only see published posts,
   * operators also see their own drafts, and admins see everything.
   */
  async findAll(
    filters?: {
      type?: ContentType;
      search?: string;
      author?: string;
      status?: boolean;
      tags?: string[];
      limit?: number;
      offset?: number;
    },
    userRole?: string,
    userId?: string,
  ): Promise<PostDto[]> {
    const role = userRole ? toInternalRole(userRole) : undefined;
    const query: any = {};

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.search) {
      const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { content: { $regex: escaped, $options: "i" } },
        { excerpt: { $regex: escaped, $options: "i" } },
      ];
    }

    if (filters?.author) {
      query.author = {
        $regex: filters.author.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    if (filters?.status !== undefined) {
      query.status = filters.status;
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (role && role !== "admin") {
      const roleCondition =
        role === "operator"
          ? { $or: [{ status: true }, { "audit.createdBy": userId }] }
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
    const posts = await this.postModel
      .find(query)
      .skip(offset)
      .limit(limit)
      .exec();
    return posts.map((post) => this.mapToDto(post));
  }

  /**
   * Returns all posts of a given content type, applying role-based visibility.
   *
   * @param type     - Content type filter (news | blog | event).
   * @param userRole - The authenticated user's role.
   * @param userId   - The authenticated user's ID.
   */
  async findByType(
    type: ContentType,
    userRole?: string,
    userId?: string,
  ): Promise<PostDto[]> {
    return this.findAll({ type }, userRole, userId);
  }

  /**
   * Returns a single post by ID.
   *
   * Security (S4): Applies role-based visibility before returning the post.
   * Viewers may only see published (status=true) posts. Operators may also
   * see drafts they created. Admins see all posts.
   *
   * @throws BadRequestException if the ID format is invalid.
   * @throws NotFoundException if no matching post exists.
   * @throws ForbiddenException if the user's role does not permit viewing this post.
   */
  async findOne(
    id: string,
    userRole?: string,
    userId?: string,
  ): Promise<PostDto> {
    this.validateId(id);
    const role = userRole ? toInternalRole(userRole) : undefined;
    const isObjId = Types.ObjectId.isValid(id);
    const idConditions: any[] = isObjId ? [{ _id: id }, { _id: new Types.ObjectId(id) }] : [{ _id: id }];

    let query: Record<string, unknown>;
    if (role !== undefined && role !== "admin") {
      const roleConditions: any[] =
        role === "operator"
          ? [{ status: true }, { "audit.createdBy": userId }]
          : [{ status: true }];
      query = { $and: [{ $or: idConditions }, { $or: roleConditions }] };
    } else {
      query = { $or: idConditions };
    }

    const post = await this.postModel.findOne(query).exec();
    if (!post) {
      throw new NotFoundException("Post not found");
    }

    // Increment view counter.
    await this.postModel.findOneAndUpdate({ $or: idConditions }, { $inc: { views: 1 } }).exec();
    post.views = (post.views || 0) + 1;

    return this.mapToDto(post);
  }

  /**
   * Creates a new post.
   * Admins may set any initial status; operators default to published (status=true).
   *
   * @param payload  - Validated create-post DTO.
   * @param userRole - The creator's role (determines default status).
   * @param userId   - The creator's user ID (stored in audit trail).
   */
  async create(
    payload: CreatePostDto,
    userRole: string,
    userId: string,
  ): Promise<PostDto> {
    const role = userRole ? toInternalRole(userRole) : undefined;
    // Set status based on user role: admin can set status, operator defaults to true
    const status =
      role === "admin"
        ? (payload.status ?? false)
        : (payload.status ?? true);

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

  /**
   * Updates an existing post.
   * Non-admin users may only update posts they created.
   *
   * @throws NotFoundException if the post does not exist.
   * @throws ForbiddenException if the user does not own the post.
   */
  async update(
    id: string,
    payload: UpdatePostDto,
    userRole: string,
    userId: string,
  ): Promise<PostDto> {
    this.validateId(id);

    const role = userRole ? toInternalRole(userRole) : undefined;
    const isObjId = Types.ObjectId.isValid(id);
    const idConditions: any[] = isObjId ? [{ _id: id }, { _id: new Types.ObjectId(id) }] : [{ _id: id }];

    const ownerFilter: any =
      role === "admin"
        ? { $or: idConditions }
        : { $and: [{ $or: idConditions }, { "audit.createdBy": userId }] };

    const updateData: Record<string, unknown> = {
      ...payload,
      "audit.updatedBy": userId,
      "audit.updatedAt": new Date(),
    };

    const updated = await this.postModel
      .findOneAndUpdate(ownerFilter, { $set: updateData }, { returnDocument: "after" })
      .exec();

    if (!updated) {
      const exists = await this.postModel.exists({ $or: idConditions }).exec();
      if (!exists) {
        throw new NotFoundException("Post not found");
      }
      throw new ForbiddenException("You can only modify your own resources");
    }
    return this.mapToDto(updated);
  }

  /**
   * Permanently deletes a post.
   * Non-admin users may only delete posts they created.
   *
   * @throws NotFoundException if the post does not exist.
   * @throws ForbiddenException if the user does not own the post.
   */
  async remove(id: string, userRole: string, userId: string): Promise<void> {
    this.validateId(id);

    const role = userRole ? toInternalRole(userRole) : undefined;
    const isObjId = Types.ObjectId.isValid(id);
    const idConditions: any[] = isObjId ? [{ _id: id }, { _id: new Types.ObjectId(id) }] : [{ _id: id }];

    const ownerFilter: any =
      role === "admin"
        ? { $or: idConditions }
        : { $and: [{ $or: idConditions }, { "audit.createdBy": userId }] };

    const deleted = await this.postModel.findOneAndDelete(ownerFilter).exec();

    if (!deleted) {
      const exists = await this.postModel.exists({ $or: idConditions }).exec();
      if (!exists) {
        throw new NotFoundException("Post not found");
      }
      throw new ForbiddenException("You can only delete your own resources");
    }
  }

  /**
   * Toggles the published/draft status of a post.
   * Non-admin users may only toggle their own posts.
   *
   * @throws NotFoundException if the post does not exist.
   * @throws ForbiddenException if the user does not own the post.
   */
  async toggleStatus(
    id: string,
    userRole: string,
    userId: string,
  ): Promise<PostDto> {
    this.validateId(id);
    const isObjId = Types.ObjectId.isValid(id);
    const idConditions: any[] = isObjId ? [{ _id: id }, { _id: new Types.ObjectId(id) }] : [{ _id: id }];
    const post = await this.postModel.findOne({ $or: idConditions }).exec();
    if (!post) {
      throw new NotFoundException("Post not found");
    }

    const role = userRole ? toInternalRole(userRole) : undefined;
    if (role !== "admin" && post.audit?.createdBy !== userId) {
      throw new ForbiddenException("You can only modify your own resources");
    }

    post.status = !post.status;
    if (!post.audit) {
      post.audit = { createdBy: userId, createdAt: new Date(), updatedBy: userId, updatedAt: new Date() } as typeof post.audit;
    }
    post.audit.updatedBy = userId;
    post.audit.updatedAt = new Date();
    await post.save();
    return this.mapToDto(post);
  }

  /**
   * Exports a list of posts to CSV format.
   *
   * Security: Values starting with formula-injection characters are prefixed
   * with a single quote to prevent spreadsheet formula injection.
   */
  exportToCsv(posts: PostDto[]): string {
    const fields = [
      "id",
      "title",
      "type",
      "author",
      "excerpt",
      "status",
      "views",
      "eventDate",
      "eventLocation",
      "tags",
    ];
    const sanitized = posts.map((p) => {
      const record: Record<string, string> = {};
      for (const field of fields) {
        const str = String((p as unknown as Record<string, unknown>)[field] ?? "");
        record[field] = /^[=+\-@\t\r]/.test(str) ? "'" + str : str;
      }
      return record;
    });
    const parser = new Parser({ fields });
    return parser.parse(sanitized);
  }

  exportToPdf(posts: PostDto[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Title
      doc.fontSize(24).text("Content Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, {
        align: "center",
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
        doc.text(`    Status: ${post.status ? "Active" : "Inactive"}`);
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
          doc.text(`Tags: ${post.tags.join(", ")}`);
        }
        doc.moveDown(0.5);

        // Content preview (first 300 characters)
        const contentPreview = post.content.substring(0, 300);
        doc.text(contentPreview + (post.content.length > 300 ? "..." : ""), {
          align: "justify",
        });
        doc.moveDown();

        // Excerpt if available
        if (post.excerpt) {
          doc.fontSize(9).fillColor("gray").text(`Excerpt: ${post.excerpt}`);
          doc.fillColor("black");
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

  /**
   * Validates that an ID string is a proper MongoDB ObjectId (24 hex chars)
   * or a valid UUID v4.
   *
   * Security: Requires canonical 24-character hex format to prevent
   * ambiguous short-string matches from ObjectId.isValid().
   *
   * @throws BadRequestException if the ID does not match either format.
   */
  private validateId(id: string): void {
    const isMongoId = /^[a-f\d]{24}$/i.test(id);
    if (!isMongoId && !uuidValidate(id)) {
      throw new BadRequestException("Invalid ID format");
    }
  }

  /**
   * Maps a Mongoose Post document to the public-facing PostDto.
   * Serialises Date fields to ISO strings for consistent JSON output.
   */
  private mapToDto(post: Post & { _id: unknown; views?: number }): PostDto {
    const docId = (post as unknown as { _id?: { toString(): string }; id?: string })._id;
    return {
      id: docId ? docId.toString() : (post as unknown as { id: string }).id,
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
      audit: post.audit
        ? {
            createdBy: post.audit.createdBy,
            createdAt: post.audit.createdAt?.toISOString(),
            updatedBy: post.audit.updatedBy,
            updatedAt: post.audit.updatedAt?.toISOString(),
          }
        : undefined,
    };
  }
}
