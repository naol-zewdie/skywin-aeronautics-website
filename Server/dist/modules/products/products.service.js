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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const product_entity_1 = require("./entities/product.entity");
const typeorm_2 = require("typeorm");
let ProductsService = class ProductsService {
    productsRepository;
    fallbackProducts = [
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
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    async findAll() {
        if (!this.productsRepository) {
            return this.fallbackProducts;
        }
        return this.productsRepository.find();
    }
    async findOne(id) {
        if (!this.productsRepository) {
            const product = this.fallbackProducts.find((item) => item.id === id);
            if (!product) {
                throw new common_1.NotFoundException(`Product with id ${id} not found`);
            }
            return product;
        }
        const product = await this.productsRepository.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException(`Product with id ${id} not found`);
        }
        return product;
    }
    async create(payload) {
        if (!this.productsRepository) {
            const created = { id: (0, crypto_1.randomUUID)(), ...payload };
            this.fallbackProducts.push(created);
            return created;
        }
        const created = this.productsRepository.create(payload);
        return this.productsRepository.save(created);
    }
    async update(id, payload) {
        if (!this.productsRepository) {
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
        const product = await this.findOne(id);
        const merged = this.productsRepository.merge(product, payload);
        return this.productsRepository.save(merged);
    }
    async remove(id) {
        if (!this.productsRepository) {
            const index = this.fallbackProducts.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`Product with id ${id} not found`);
            }
            this.fallbackProducts.splice(index, 1);
            return;
        }
        const result = await this.productsRepository.delete(id);
        if (!result.affected) {
            throw new common_1.NotFoundException(`Product with id ${id} not found`);
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map