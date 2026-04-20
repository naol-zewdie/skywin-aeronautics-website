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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const post_schema_1 = require("../schemas/post.schema");
class PostDto {
    id;
    title;
    content;
    type;
    author;
    excerpt;
    coverImage;
    tags;
    eventDate;
    eventLocation;
    status;
    views;
}
exports.PostDto = PostDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'post_001' }),
    __metadata("design:type", String)
], PostDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Breaking News: New Product Launch' }),
    __metadata("design:type", String)
], PostDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Full content of the post...' }),
    __metadata("design:type", String)
], PostDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'news', enum: ['news', 'blog', 'event'] }),
    __metadata("design:type", String)
], PostDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    __metadata("design:type", String)
], PostDto.prototype, "author", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Short excerpt...', required: false }),
    __metadata("design:type", String)
], PostDto.prototype, "excerpt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/image.jpg', required: false }),
    __metadata("design:type", String)
], PostDto.prototype, "coverImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['tag1', 'tag2'], required: false, type: [String] }),
    __metadata("design:type", Array)
], PostDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-20T10:00:00Z', required: false }),
    __metadata("design:type", Date)
], PostDto.prototype, "eventDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New York, NY', required: false }),
    __metadata("design:type", String)
], PostDto.prototype, "eventLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], PostDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, required: false }),
    __metadata("design:type", Number)
], PostDto.prototype, "views", void 0);
//# sourceMappingURL=post.dto.js.map