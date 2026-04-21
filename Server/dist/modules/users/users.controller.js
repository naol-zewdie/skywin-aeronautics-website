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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const user_dto_1 = require("./dto/user.dto");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    getUsers() {
        return this.usersService.findAll();
    }
    getUser(id) {
        return this.usersService.findOne(id);
    }
    createUser(payload) {
        return this.usersService.create(payload);
    }
    updateUser(id, payload) {
        const req = this.req || {};
        const currentUserId = req.user?.sub;
        return this.usersService.update(id, payload, currentUserId);
    }
    removeUser(id) {
        const req = this.req || {};
        const currentUserId = req.user?.sub;
        return this.usersService.remove(id, currentUserId);
    }
    async exportCsv(res, search) {
        const users = await this.usersService.findAll();
        const csv = this.usersService.exportToCsv(users);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.send(csv);
    }
    async exportPdf(res, search) {
        const users = await this.usersService.findAll();
        const pdfBuffer = await this.usersService.exportToPdf(users);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=users.pdf');
        res.send(pdfBuffer);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'List all users (Admin only)' }),
    (0, swagger_1.ApiOkResponse)({ type: user_dto_1.UserDto, isArray: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by id (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'User ID' }),
    (0, swagger_1.ApiOkResponse)({ type: user_dto_1.UserDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUser", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create user (Admin only)' }),
    (0, swagger_1.ApiCreatedResponse)({ type: user_dto_1.UserDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update user (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'User ID' }),
    (0, swagger_1.ApiOkResponse)({ type: user_dto_1.UserDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'User ID' }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'User deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeUser", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Export users to CSV' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('export/pdf'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Export users to PDF' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "exportPdf", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map