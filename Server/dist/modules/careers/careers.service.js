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
exports.CareersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto_1 = require("crypto");
const plainjs_1 = require("@json2csv/plainjs");
const pdfkit_1 = __importDefault(require("pdfkit"));
const career_opening_schema_1 = require("./schemas/career-opening.schema");
let CareersService = class CareersService {
    careerOpeningModel;
    fallbackOpenings = [
        {
            id: 'c_001',
            title: 'Manufacturing Engineer',
            location: 'Bangalore, India',
            employmentType: 'Full-time',
            description: 'Responsible for aerospace component manufacturing and quality control',
            status: true,
        },
        {
            id: 'c_002',
            title: 'Quality Assurance Specialist',
            location: 'Pune, India',
            employmentType: 'Full-time',
            description: 'Ensure compliance with aerospace quality standards',
            status: true,
        },
    ];
    constructor(careerOpeningModel) {
        this.careerOpeningModel = careerOpeningModel;
    }
    async findAll() {
        if (!this.careerOpeningModel) {
            return this.fallbackOpenings;
        }
        const openings = await this.careerOpeningModel.find().exec();
        return openings.map(opening => ({
            id: opening._id.toString(),
            title: opening.title,
            location: opening.location,
            employmentType: opening.employmentType,
            description: opening.description,
            status: opening.status,
        }));
    }
    async findOne(id) {
        if (!this.careerOpeningModel) {
            const opening = this.fallbackOpenings.find((item) => item.id === id);
            if (!opening) {
                throw new common_1.NotFoundException(`Career opening with id ${id} not found`);
            }
            return opening;
        }
        const opening = await this.careerOpeningModel.findById(id).exec();
        if (!opening) {
            throw new common_1.NotFoundException(`Career opening with id ${id} not found`);
        }
        return {
            id: opening._id.toString(),
            title: opening.title,
            location: opening.location,
            employmentType: opening.employmentType,
            description: opening.description,
            status: opening.status,
        };
    }
    async create(payload) {
        if (!this.careerOpeningModel) {
            const created = { id: (0, crypto_1.randomUUID)(), status: true, ...payload };
            this.fallbackOpenings.push(created);
            return created;
        }
        const created = new this.careerOpeningModel({
            ...payload,
            audit: {
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        const saved = await created.save();
        return {
            id: saved._id.toString(),
            title: saved.title,
            location: saved.location,
            employmentType: saved.employmentType,
            description: saved.description,
            status: saved.status,
        };
    }
    async update(id, payload) {
        if (!this.careerOpeningModel) {
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
        const updated = await this.careerOpeningModel.findByIdAndUpdate(id, {
            ...payload,
            'audit.updatedAt': new Date(),
        }, { new: true }).exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Career opening with id ${id} not found`);
        }
        return {
            id: updated._id.toString(),
            title: updated.title,
            location: updated.location,
            employmentType: updated.employmentType,
            description: updated.description,
            status: updated.status,
        };
    }
    async remove(id) {
        if (!this.careerOpeningModel) {
            const index = this.fallbackOpenings.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`Career opening with id ${id} not found`);
            }
            this.fallbackOpenings.splice(index, 1);
            return;
        }
        const result = await this.careerOpeningModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Career opening with id ${id} not found`);
        }
    }
    exportToCsv(openings) {
        const fields = ['id', 'title', 'location', 'employmentType', 'description', 'status'];
        const opts = { fields };
        const parser = new plainjs_1.Parser(opts);
        return parser.parse(openings);
    }
    exportToPdf(openings) {
        const doc = new pdfkit_1.default();
        const chunks = [];
        return new Promise((resolve, reject) => {
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(24).text('Career Openings', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();
            openings.forEach((opening, index) => {
                if (doc.y > 700) {
                    doc.addPage();
                }
                doc.fontSize(16).font('Helvetica-Bold').text(`${index + 1}. ${opening.title}`, { continued: false });
                doc.moveDown(0.5);
                doc.fontSize(12).font('Helvetica').text(`Location: ${opening.location}`);
                doc.moveDown(0.3);
                doc.fontSize(12).text(`Employment Type: ${opening.employmentType}`);
                doc.moveDown(0.3);
                doc.fontSize(12).text(`Description: ${opening.description}`);
                doc.moveDown(0.3);
                doc.fontSize(12).text(`Status: ${opening.status ? 'Active' : 'Inactive'}`);
                doc.moveDown(1);
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(1);
            });
            doc.end();
        });
    }
};
exports.CareersService = CareersService;
exports.CareersService = CareersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(career_opening_schema_1.CareerOpening.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CareersService);
//# sourceMappingURL=careers.service.js.map