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
const crypto_1 = require("crypto");
const post_schema_1 = require("./schemas/post.schema");
const plainjs_1 = require("@json2csv/plainjs");
const pdfkit_1 = __importDefault(require("pdfkit"));
let PostsService = class PostsService {
    postModel;
    fallbackPosts = [
        {
            id: 'post_001',
            title: 'Skywin Aeronautics Announces New Partnership',
            content: 'We are excited to announce our partnership with leading aerospace manufacturers to bring cutting-edge technology to the industry. This collaboration will enable us to deliver enhanced products and services to our global customer base.',
            type: post_schema_1.ContentType.NEWS,
            author: 'Admin Team',
            excerpt: 'New partnership announcement with leading aerospace manufacturers',
            status: true,
            views: 150,
            tags: ['partnership', 'news', 'aerospace'],
        },
        {
            id: 'post_002',
            title: 'Understanding Aerospace Composite Materials',
            content: 'Composite materials have revolutionized the aerospace industry. In this blog post, we explore the benefits of using advanced composites in aircraft manufacturing, including weight reduction, fuel efficiency, and durability.',
            type: post_schema_1.ContentType.BLOG,
            author: 'Engineering Team',
            excerpt: 'An in-depth look at composite materials in aerospace',
            status: true,
            views: 89,
            tags: ['composites', 'materials', 'engineering'],
        },
        {
            id: 'post_003',
            title: 'Annual Aerospace Innovation Summit 2026',
            content: 'Join us for the Annual Aerospace Innovation Summit where industry leaders will discuss the future of aviation technology. Network with professionals and learn about the latest innovations.',
            type: post_schema_1.ContentType.EVENT,
            author: 'Events Team',
            excerpt: 'Annual summit bringing together aerospace innovators',
            status: true,
            views: 245,
            eventDate: new Date('2026-06-15T09:00:00Z'),
            eventLocation: 'Convention Center, Dubai',
            tags: ['summit', 'networking', 'innovation'],
        },
    ];
    constructor(postModel) {
        this.postModel = postModel;
    }
    async findAll(filters) {
        let posts = this.fallbackPosts;
        if (this.postModel) {
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
            const dbPosts = await this.postModel.find(query).exec();
            posts = dbPosts.map((post) => this.mapToDto(post));
        }
        if (filters) {
            if (filters.type) {
                posts = posts.filter((p) => p.type === filters.type);
            }
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                posts = posts.filter((p) => p.title.toLowerCase().includes(searchLower) ||
                    p.content.toLowerCase().includes(searchLower) ||
                    (p.excerpt && p.excerpt.toLowerCase().includes(searchLower)));
            }
            if (filters.author) {
                const authorLower = filters.author.toLowerCase();
                posts = posts.filter((p) => p.author.toLowerCase().includes(authorLower));
            }
            if (filters.status !== undefined) {
                posts = posts.filter((p) => p.status === filters.status);
            }
            if (filters.tags && filters.tags.length > 0) {
                posts = posts.filter((p) => p.tags?.some((tag) => filters.tags.includes(tag)));
            }
        }
        return posts;
    }
    async findByType(type) {
        return this.findAll({ type });
    }
    async findOne(id) {
        if (!this.postModel) {
            const post = this.fallbackPosts.find((item) => item.id === id);
            if (!post) {
                throw new common_1.NotFoundException(`Post with id ${id} not found`);
            }
            post.views = (post.views || 0) + 1;
            return post;
        }
        const post = await this.postModel.findById(id).exec();
        if (!post) {
            throw new common_1.NotFoundException(`Post with id ${id} not found`);
        }
        await this.postModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
        post.views = (post.views || 0) + 1;
        return this.mapToDto(post);
    }
    async create(payload) {
        if (!this.postModel) {
            const created = {
                id: (0, crypto_1.randomUUID)(),
                ...payload,
                status: payload.status ?? true,
                views: 0,
            };
            this.fallbackPosts.push(created);
            return created;
        }
        const created = new this.postModel({
            ...payload,
            audit: {
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        const saved = await created.save();
        return this.mapToDto(saved);
    }
    async update(id, payload) {
        if (!this.postModel) {
            const index = this.fallbackPosts.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`Post with id ${id} not found`);
            }
            this.fallbackPosts[index] = {
                ...this.fallbackPosts[index],
                ...payload,
            };
            return this.fallbackPosts[index];
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
        if (!this.postModel) {
            const index = this.fallbackPosts.findIndex((item) => item.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException(`Post with id ${id} not found`);
            }
            this.fallbackPosts.splice(index, 1);
            return;
        }
        const result = await this.postModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Post with id ${id} not found`);
        }
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
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PostsService);
//# sourceMappingURL=posts.service.js.map