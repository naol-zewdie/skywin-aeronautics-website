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
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const service_entity_1 = require("./entities/service.entity");
const typeorm_2 = require("typeorm");
let ServicesService = class ServicesService {
    servicesRepository;
    fallbackServices = [
        {
            id: 's_001',
            name: 'Precision CNC Machining',
            description: 'High-accuracy machining for aerospace-grade components.',
        },
        {
            id: 's_002',
            name: 'Composite Fabrication',
            description: 'Lightweight, high-strength composite structure production.',
        },
    ];
    constructor(servicesRepository) {
        this.servicesRepository = servicesRepository;
    }
    async findAll() {
        if (!this.servicesRepository) {
            return this.fallbackServices;
        }
        return this.servicesRepository.find();
    }
    async findOne(id) {
        if (!this.servicesRepository) {
            const service = this.fallbackServices.find((item) => item.id === id);
            if (!service) {
                throw new common_1.NotFoundException(`Service with id ${id} not found`);
            }
            return service;
        }
        const service = await this.servicesRepository.findOne({ where: { id } });
        if (!service) {
            throw new common_1.NotFoundException(`Service with id ${id} not found`);
        }
        return service;
    }
    async create(payload) {
        if (!this.servicesRepository) {
            const created = { id: (0, crypto_1.randomUUID)(), ...payload };
            this.fallbackServices.push(created);
            return created;
        }
        const created = this.servicesRepository.create(payload);
        return this.servicesRepository.save(created);
    }
    async update(id, payload) {
        if (!this.servicesRepository) {
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
        const service = await this.findOne(id);
        const merged = this.servicesRepository.merge(service, payload);
        return this.servicesRepository.save(merged);
    }
    async remove(id) {
        if (!this.servicesRepository) {
            const index = this.fallbackServices.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`Service with id ${id} not found`);
            }
            this.fallbackServices.splice(index, 1);
            return;
        }
        const result = await this.servicesRepository.delete(id);
        if (!result.affected) {
            throw new common_1.NotFoundException(`Service with id ${id} not found`);
        }
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, typeorm_1.InjectRepository)(service_entity_1.ServiceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ServicesService);
//# sourceMappingURL=services.service.js.map