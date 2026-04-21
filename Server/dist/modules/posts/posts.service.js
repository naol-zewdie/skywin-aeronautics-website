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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const post_schema_1 = require("./schemas/post.schema");
const plainjs_1 = require("@json2csv/plainjs");
const pdfkit_1 = __importDefault(require("pdfkit"));
let PostsService = class PostsService {
    postModel;
    constructor(postModel) {
        this.postModel = postModel;
    }
    async findAll(filters) {
        const query = {};
        if (filters?.type) {
            query.type = filters.type;
        }
        if (filters?.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
                { content: { $regex: filters.search, $options: 'i' } },
                { excerpt: { $regex: filters.search, $options: 'i' } },
            ];
        }
        if (filters?.author) {
            query.author = { $regex: filters.author, $options: 'i' };
        }
        if (filters?.status !== undefined) {
            query.status = filters.status;
        }
        if (filters?.tags && filters.tags.length > 0) {
            query.tags = { $in: filters.tags };
        }
        const posts = await this.postModel.find(query).exec();
        return posts.map((post) => this.mapToDto(post));
    }
    async findByType(type) {
        return this.findAll({ type });
    }
    async findOne(id) {
        const post = await this.postModel.findById(id).exec();
        if (!post) {
            throw new common_1.NotFoundException(`Post with id ${id} not found`);
        }
        await this.postModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
        post.views = (post.views || 0) + 1;
        return this.mapToDto(post);
    }
    async create(payload, userRole) {
        const status = userRole === 'admin' ? (payload.status ?? false) : false;
        const created = new this.postModel({
            ...payload,
            status,
            audit: {
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        const saved = await created.save();
        return this.mapToDto(saved);
    }
    async update(id, payload, userRole) {
        if (userRole !== 'admin' && payload.status !== undefined) {
            delete payload.status;
        }
        const updated = await this.postModel
            .findByIdAndUpdate(id, {
            ...payload,
            'audit.updatedAt': new Date(),
        }, { new: true })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Post with id ${id} not found`);
        }
        return this.mapToDto(updated);
    }
    async remove(id) {
        const result = await this.postModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Post with id ${id} not found`);
        }
    }
    async toggleStatus(id) {
        const post = await this.postModel.findById(id).exec();
        if (!post) {
            throw new common_1.NotFoundException(`Post with id ${id} not found`);
        }
        post.status = !post.status;
        post.audit.updatedAt = new Date();
        const saved = await post.save();
        return this.mapToDto(saved);
    }
    exportToCsv(posts) {
        const fields = [
            'id',
            'title',
            'type',
            'author',
            'excerpt',
            'status',
            'views',
            'eventDate',
            'eventLocation',
            'tags',
        ];
        const opts = { fields };
        const parser = new plainjs_1.Parser(opts);
        return parser.parse(posts);
    }
    exportToPdf(posts) {
        const doc = new pdfkit_1.default();
        const chunks = [];
        return new Promise((resolve, reject) => {
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(24).text('Content Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, {
                align: 'center',
            });
            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();
            posts.forEach((post, index) => {
                if (doc.y > 700) {
                    doc.addPage();
                }
                doc.fontSize(16).text(post.title, { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10);
                doc.text(`Type: ${post.type.toUpperCase()}`, { continued: true });
                doc.text(`    Author: ${post.author}`, { continued: true });
                doc.text(`    Status: ${post.status ? 'Active' : 'Inactive'}`);
                doc.text(`Views: ${post.views || 0}`);
                if (post.eventDate) {
                    doc.text(`Event Date: ${new Date(post.eventDate).toLocaleDateString()}`);
                }
                if (post.eventLocation) {
                    doc.text(`Location: ${post.eventLocation}`);
                }
                if (post.tags && post.tags.length > 0) {
                    doc.text(`Tags: ${post.tags.join(', ')}`);
                }
                doc.moveDown(0.5);
                const contentPreview = post.content.substring(0, 300);
                doc.text(contentPreview + (post.content.length > 300 ? '...' : ''), {
                    align: 'justify',
                });
                doc.moveDown();
                if (post.excerpt) {
                    doc.fontSize(9).fillColor('gray').text(`Excerpt: ${post.excerpt}`);
                    doc.fillColor('black');
                    doc.moveDown();
                }
                if (index < posts.length - 1) {
                    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                    doc.moveDown();
                }
            });
            doc.end();
        });
    }
    mapToDto(post) {
        return {
            id: post._id ? post._id.toString() : post.id,
            title: post.title,
            content: post.content,
            type: post.type,
            author: post.author,
            excerpt: post.excerpt,
            coverImage: post.coverImage,
            tags: post.tags,
            eventDate: post.eventDate,
            eventLocation: post.eventLocation,
            status: post.status,
            views: post.views,
        };
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PostsService);
//# sourceMappingURL=posts.service.js.map