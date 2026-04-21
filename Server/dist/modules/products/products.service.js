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
const product_schema_1 = require("./schemas/product.schema");
const plainjs_1 = require("@json2csv/plainjs");
const pdfkit_1 = __importDefault(require("pdfkit"));
let ProductsService = class ProductsService {
    productModel;
    constructor(productModel) {
        this.productModel = productModel;
    }
    async findAll(filters) {
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
    async findOne(id) {
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
    async create(payload, userRole) {
        const existingProduct = await this.productModel.findOne({
            name: { $regex: `^${payload.name}$`, $options: 'i' }
        }).exec();
        if (existingProduct) {
            throw new common_1.ConflictException('Product name already exists');
        }
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
    async update(id, payload, userRole) {
        if (userRole !== 'admin' && payload.status !== undefined) {
            delete payload.status;
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
        const result = await this.productModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Product with id ${id} not found`);
        }
    }
    async toggleStatus(id) {
        const product = await this.productModel.findById(id).exec();
        if (!product) {
            throw new common_1.NotFoundException(`Product with id ${id} not found`);
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
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map