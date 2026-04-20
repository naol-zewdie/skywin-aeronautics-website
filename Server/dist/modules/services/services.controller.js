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
exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_service_dto_1 = require("./dto/create-service.dto");
const service_dto_1 = require("./dto/service.dto");
const update_service_dto_1 = require("./dto/update-service.dto");
const services_service_1 = require("./services.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
let ServicesController = class ServicesController {
    servicesService;
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    getServices() {
        return this.servicesService.findAll();
    }
    getService(id) {
        return this.servicesService.findOne(id);
    }
    createService(payload) {
        return this.servicesService.create(payload);
    }
    updateService(id, payload) {
        return this.servicesService.update(id, payload);
    }
    removeService(id) {
        return this.servicesService.remove(id);
    }
};
exports.ServicesController = ServicesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR, roles_guard_1.Role.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'List all services' }),
    (0, swagger_1.ApiOkResponse)({ type: service_dto_1.ServiceDto, isArray: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "getServices", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR, roles_guard_1.Role.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get service by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Service ID' }),
    (0, swagger_1.ApiOkResponse)({ type: service_dto_1.ServiceDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "getService", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create service' }),
    (0, swagger_1.ApiCreatedResponse)({ type: service_dto_1.ServiceDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_dto_1.CreateServiceDto]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "createService", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update service' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Service ID' }),
    (0, swagger_1.ApiOkResponse)({ type: service_dto_1.ServiceDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_service_dto_1.UpdateServiceDto]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "updateService", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete service (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Service ID' }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'Service deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "removeService", null);
exports.ServicesController = ServicesController = __decorate([
    (0, swagger_1.ApiTags)('Services'),
    (0, common_1.Controller)('services'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], ServicesController);
//# sourceMappingURL=services.controller.js.map