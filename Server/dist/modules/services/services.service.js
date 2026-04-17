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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto_1 = require("crypto");
const service_schema_1 = require("./schemas/service.schema");
let ServicesService = class ServicesService {
    serviceModel;
    fallbackServices = [
        {
            id: 's_001',
            name: 'Precision CNC Machining',
            description: 'High-accuracy machining for aerospace-grade components.',
            status: true,
        },
        {
            id: 's_002',
            name: 'Composite Fabrication',
            description: 'Lightweight, high-strength composite structure production.',
            status: true,
        },
    ];
    constructor(serviceModel) {
        this.serviceModel = serviceModel;
    }
    async findAll() {
        if (!this.serviceModel) {
            return this.fallbackServices;
        }
        const services = await this.serviceModel.find().exec();
        return services.map(service => ({
            id: service._id.toString(),
            name: service.name,
            description: service.description,
            status: service.status,
        }));
    }
    async findOne(id) {
        if (!this.serviceModel) {
            const service = this.fallbackServices.find((item) => item.id === id);
            if (!service) {
                throw new common_1.NotFoundException(`Service with id ${id} not found`);
            }
            return service;
        }
        const service = await this.serviceModel.findById(id).exec();
        if (!service) {
            throw new common_1.NotFoundException(`Service with id ${id} not found`);
        }
        return {
            id: service._id.toString(),
            name: service.name,
            description: service.description,
            status: service.status,
        };
    }
    async create(payload) {
        if (!this.serviceModel) {
            const created = { id: (0, crypto_1.randomUUID)(), status: true, ...payload };
            this.fallbackServices.push(created);
            return created;
        }
        const created = new this.serviceModel({
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
            description: saved.description,
            status: saved.status,
        };
    }
    async update(id, payload) {
        if (!this.serviceModel) {
            const index = this.fallbackServices.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`Service with id ${id} not found`);
            }
            this.fallbackServices[index] = {
                ...this.fallbackServices[index],
                ...payload,
            };
            return this.fallbackServices[index];
        }
        const updated = await this.serviceModel.findByIdAndUpdate(id, {
            ...payload,
            'audit.updatedAt': new Date(),
        }, { new: true }).exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Service with id ${id} not found`);
        }
        return {
            id: updated._id.toString(),
            name: updated.name,
            description: updated.description,
            status: updated.status,
        };
    }
    async remove(id) {
        if (!this.serviceModel) {
            const index = this.fallbackServices.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`Service with id ${id} not found`);
            }
            this.fallbackServices.splice(index, 1);
            return;
        }
        const result = await this.serviceModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Service with id ${id} not found`);
        }
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(service_schema_1.Service.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ServicesService);
//# sourceMappingURL=services.service.js.map