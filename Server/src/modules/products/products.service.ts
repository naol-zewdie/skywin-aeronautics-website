import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  private readonly fallbackProducts: ProductDto[] = [
    {
      id: 'p_001',
      name: 'Wing Spar Assembly',
      category: 'Aerospace Structures',
    },
    {
      id: 'p_002',
      name: 'Engine Mount Bracket',
      category: 'Powertrain Components',
    },
  ];

  constructor(
    @Optional()
    @InjectRepository(ProductEntity)
    private readonly productsRepository?: Repository<ProductEntity>,
  ) {}

  async findAll(): Promise<ProductDto[]> {
    if (!this.productsRepository) {
      return this.fallbackProducts;
    }

    return this.productsRepository.find();
  }

  async findOne(id: string): Promise<ProductDto> {
    if (!this.productsRepository) {
      const product = this.fallbackProducts.find((item) => item.id === id);
      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      return product;
    }

    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async create(payload: CreateProductDto): Promise<ProductDto> {
    if (!this.productsRepository) {
      const created: ProductDto = { id: randomUUID(), ...payload };
      this.fallbackProducts.push(created);
      return created;
    }

    const created = this.productsRepository.create(payload);
    return this.productsRepository.save(created);
  }

  async update(id: string, payload: UpdateProductDto): Promise<ProductDto> {
    if (!this.productsRepository) {
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

    const product = await this.findOne(id);
    const merged = this.productsRepository.merge(product, payload);
    return this.productsRepository.save(merged);
  }

  async remove(id: string): Promise<void> {
    if (!this.productsRepository) {
      const index = this.fallbackProducts.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      this.fallbackProducts.splice(index, 1);
      return;
    }

    const result = await this.productsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }
}
