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
exports.ServiceSchema = exports.Service = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const audit_schema_1 = require("../../../common/schemas/audit.schema");
let Service = class Service {
    name;
    description;
    status;
    audit;
};
exports.Service = Service;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Service.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Service.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], Service.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: audit_schema_1.Audit }),
    __metadata("design:type", audit_schema_1.Audit)
], Service.prototype, "audit", void 0);
exports.Service = Service = __decorate([
    (0, mongoose_1.Schema)()
], Service);
exports.ServiceSchema = mongoose_1.SchemaFactory.createForClass(Service);
//# sourceMappingURL=service.schema.js.map