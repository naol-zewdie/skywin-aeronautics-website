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
exports.ActivityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const activity_service_1 = require("./activity.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ActivityController = class ActivityController {
    activityService;
    constructor(activityService) {
        this.activityService = activityService;
    }
    async findAll(entityType, userId, startDate, endDate, limit) {
        return this.activityService.findAll({
            entityType,
            userId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit: limit ? parseInt(limit, 10) : 50,
        });
    }
    async getStats() {
        return this.activityService.getStats();
    }
    async getRecent(limit) {
        return this.activityService.findAll({ limit: limit ? parseInt(limit, 10) : 20 });
    }
};
exports.ActivityController = ActivityController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get activity logs with filters' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', required: false, description: 'Filter by entity type' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, description: 'Filter by user ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Limit results', type: Number }),
    __param(0, (0, common_1.Query)('entityType')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get activity statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('recent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent activity' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getRecent", null);
exports.ActivityController = ActivityController = __decorate([
    (0, swagger_1.ApiTags)('activity'),
    (0, common_1.Controller)('activity'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [activity_service_1.ActivityService])
], ActivityController);
//# sourceMappingURL=activity.controller.js.map