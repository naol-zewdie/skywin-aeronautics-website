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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
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
    createOpening(payload, req) {
        return this.careersService.create(payload, req.user?.role);
    }
    toggleOpeningStatus(id) {
        return this.careersService.toggleStatus(id);
    }
    updateOpening(id, payload, req) {
        return this.careersService.update(id, payload, req.user?.role);
    }
    removeOpening(id) {
        return this.careersService.remove(id);
    }
    async exportCsv(res, search) {
        const openings = await this.careersService.findAll();
        const csv = this.careersService.exportToCsv(openings);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=careers.csv');
        res.send(csv);
    }
    async exportPdf(res, search) {
        const openings = await this.careersService.findAll();
        const pdfBuffer = await this.careersService.exportToPdf(openings);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=careers.pdf');
        res.send(pdfBuffer);
    }
};
exports.CareersController = CareersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR, roles_guard_1.Role.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'List open career positions' }),
    (0, swagger_1.ApiOkResponse)({ type: career_opening_dto_1.CareerOpeningDto, isArray: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "getOpenings", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR, roles_guard_1.Role.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get career opening by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Career Opening ID' }),
    (0, swagger_1.ApiOkResponse)({ type: career_opening_dto_1.CareerOpeningDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "getOpening", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create career opening' }),
    (0, swagger_1.ApiCreatedResponse)({ type: career_opening_dto_1.CareerOpeningDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_career_opening_dto_1.CreateCareerOpeningDto, Object]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "createOpening", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle career opening status (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Career Opening ID' }),
    (0, swagger_1.ApiOkResponse)({ type: career_opening_dto_1.CareerOpeningDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "toggleOpeningStatus", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update career opening' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Career Opening ID' }),
    (0, swagger_1.ApiOkResponse)({ type: career_opening_dto_1.CareerOpeningDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_career_opening_dto_1.UpdateCareerOpeningDto, Object]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "updateOpening", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete career opening' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Career Opening ID' }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'Career opening deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "removeOpening", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Export career openings to CSV' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('export/pdf'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Export career openings to PDF' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "exportPdf", null);
exports.CareersController = CareersController = __decorate([
    (0, swagger_1.ApiTags)('Careers'),
    (0, common_1.Controller)('careers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [careers_service_1.CareersService])
], CareersController);
//# sourceMappingURL=careers.controller.js.map