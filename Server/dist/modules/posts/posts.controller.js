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
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_post_dto_1 = require("./dto/create-post.dto");
const post_dto_1 = require("./dto/post.dto");
const update_post_dto_1 = require("./dto/update-post.dto");
const posts_service_1 = require("./posts.service");
const post_schema_1 = require("./schemas/post.schema");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
let PostsController = class PostsController {
    postsService;
    constructor(postsService) {
        this.postsService = postsService;
    }
    getPosts(type, search, author, status, tags) {
        const tagArray = tags ? tags.split(',').map(t => t.trim()) : undefined;
        return this.postsService.findAll({
            type,
            search,
            author,
            status: status !== undefined ? status === 'true' : undefined,
            tags: tagArray,
        });
    }
    getPostsByType(type) {
        return this.postsService.findByType(type);
    }
    async exportCsv(res, type, search, author) {
        const posts = await this.postsService.findAll({ type, search, author });
        const csv = this.postsService.exportToCsv(posts);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=posts.csv');
        res.send(csv);
    }
    async exportPdf(res, type, search, author) {
        const posts = await this.postsService.findAll({ type, search, author });
        const pdfBuffer = await this.postsService.exportToPdf(posts);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=posts.pdf');
        res.send(pdfBuffer);
    }
    getPost(id) {
        return this.postsService.findOne(id);
    }
    createPost(payload) {
        return this.postsService.create(payload);
    }
    updatePost(id, payload) {
        return this.postsService.update(id, payload);
    }
    removePost(id) {
        return this.postsService.remove(id);
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR, roles_guard_1.Role.VIEWER),
    (0, swagger_1.ApiOperation)({
        summary: 'List all posts with optional filters',
        description: 'Get all posts with filtering by type, search, author, status, and tags',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        enum: post_schema_1.ContentType,
        description: 'Filter by content type (news, blog, event)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search in title, content, and excerpt' }),
    (0, swagger_1.ApiQuery)({ name: 'author', required: false, description: 'Filter by author' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by status (true/false)' }),
    (0, swagger_1.ApiQuery)({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' }),
    (0, swagger_1.ApiOkResponse)({ type: post_dto_1.PostDto, isArray: true }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('author')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('tags')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getPosts", null);
__decorate([
    (0, common_1.Get)('by-type/:type'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR, roles_guard_1.Role.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get posts by content type' }),
    (0, swagger_1.ApiParam)({ name: 'type', enum: post_schema_1.ContentType, description: 'Content type' }),
    (0, swagger_1.ApiOkResponse)({ type: post_dto_1.PostDto, isArray: true }),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getPostsByType", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Export posts to CSV' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: post_schema_1.ContentType }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'author', required: false }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('author')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('export/pdf'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Export posts to PDF' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: post_schema_1.ContentType }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'author', required: false }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('author')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "exportPdf", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR, roles_guard_1.Role.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get post by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Post ID' }),
    (0, swagger_1.ApiOkResponse)({ type: post_dto_1.PostDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getPost", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create new post' }),
    (0, swagger_1.ApiCreatedResponse)({ type: post_dto_1.PostDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dto_1.CreatePostDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createPost", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update post' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Post ID' }),
    (0, swagger_1.ApiOkResponse)({ type: post_dto_1.PostDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_post_dto_1.UpdatePostDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "updatePost", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete post (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Post ID' }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'Post deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "removePost", null);
exports.PostsController = PostsController = __decorate([
    (0, swagger_1.ApiTags)('Posts'),
    (0, common_1.Controller)('posts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map