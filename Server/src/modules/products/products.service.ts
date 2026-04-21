import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import { Parser } from '@json2csv/plainjs';
import PDFDocument from 'pdfkit';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  async findAll(filters?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: boolean;
  }): Promise<ProductDto[]> {
    const query: any = {};

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters?.category) {
      query.category = { $regex: filters.category, $options: 'i' };
    }

    if (filters?.status !== undefined) {
      query.status = filters.status;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    const products = await this.productModel.find(query).exec();
    return products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      image: product.image,
      stock: product.stock,
      status: product.status,
    }));
  }

  async findOne(id: string): Promise<ProductDto> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
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
    };
  }

  async create(payload: CreateProductDto, userRole?: string): Promise<ProductDto> {
    // Check for duplicate product name
    const existingProduct = await this.productModel.findOne({
      name: { $regex: `^${payload.name}$`, $options: 'i' }
    }).exec();
    if (existingProduct) {
      throw new ConflictException('Product name already exists');
    }

    // Set status based on user role: admin can set status, operator defaults to false
    const status = userRole === 'admin' ? (payload.status ?? false) : false;

    const created = new this.productModel({
      ...payload,
      status,
      audit: {
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
    };
  }

  async update(id: string, payload: UpdateProductDto, userRole?: string): Promise<ProductDto> {
    // Non-admin users cannot change status
    if (userRole !== 'admin' && payload.status !== undefined) {
      delete payload.status;
    }

    const updated = await this.productModel.findByIdAndUpdate(
      id,
      {
        ...payload,
        'audit.updatedAt': new Date(),
      },
      { new: true }
    ).exec();
    if (!updated) {
      throw new NotFoundException(`Product with id ${id} not found`);
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
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }

  async toggleStatus(id: string): Promise<ProductDto> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    product.status = !product.status;
    product.audit.updatedAt = new Date();
    const saved = await product.save();

    return {
      id: saved._id.toString(),
      name: saved.name,
      category: saved.category,
      description: saved.description,
      price: saved.price,
      image: saved.image,
      stock: saved.stock,
      status: saved.status,
    };
  }

  exportToCsv(products: ProductDto[]): string {
    const fields = ['id', 'name', 'category', 'description', 'price', 'stock', 'status'];
    const opts = { fields };
    const parser = new Parser(opts);
    return parser.parse(products);
  }

  exportToPdf(products: ProductDto[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(24).text('Products Catalog', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
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
        doc.text(`    Price: $${product.price.toFixed(2)}`, { continued: true });
        doc.text(`    Stock: ${product.stock}`);
        doc.text(`Status: ${product.status ? 'Active' : 'Inactive'}`);
        doc.moveDown(0.5);

        // Description
        const description = product.description.substring(0, 300);
        doc.text(description + (product.description.length > 300 ? '...' : ''), { align: 'justify' });
        doc.moveDown();

        // Image if available
        if (product.image) {
          doc.fontSize(9).fillColor('gray').text(`Image: ${product.image}`);
          doc.fillColor('black');
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
