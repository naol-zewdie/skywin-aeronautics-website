import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
export declare class ProductsService {
    private readonly productModel;
    constructor(productModel: Model<Product>);
    findAll(filters?: {
        search?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        status?: boolean;
    }): Promise<ProductDto[]>;
    findOne(id: string): Promise<ProductDto>;
    create(payload: CreateProductDto, userRole?: string): Promise<ProductDto>;
    update(id: string, payload: UpdateProductDto, userRole?: string): Promise<ProductDto>;
    remove(id: string): Promise<void>;
    toggleStatus(id: string): Promise<ProductDto>;
    exportToCsv(products: ProductDto[]): string;
    exportToPdf(products: ProductDto[]): Promise<Buffer>;
}
