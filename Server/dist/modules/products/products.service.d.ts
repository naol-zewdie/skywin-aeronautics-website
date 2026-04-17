import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
export declare class ProductsService {
    private readonly productsRepository?;
    private readonly fallbackProducts;
    constructor(productsRepository?: Repository<ProductEntity> | undefined);
    findAll(): Promise<ProductDto[]>;
    findOne(id: string): Promise<ProductDto>;
    create(payload: CreateProductDto): Promise<ProductDto>;
    update(id: string, payload: UpdateProductDto): Promise<ProductDto>;
    remove(id: string): Promise<void>;
}
