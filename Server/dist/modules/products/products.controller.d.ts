import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getProducts(): Promise<ProductDto[]>;
    getProduct(id: string): Promise<ProductDto>;
    createProduct(payload: CreateProductDto): Promise<ProductDto>;
    updateProduct(id: string, payload: UpdateProductDto): Promise<ProductDto>;
    removeProduct(id: string): Promise<void>;
}
