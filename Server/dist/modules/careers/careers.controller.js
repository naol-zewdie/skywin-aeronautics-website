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
exports.CareersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_career_opening_dto_1 = require("./dto/create-career-opening.dto");
const career_opening_dto_1 = require("./dto/career-opening.dto");
const update_career_opening_dto_1 = require("./dto/update-career-opening.dto");
const careers_service_1 = require("./careers.service");
let CareersController = class CareersController {
    careersService;
    constructor(careersService) {
        this.careersService = careersService;
    }
    getOpenings() {
        return this.careersService.findAll();
    }
    getOpening(id) {
        return this.careersService.findOne(id);
    }
    createOpening(payload) {
        return this.careersService.create(payload);
    }
    updateOpening(id, payload) {
        return this.careersService.update(id, payload);
    }
    removeOpening(id) {
        return this.careersService.remove(id);
    }
};
exports.CareersController = CareersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List open career positions' }),
    (0, swagger_1.ApiOkResponse)({ type: career_opening_dto_1.CareerOpeningDto, isArray: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "getOpenings", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get career opening by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    (0, swagger_1.ApiOkResponse)({ type: career_opening_dto_1.CareerOpeningDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "getOpening", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create career opening' }),
    (0, swagger_1.ApiCreatedResponse)({ type: career_opening_dto_1.CareerOpeningDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_career_opening_dto_1.CreateCareerOpeningDto]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "createOpening", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update career opening' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    (0, swagger_1.ApiOkResponse)({ type: career_opening_dto_1.CareerOpeningDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_career_opening_dto_1.UpdateCareerOpeningDto]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "updateOpening", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, swagger_1.ApiOperation)({ summary: 'Delete career opening' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'Career opening deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "removeOpening", null);
exports.CareersController = CareersController = __decorate([
    (0, swagger_1.ApiTags)('Careers'),
    (0, common_1.Controller)('careers'),
    __metadata("design:paramtypes", [careers_service_1.CareersService])
], CareersController);
//# sourceMappingURL=careers.controller.js.map