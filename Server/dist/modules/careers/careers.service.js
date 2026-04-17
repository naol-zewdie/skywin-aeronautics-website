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
exports.CareersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const career_opening_entity_1 = require("./entities/career-opening.entity");
const typeorm_2 = require("typeorm");
let CareersService = class CareersService {
    careersRepository;
    fallbackOpenings = [
        {
            id: 'c_001',
            title: 'Manufacturing Engineer',
            location: 'Bangalore, India',
            employmentType: 'Full-time',
        },
        {
            id: 'c_002',
            title: 'Quality Assurance Specialist',
            location: 'Pune, India',
            employmentType: 'Full-time',
        },
    ];
    constructor(careersRepository) {
        this.careersRepository = careersRepository;
    }
    async findAll() {
        if (!this.careersRepository) {
            return this.fallbackOpenings;
        }
        return this.careersRepository.find();
    }
    async findOne(id) {
        if (!this.careersRepository) {
            const opening = this.fallbackOpenings.find((item) => item.id === id);
            if (!opening) {
                throw new common_1.NotFoundException(`Career opening with id ${id} not found`);
            }
            return opening;
        }
        const opening = await this.careersRepository.findOne({ where: { id } });
        if (!opening) {
            throw new common_1.NotFoundException(`Career opening with id ${id} not found`);
        }
        return opening;
    }
    async create(payload) {
        if (!this.careersRepository) {
            const created = { id: (0, crypto_1.randomUUID)(), ...payload };
            this.fallbackOpenings.push(created);
            return created;
        }
        const created = this.careersRepository.create(payload);
        return this.careersRepository.save(created);
    }
    async update(id, payload) {
        if (!this.careersRepository) {
            const index = this.fallbackOpenings.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`Career opening with id ${id} not found`);
            }
            this.fallbackOpenings[index] = {
                ...this.fallbackOpenings[index],
                ...payload,
            };
            return this.fallbackOpenings[index];
        }
        const opening = await this.findOne(id);
        const merged = this.careersRepository.merge(opening, payload);
        return this.careersRepository.save(merged);
    }
    async remove(id) {
        if (!this.careersRepository) {
            const index = this.fallbackOpenings.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`Career opening with id ${id} not found`);
            }
            this.fallbackOpenings.splice(index, 1);
            return;
        }
        const result = await this.careersRepository.delete(id);
        if (!result.affected) {
            throw new common_1.NotFoundException(`Career opening with id ${id} not found`);
        }
    }
};
exports.CareersService = CareersService;
exports.CareersService = CareersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, typeorm_1.InjectRepository)(career_opening_entity_1.CareerOpeningEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CareersService);
//# sourceMappingURL=careers.service.js.map