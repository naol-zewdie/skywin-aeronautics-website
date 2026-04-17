import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';

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

  async findAll(): Promise<ProductDto[]> {
    if (!this.productModel) {
      return this.fallbackProducts;
    }

    const products = await this.productModel.find().exec();
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
}
