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

  async findOne(
    id: string,
    userRole?: string,
    userId?: string,
  ): Promise<ProductDto> {
    this.validateId(id);
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (
      userRole !== undefined &&
      userRole !== "admin" &&
      product.audit?.createdBy !== userId
    ) {
      throw new ForbiddenException("You can only view your own resources");
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

  async update(
    id: string,
    payload: UpdateProductDto,
    userRole: string,
    userId: string,
  ): Promise<ProductDto> {
    this.validateId(id);

    const existing = await this.productModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException("Product not found");
    }

    if (userRole !== "admin" && existing.audit?.createdBy !== userId) {
      throw new ForbiddenException("You can only modify your own resources");
    }

    const updateData: any = { ...payload, "audit.updatedAt": new Date() };

    const updated = await this.productModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException("Product not found");
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

  async remove(id: string, userRole: string, userId: string): Promise<void> {
    this.validateId(id);
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (userRole !== "admin" && product.audit?.createdBy !== userId) {
      throw new ForbiddenException("You can only delete your own resources");
    }

    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException("Product not found");
    }
  }

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
    if (!product.audit) product.audit = {} as any;
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

  private validateId(id: string): void {
    if (!uuidValidate(id) && !Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ID format");
    }
  }

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
    const opts = {
      fields,
      transforms: [
        (field: { label: string }, value: unknown) => {
          const str = String(value ?? "");
          if (/^[=+\-@\t\r]/.test(str)) {
            return { [field.label]: "'" + str };
          }
          return { [field.label]: str };
        },
      ],
    };
    const parser = new Parser(opts as any);
    return parser.parse(products);
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
