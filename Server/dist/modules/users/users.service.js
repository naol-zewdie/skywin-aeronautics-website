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
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto_1 = require("crypto");
const user_schema_1 = require("./schemas/user.schema");
let UsersService = class UsersService {
    userModel;
    fallbackUsers = [
        {
            id: 'u_001',
            fullName: 'Amelia Hart',
            email: 'amelia@skywin.aero',
            role: 'admin',
            status: true,
        },
        {
            id: 'u_002',
            fullName: 'Rohan Mehta',
            email: 'rohan@skywin.aero',
            role: 'operator',
            status: true,
        },
    ];
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findAll() {
        if (!this.userModel) {
            return this.fallbackUsers;
        }
        const users = await this.userModel.find().exec();
        return users.map(user => ({
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
        }));
    }
    async findOne(id) {
        if (!this.userModel) {
            const user = this.fallbackUsers.find((item) => item.id === id);
            if (!user) {
                throw new common_1.NotFoundException(`User with id ${id} not found`);
            }
            return user;
        }
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
        return {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
        };
    }
    async create(payload) {
        if (!this.userModel) {
            const created = { id: (0, crypto_1.randomUUID)(), status: true, ...payload };
            this.fallbackUsers.push(created);
            return created;
        }
        const created = new this.userModel({
            ...payload,
            audit: {
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        const saved = await created.save();
        return {
            id: saved._id.toString(),
            fullName: saved.fullName,
            email: saved.email,
            role: saved.role,
            status: saved.status,
        };
    }
    async update(id, payload) {
        if (!this.userModel) {
            const index = this.fallbackUsers.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`User with id ${id} not found`);
            }
            this.fallbackUsers[index] = { ...this.fallbackUsers[index], ...payload };
            return this.fallbackUsers[index];
        }
        const updated = await this.userModel.findByIdAndUpdate(id, {
            ...payload,
            'audit.updatedAt': new Date(),
        }, { new: true }).exec();
        if (!updated) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
        return {
            id: updated._id.toString(),
            fullName: updated.fullName,
            email: updated.email,
            role: updated.role,
            status: updated.status,
        };
    }
    async remove(id) {
        if (!this.userModel) {
            const index = this.fallbackUsers.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`User with id ${id} not found`);
            }
            this.fallbackUsers.splice(index, 1);
            return;
        }
        const result = await this.userModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map