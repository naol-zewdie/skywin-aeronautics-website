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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_product_dto_1 = require("./dto/create-product.dto");
const product_dto_1 = require("./dto/product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const products_service_1 = require("./products.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    getProducts(search, category, minPrice, maxPrice, status) {
        return this.productsService.findAll({
            search,
            category,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            status: status !== undefined ? status === 'true' : undefined,
        });
    }
    async exportCsv(res, search, category) {
        const products = await this.productsService.findAll({ search, category });
        const csv = this.productsService.exportToCsv(products);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
        res.send(csv);
    }
    async exportPdf(res, search, category) {
        const products = await this.productsService.findAll({ search, category });
        const pdfBuffer = await this.productsService.exportToPdf(products);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=products.pdf');
        res.send(pdfBuffer);
    }
    getProduct(id) {
        return this.productsService.findOne(id);
    }
    createProduct(payload, req) {
        return this.productsService.create(payload, req.user?.role);
    }
    toggleProductStatus(id) {
        return this.productsService.toggleStatus(id);
    }
    updateProduct(id, payload, req) {
        return this.productsService.update(id, payload, req.user?.role);
    }
    removeProduct(id) {
        return this.productsService.remove(id);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR, roles_guard_1.Role.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'List all products with optional search and filter' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by name or description' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Filter by category' }),
    (0, swagger_1.ApiQuery)({ name: 'minPrice', required: false, description: 'Minimum price filter' }),
    (0, swagger_1.ApiQuery)({ name: 'maxPrice', required: false, description: 'Maximum price filter' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by status (true/false)' }),
    (0, swagger_1.ApiOkResponse)({ type: product_dto_1.ProductDto, isArray: true }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('minPrice')),
    __param(3, (0, common_1.Query)('maxPrice')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Export products to CSV' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('export/pdf'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Export products to PDF' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "exportPdf", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR, roles_guard_1.Role.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get product by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Product ID' }),
    (0, swagger_1.ApiOkResponse)({ type: product_dto_1.ProductDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create product' }),
    (0, swagger_1.ApiCreatedResponse)({ type: product_dto_1.ProductDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle product status (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Product ID' }),
    (0, swagger_1.ApiOkResponse)({ type: product_dto_1.ProductDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "toggleProductStatus", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update product' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Product ID' }),
    (0, swagger_1.ApiOkResponse)({ type: product_dto_1.ProductDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, roles_guard_1.Roles)(roles_guard_1.Role.ADMIN, roles_guard_1.Role.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete product' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Product ID' }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'Product deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "removeProduct", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, common_1.Controller)('products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map