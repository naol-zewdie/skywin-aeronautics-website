import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import { Parser } from '@json2csv/plainjs';
import PDFDocument from 'pdfkit';

@Injectable()
export class ProductsService {
  private readonly fallbackProducts: ProductDto[] = [
    {
      id: 'p_001',
      name: 'Wing Spar Assembly',
      category: 'Aerospace Structures',
      description: 'High-precision wing spar for commercial aircraft',
      price: 15000.99,
      image: 'https://example.com/images/wing-spar.jpg',
      stock: 25,
      status: true,
    },
    {
      id: 'p_002',
      name: 'Engine Mount Bracket',
      category: 'Powertrain Components',
      description: 'Durable engine mount bracket for jet engines',
      price: 8500.50,
      image: 'https://example.com/images/engine-bracket.jpg',
      stock: 40,
      status: true,
    },
  ];

  constructor(
    @Optional()
    @InjectModel(Product.name)
    private readonly productModel?: Model<Product>,
  ) {}

  async findAll(filters?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: boolean;
  }): Promise<ProductDto[]> {
    let products = this.fallbackProducts;

    if (this.productModel) {
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
      
      const dbProducts = await this.productModel.find(query).exec();
      products = dbProducts.map(product => ({
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

    // Apply filters to fallback data too
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.category) {
        const catLower = filters.category.toLowerCase();
        products = products.filter(p =>
          p.category.toLowerCase().includes(catLower)
        );
      }
      
      if (filters.status !== undefined) {
        products = products.filter(p => p.status === filters.status);
      }
      
      const minPrice = filters.minPrice;
      const maxPrice = filters.maxPrice;
      
      if (minPrice !== undefined) {
        products = products.filter(p => p.price >= minPrice);
      }
      
      if (maxPrice !== undefined) {
        products = products.filter(p => p.price <= maxPrice);
      }
    }

    return products;
  }

  exportToCsv(products: ProductDto[]): string {
    const headers = ['ID', 'Name', 'Category', 'Description', 'Price', 'Stock', 'Status'];
    const rows = products.map(p => [
      p.id,
      `"${p.name}"`,
      `"${p.category}"`,
      `"${p.description?.replace(/"/g, '""') || ''}"`,
      p.price,
      p.stock,
      p.status ? 'Active' : 'Inactive',
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  async findOne(id: string): Promise<ProductDto> {
    if (!this.productModel) {
      const product = this.fallbackProducts.find((item) => item.id === id);
      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      return product;
    }

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

  async create(payload: CreateProductDto): Promise<ProductDto> {
    // Check for duplicate product name
    const existingProducts = await this.findAll();
    const isDuplicate = existingProducts.some(
      p => p.name.toLowerCase() === payload.name.toLowerCase()
    );
    if (isDuplicate) {
      throw new Error('Product name already exists');
    }

    if (!this.productModel) {
      const created: ProductDto = { id: randomUUID(), status: true, ...payload };
      this.fallbackProducts.push(created);
      return created;
    }

    const created = new this.productModel({
      ...payload,
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

  async update(id: string, payload: UpdateProductDto): Promise<ProductDto> {
    if (!this.productModel) {
      const index = this.fallbackProducts.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }

      this.fallbackProducts[index] = {
        ...this.fallbackProducts[index],
        ...payload,
      };
      return this.fallbackProducts[index];
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
    if (!this.productModel) {
      const index = this.fallbackProducts.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      this.fallbackProducts.splice(index, 1);
      return;
    }

    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
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
