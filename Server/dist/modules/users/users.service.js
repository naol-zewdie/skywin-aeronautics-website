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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("typeorm");
let UsersService = class UsersService {
    usersRepository;
    fallbackUsers = [
        {
            id: 'u_001',
            fullName: 'Amelia Hart',
            email: 'amelia@skywin.aero',
            role: 'admin',
        },
        {
            id: 'u_002',
            fullName: 'Rohan Mehta',
            email: 'rohan@skywin.aero',
            role: 'operator',
        },
    ];
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findAll() {
        if (!this.usersRepository) {
            return this.fallbackUsers;
        }
        return this.usersRepository.find();
    }
    async findOne(id) {
        if (!this.usersRepository) {
            const user = this.fallbackUsers.find((item) => item.id === id);
            if (!user) {
                throw new common_1.NotFoundException(`User with id ${id} not found`);
            }
            return user;
        }
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
        return user;
    }
    async create(payload) {
        if (!this.usersRepository) {
            const created = { id: (0, crypto_1.randomUUID)(), ...payload };
            this.fallbackUsers.push(created);
            return created;
        }
        const created = this.usersRepository.create(payload);
        return this.usersRepository.save(created);
    }
    async update(id, payload) {
        if (!this.usersRepository) {
            const index = this.fallbackUsers.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`User with id ${id} not found`);
            }
            this.fallbackUsers[index] = { ...this.fallbackUsers[index], ...payload };
            return this.fallbackUsers[index];
        }
        const user = await this.findOne(id);
        const merged = this.usersRepository.merge(user, payload);
        return this.usersRepository.save(merged);
    }
    async remove(id) {
        if (!this.usersRepository) {
            const index = this.fallbackUsers.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`User with id ${id} not found`);
            }
            this.fallbackUsers.splice(index, 1);
            return;
        }
        const result = await this.usersRepository.delete(id);
        if (!result.affected) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map