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
exports.CreateProductDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateProductDto {
    name;
    category;
    description;
    price;
    image;
    stock;
    status;
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Wing Spar Assembly', description: 'Product name' }),
    (0, class_validator_1.IsString)({ message: 'Name must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Name cannot exceed 100 characters' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Aerospace Structures', description: 'Product category' }),
    (0, class_validator_1.IsString)({ message: 'Category must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Category must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Category cannot exceed 50 characters' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s]+$/, { message: 'Category can only contain letters and spaces' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'High-precision wing spar for commercial aircraft', description: 'Product description' }),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    (0, class_validator_1.MinLength)(10, { message: 'Description must be at least 10 characters' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Description cannot exceed 1000 characters' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15000.99, description: 'Product price' }),
    (0, class_validator_1.IsNumber)({}, { message: 'Price must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Price cannot be negative' }),
    (0, class_validator_1.Max)(1000000, { message: 'Price cannot exceed 1,000,000' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/images/wing-spar.jpg', description: 'Product image URL' }),
    (0, class_validator_1.IsUrl)({}, { message: 'Image must be a valid URL' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Image URL cannot exceed 500 characters' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25, description: 'Product stock quantity' }),
    (0, class_validator_1.IsNumber)({}, { message: 'Stock must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Stock cannot be negative' }),
    (0, class_validator_1.Max)(100000, { message: 'Stock cannot exceed 100,000' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "stock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Product status', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Status must be a boolean value' }),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "status", void 0);
//# sourceMappingURL=create-product.dto.js.map