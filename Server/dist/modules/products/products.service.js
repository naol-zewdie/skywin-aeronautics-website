"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto_1 = require("crypto");
const product_schema_1 = require("./schemas/product.schema");
const plainjs_1 = require("@json2csv/plainjs");
const pdfkit_1 = __importDefault(require("pdfkit"));
let ProductsService = class ProductsService {
    productModel;
    fallbackProducts = [
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
    constructor(productModel) {
        this.productModel = productModel;
    }
    async findAll(filters) {
        let products = this.fallbackProducts;
        if (this.productModel) {
            const query = {};
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
                if (filters.minPrice !== undefined)
                    query.price.$gte = filters.minPrice;
                if (filters.maxPrice !== undefined)
                    query.price.$lte = filters.maxPrice;
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
        if (filters) {
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                products = products.filter(p => p.name.toLowerCase().includes(searchLower) ||
                    p.description.toLowerCase().includes(searchLower));
            }
            if (filters.category) {
                const catLower = filters.category.toLowerCase();
                products = products.filter(p => p.category.toLowerCase().includes(catLower));
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
    async findOne(id) {
        if (!this.productModel) {
            const product = this.fallbackProducts.find((item) => item.id === id);
            if (!product) {
                throw new common_1.NotFoundException(`Product with id ${id} not found`);
            }
            return product;
        }
        const product = await this.productModel.findById(id).exec();
        if (!product) {
            throw new common_1.NotFoundException(`Product with id ${id} not found`);
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
    async create(payload) {
        const existingProducts = await this.findAll();
        const isDuplicate = existingProducts.some(p => p.name.toLowerCase() === payload.name.toLowerCase());
        if (isDuplicate) {
            throw new common_1.ConflictException('Product name already exists');
        }
        if (!this.productModel) {
            const created = { id: (0, crypto_1.randomUUID)(), status: true, ...payload };
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
    async update(id, payload) {
        if (!this.productModel) {
            const index = this.fallbackProducts.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`Product with id ${id} not found`);
            }
            this.fallbackProducts[index] = {
                ...this.fallbackProducts[index],
                ...payload,
            };
            return this.fallbackProducts[index];
        }
        const updated = await this.productModel.findByIdAndUpdate(id, {
            ...payload,
            'audit.updatedAt': new Date(),
        }, { new: true }).exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Product with id ${id} not found`);
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
    async remove(id) {
        if (!this.productModel) {
            const index = this.fallbackProducts.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`Product with id ${id} not found`);
            }
            this.fallbackProducts.splice(index, 1);
            return;
        }
        const result = await this.productModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Product with id ${id} not found`);
        }
    }
    exportToCsv(products) {
        const fields = ['id', 'name', 'category', 'description', 'price', 'stock', 'status'];
        const opts = { fields };
        const parser = new plainjs_1.Parser(opts);
        return parser.parse(products);
    }
    exportToPdf(products) {
        const doc = new pdfkit_1.default();
        const chunks = [];
        return new Promise((resolve, reject) => {
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(24).text('Products Catalog', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();
            products.forEach((product, index) => {
                if (doc.y > 700) {
                    doc.addPage();
                }
                doc.fontSize(16).text(product.name, { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10);
                doc.text(`Category: ${product.category}`, { continued: true });
                doc.text(`    Price: $${product.price.toFixed(2)}`, { continued: true });
                doc.text(`    Stock: ${product.stock}`);
                doc.text(`Status: ${product.status ? 'Active' : 'Inactive'}`);
                doc.moveDown(0.5);
                const description = product.description.substring(0, 300);
                doc.text(description + (product.description.length > 300 ? '...' : ''), { align: 'justify' });
                doc.moveDown();
                if (product.image) {
                    doc.fontSize(9).fillColor('gray').text(`Image: ${product.image}`);
                    doc.fillColor('black');
                    doc.moveDown();
                }
                if (index < products.length - 1) {
                    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                    doc.moveDown();
                }
            });
            doc.end();
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map