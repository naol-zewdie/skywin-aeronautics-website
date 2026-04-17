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
exports.CreateCareerOpeningDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCareerOpeningDto {
    title;
    location;
    employmentType;
    description;
    status;
}
exports.CreateCareerOpeningDto = CreateCareerOpeningDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Manufacturing Engineer', description: 'Job title' }),
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    (0, class_validator_1.MinLength)(3, { message: 'Title must be at least 3 characters' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Title cannot exceed 100 characters' }),
    __metadata("design:type", String)
], CreateCareerOpeningDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bangalore, India', description: 'Job location' }),
    (0, class_validator_1.IsString)({ message: 'Location must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Location must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Location cannot exceed 100 characters' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s,.'-]+$/, { message: 'Location contains invalid characters' }),
    __metadata("design:type", String)
], CreateCareerOpeningDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Full-time', description: 'Employment type', enum: ['Full-time', 'Part-time', 'Contract', 'Internship'] }),
    (0, class_validator_1.IsString)({ message: 'Employment type must be a string' }),
    (0, class_validator_1.IsIn)(['Full-time', 'Part-time', 'Contract', 'Internship'], { message: 'Employment type must be Full-time, Part-time, Contract, or Internship' }),
    __metadata("design:type", String)
], CreateCareerOpeningDto.prototype, "employmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Responsible for aerospace component manufacturing and quality control', description: 'Job description' }),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    (0, class_validator_1.MinLength)(20, { message: 'Description must be at least 20 characters' }),
    (0, class_validator_1.MaxLength)(2000, { message: 'Description cannot exceed 2000 characters' }),
    __metadata("design:type", String)
], CreateCareerOpeningDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Opening status', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Status must be a boolean value' }),
    __metadata("design:type", Boolean)
], CreateCareerOpeningDto.prototype, "status", void 0);
//# sourceMappingURL=create-career-opening.dto.js.map