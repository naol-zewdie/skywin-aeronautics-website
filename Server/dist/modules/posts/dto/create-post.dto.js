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
exports.CreatePostDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const post_schema_1 = require("../schemas/post.schema");
class CreatePostDto {
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
}
exports.CreatePostDto = CreatePostDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Breaking News: New Product Launch', description: 'Post title' }),
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Title must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Title cannot exceed 200 characters' }),
    __metadata("design:type", String)
], CreatePostDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Full content of the post...', description: 'Post content' }),
    (0, class_validator_1.IsString)({ message: 'Content must be a string' }),
    (0, class_validator_1.MinLength)(10, { message: 'Content must be at least 10 characters' }),
    __metadata("design:type", String)
], CreatePostDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'news', enum: post_schema_1.ContentType, description: 'Type of content' }),
    (0, class_validator_1.IsEnum)(post_schema_1.ContentType, { message: 'Type must be one of: news, blog, event' }),
    __metadata("design:type", String)
], CreatePostDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe', description: 'Author name' }),
    (0, class_validator_1.IsString)({ message: 'Author must be a string' }),
    (0, class_validator_1.MinLength)(1, { message: 'Author is required' }),
    __metadata("design:type", String)
], CreatePostDto.prototype, "author", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Short excerpt...', description: 'Short excerpt/summary', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Excerpt must be a string' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Excerpt cannot exceed 500 characters' }),
    __metadata("design:type", String)
], CreatePostDto.prototype, "excerpt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/image.jpg', description: 'Cover image URL', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Cover image must be a valid URL' }),
    __metadata("design:type", String)
], CreatePostDto.prototype, "coverImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['tag1', 'tag2'], description: 'Tags for the post', required: false, type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Tags must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each tag must be a string' }),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-20T10:00:00Z', description: 'Event date (for events)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)({ message: 'Event date must be a valid date' }),
    __metadata("design:type", Date)
], CreatePostDto.prototype, "eventDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New York, NY', description: 'Event location (for events)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Event location must be a string' }),
    __metadata("design:type", String)
], CreatePostDto.prototype, "eventLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Post status', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Status must be a boolean' }),
    __metadata("design:type", Boolean)
], CreatePostDto.prototype, "status", void 0);
//# sourceMappingURL=create-post.dto.js.map