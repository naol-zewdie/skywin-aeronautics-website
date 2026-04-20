import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
export declare class ProductsService {
    private readonly productModel?;
    private readonly fallbackProducts;
    constructor(productModel?: Model<Product> | undefined);
    findAll(filters?: {
        search?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        status?: boolean;
    }): Promise<ProductDto[]>;
    findOne(id: string): Promise<ProductDto>;
    create(payload: CreateProductDto): Promise<ProductDto>;
    update(id: string, payload: UpdateProductDto): Promise<ProductDto>;
    remove(id: string): Promise<void>;
    exportToPdf(products: ProductDto[]): Promise<Buffer>;
}
