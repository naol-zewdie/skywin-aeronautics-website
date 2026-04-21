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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const plainjs_1 = require("@json2csv/plainjs");
const pdfkit_1 = __importDefault(require("pdfkit"));
const service_schema_1 = require("./schemas/service.schema");
let ServicesService = class ServicesService {
    serviceModel;
    constructor(serviceModel) {
        this.serviceModel = serviceModel;
    }
    async findAll() {
        const services = await this.serviceModel.find().exec();
        return services.map(service => ({
            id: service._id.toString(),
            name: service.name,
            description: service.description,
            status: service.status,
        }));
    }
    async findOne(id) {
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
    async create(payload, userRole) {
        const status = userRole === 'admin' ? (payload.status ?? false) : false;
        const created = new this.serviceModel({
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
            description: saved.description,
            status: saved.status,
        };
    }
    async update(id, payload, userRole) {
        if (userRole !== 'admin' && payload.status !== undefined) {
            delete payload.status;
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
        const result = await this.serviceModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Service with id ${id} not found`);
        }
    }
    async toggleStatus(id) {
        const service = await this.serviceModel.findById(id).exec();
        if (!service) {
            throw new common_1.NotFoundException(`Service with id ${id} not found`);
        }
        service.status = !service.status;
        service.audit.updatedAt = new Date();
        const saved = await service.save();
        return {
            id: saved._id.toString(),
            name: saved.name,
            description: saved.description,
            status: saved.status,
        };
    }
    exportToCsv(services) {
        const fields = ['id', 'name', 'description', 'status'];
        const opts = { fields };
        const parser = new plainjs_1.Parser(opts);
        return parser.parse(services);
    }
    exportToPdf(services) {
        const doc = new pdfkit_1.default();
        const chunks = [];
        return new Promise((resolve, reject) => {
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(24).text('Services Catalog', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();
            services.forEach((service, index) => {
                if (doc.y > 700) {
                    doc.addPage();
                }
                doc.fontSize(16).font('Helvetica-Bold').text(`${index + 1}. ${service.name}`, { continued: false });
                doc.moveDown(0.5);
                doc.fontSize(12).font('Helvetica').text(`Description: ${service.description}`);
                doc.moveDown(0.3);
                doc.fontSize(12).text(`Status: ${service.status ? 'Active' : 'Inactive'}`);
                doc.moveDown(1);
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(1);
            });
            doc.end();
        });
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(service_schema_1.Service.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ServicesService);
//# sourceMappingURL=services.service.js.map