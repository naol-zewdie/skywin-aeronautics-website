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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto_1 = require("crypto");
const plainjs_1 = require("@json2csv/plainjs");
const pdfkit_1 = __importDefault(require("pdfkit"));
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
    async update(id, payload, currentUserId) {
        const targetUser = await this.findOne(id);
        if (targetUser.role === 'admin' && currentUserId !== id) {
            throw new Error('Cannot edit another admin account');
        }
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
    async remove(id, currentUserId) {
        if (id === currentUserId) {
            throw new Error('Cannot delete your own account');
        }
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
    exportToCsv(users) {
        const fields = ['id', 'fullName', 'email', 'role', 'status'];
        const opts = { fields };
        const parser = new plainjs_1.Parser(opts);
        return parser.parse(users);
    }
    exportToPdf(users) {
        const doc = new pdfkit_1.default();
        const chunks = [];
        return new Promise((resolve, reject) => {
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(24).text('Users List', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();
            users.forEach((user, index) => {
                if (doc.y > 700) {
                    doc.addPage();
                }
                doc.fontSize(16).font('Helvetica-Bold').text(`${index + 1}. ${user.fullName}`, { continued: false });
                doc.moveDown(0.5);
                doc.fontSize(12).font('Helvetica').text(`Email: ${user.email}`);
                doc.moveDown(0.3);
                doc.fontSize(12).text(`Role: ${user.role}`);
                doc.moveDown(0.3);
                doc.fontSize(12).text(`Status: ${user.status ? 'Active' : 'Inactive'}`);
                doc.moveDown(1);
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(1);
            });
            doc.end();
        });
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