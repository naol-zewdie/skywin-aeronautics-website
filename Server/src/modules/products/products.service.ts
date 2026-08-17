import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { validate as uuidValidate } from "uuid";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductDto } from "./dto/product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./schemas/product.schema";
import { Parser } from "@json2csv/plainjs";
import PDFDocument from "pdfkit";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  /**
   * Returns a paginated list of products, filtered by the provided criteria.
   * Role-based visibility is enforced: viewers only see active products,
   * operators also see their own inactive ones, admins see all.
   */
  async findAll(
    filters?: {
      search?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      status?: boolean;
      limit?: number;
      offset?: number;
    },
    userRole?: string,
    userId?: string,
  ): Promise<ProductDto[]> {
    const query: any = {};

    if (filters?.search) {
      const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    if (filters?.category) {
      query.category = {
        $regex: filters.category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    if (filters?.status !== undefined) {
      query.status = filters.status;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (userRole && userRole !== "admin") {
      const roleCondition =
        userRole === "operator"
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
    const products = await this.productModel
      .find(query)
      .skip(offset)
      .limit(limit)
      .exec();
    return products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      image: product.image,
      stock: product.stock,
      status: product.status,
      audit: product.audit
        ? {
            createdBy: product.audit.createdBy,
            createdAt: product.audit.createdAt?.toISOString(),
            updatedBy: product.audit.updatedBy,
            updatedAt: product.audit.updatedAt?.toISOString(),
          }
        : undefined,
    }));
  }

  /**
   * Returns a single product by ID.
   * Non-admin users may only view active products or those they created.
   *
   * @throws BadRequestException if the ID format is invalid.
   * @throws NotFoundException if no product is found.
   * @throws ForbiddenException if the user cannot view this product.
   */
  async findOne(
    id: string,
    userRole?: string,
    userId?: string,
  ): Promise<ProductDto> {
    this.validateId(id);

    const query: Record<string, unknown> = { _id: id };

    // Security (IDOR): Enforce visibility at query level so non-admin users
    // cannot probe or retrieve restricted products by ID.
    if (userRole !== undefined && userRole !== "admin") {
      if (userRole === "operator") {
        query["$or"] = [{ status: true }, { "audit.createdBy": userId }];
      } else {
        query.status = true;
      }
    }

    const product = await this.productModel.findOne(query as any).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return {
      id: product._id.toString(),
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      image: product.image,
      stock: product.stock,
      status: product.status,
      audit: product.audit
        ? {
            createdBy: product.audit.createdBy,
            createdAt: product.audit.createdAt?.toISOString(),
            updatedBy: product.audit.updatedBy,
            updatedAt: product.audit.updatedAt?.toISOString(),
          }
        : undefined,
    };
  }

  /**
   * Creates a new product.
   * Checks for duplicate product names (case-insensitive).
   * Admins may set any initial status; operators default to active.
   *
   * @throws ConflictException if a product with the same name already exists.
   */
  async create(
    payload: CreateProductDto,
    userRole: string,
    userId: string,
  ): Promise<ProductDto> {
    // Check for duplicate product name
    const escaped = payload.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingProduct = await this.productModel
      .findOne({
        name: { $regex: `^${escaped}$`, $options: "i" },
      })
      .exec();
    if (existingProduct) {
      throw new ConflictException("Product name already exists");
    }

    // Set status based on user role: admin can set status, operator defaults to true
    const status =
      userRole === "admin"
        ? (payload.status ?? false)
        : (payload.status ?? true);

    const created = new this.productModel({
      ...payload,
      status,
      audit: {
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const saved = await created.save();
    return {
      id: saved._id.toString(),
      name: saved.name,
      category: saved.category,
      description: saved.description,
      price: saved.price,
      image: saved.image,
      stock: saved.stock,
      status: saved.status,
      audit: saved.audit
        ? {
            createdBy: saved.audit.createdBy,
            createdAt: saved.audit.createdAt?.toISOString(),
            updatedBy: saved.audit.updatedBy,
            updatedAt: saved.audit.updatedAt?.toISOString(),
          }
        : undefined,
    };
  }

  /**
   * Updates an existing product.
   * Non-admin users may only update products they created.
   *
   * @throws BadRequestException if the ID format is invalid.
   * @throws NotFoundException if the product does not exist.
   * @throws ForbiddenException if the user does not own the product.
   */
  async update(
    id: string,
    payload: UpdateProductDto,
    userRole: string,
    userId: string,
  ): Promise<ProductDto> {
    this.validateId(id);

    // Security (IDOR TOCTOU fix): embed ownership check atomically inside query
    const ownerFilter =
      userRole === "admin"
        ? { _id: id }
        : { _id: id, "audit.createdBy": userId };

    const updateData: Record<string, unknown> = {
      ...payload,
      "audit.updatedBy": userId,
      "audit.updatedAt": new Date(),
    };

    const updated = await this.productModel
      .findOneAndUpdate(ownerFilter, { $set: updateData }, { returnDocument: "after" })
      .exec();

    if (!updated) {
      const exists = await this.productModel.exists({ _id: id }).exec();
      if (!exists) {
        throw new NotFoundException("Product not found");
      }
      throw new ForbiddenException("You can only modify your own resources");
    }

    return {
      id: updated._id.toString(),
      name: updated.name,
      category: updated.category,
      description: updated.description,
      price: updated.price,
      image: updated.image,
      stock: updated.stock,
      status: updated.status,
      audit: updated.audit
        ? {
            createdBy: updated.audit.createdBy,
            createdAt: updated.audit.createdAt?.toISOString(),
            updatedBy: updated.audit.updatedBy,
            updatedAt: updated.audit.updatedAt?.toISOString(),
          }
        : undefined,
    };
  }

  /**
   * Permanently deletes a product.
   * Non-admin users may only delete products they created.
   */
  async remove(id: string, userRole: string, userId: string): Promise<void> {
    this.validateId(id);

    // Security (IDOR TOCTOU fix): atomic ownership-check-and-delete
    const ownerFilter =
      userRole === "admin"
        ? { _id: id }
        : { _id: id, "audit.createdBy": userId };

    const deleted = await this.productModel.findOneAndDelete(ownerFilter).exec();

    if (!deleted) {
      const exists = await this.productModel.exists({ _id: id }).exec();
      if (!exists) {
        throw new NotFoundException("Product not found");
      }
      throw new ForbiddenException("You can only delete your own resources");
    }
  }

  /**
   * Toggles the active/inactive status of a product.
   * Non-admin users may only toggle their own products.
   */
  async toggleStatus(
    id: string,
    userRole: string,
    userId: string,
  ): Promise<ProductDto> {
    this.validateId(id);
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (userRole !== "admin" && product.audit?.createdBy !== userId) {
      throw new ForbiddenException("You can only modify your own resources");
    }

    product.status = !product.status;
    // Q4 fix: initialise audit with proper field shapes instead of {} as any.
    if (!product.audit) {
      product.audit = { createdBy: userId, createdAt: new Date(), updatedBy: userId, updatedAt: new Date() } as typeof product.audit;
    }
    product.audit.updatedBy = userId;
    product.audit.updatedAt = new Date();
    await product.save();
    return {
      id: product._id.toString(),
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      image: product.image,
      stock: product.stock,
      status: product.status,
      audit: product.audit
        ? {
            createdBy: product.audit.createdBy,
            createdAt: product.audit.createdAt?.toISOString(),
            updatedBy: product.audit.updatedBy,
            updatedAt: product.audit.updatedAt?.toISOString(),
          }
        : undefined,
    };
  }

  /**
   * Validates that an ID is a 24-char hex MongoDB ObjectId or a valid UUID.
   * @throws BadRequestException if the format is not recognised.
   */
  private validateId(id: string): void {
    const isMongoId = /^[a-f\d]{24}$/i.test(id);
    if (!isMongoId && !uuidValidate(id)) {
      throw new BadRequestException("Invalid ID format");
    }
  }

  /**
   * Exports a list of products to CSV format.
   * Sanitises values to prevent formula injection when opened in spreadsheet apps.
   */
  exportToCsv(products: ProductDto[]): string {
    const fields = [
      "id",
      "name",
      "category",
      "description",
      "price",
      "stock",
      "status",
    ];
    const sanitized = products.map((p) => {
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

  exportToPdf(products: ProductDto[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Title
      doc.fontSize(24).text("Products Catalog", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown(2);

      // Separator line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      products.forEach((product, index) => {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }

        // Product name
        doc.fontSize(16).text(product.name, { underline: true });
        doc.moveDown(0.5);

        // Product details
        doc.fontSize(10);
        doc.text(`Category: ${product.category}`, { continued: true });
        doc.text(`    Price: $${product.price.toFixed(2)}`, {
          continued: true,
        });
        doc.text(`    Stock: ${product.stock}`);
        doc.text(`Status: ${product.status ? "Active" : "Inactive"}`);
        doc.moveDown(0.5);

        // Description
        const description = product.description.substring(0, 300);
        doc.text(
          description + (product.description.length > 300 ? "..." : ""),
          { align: "justify" },
        );
        doc.moveDown();

        // Image if available
        if (product.image) {
          doc.fontSize(9).fillColor("gray").text(`Image: ${product.image}`);
          doc.fillColor("black");
          doc.moveDown();
        }

        // Separator between products
        if (index < products.length - 1) {
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown();
        }
      });

      doc.end();
    });
  }
}
