"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const mongoose_1 = require("@nestjs/mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("../modules/users/schemas/user.schema");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userModel = app.get((0, mongoose_1.getModelToken)(user_schema_1.User.name));
    const adminPassword = await bcrypt.hash('admin123A', 12);
    const operatorPassword = await bcrypt.hash('admin123A', 12);
    const existingAdmin = await userModel.findOne({ email: 'amelia@skywin.aero' }).exec();
    if (!existingAdmin) {
        const admin = new userModel({
            fullName: 'Amelia Hart',
            email: 'amelia@skywin.aero',
            password: adminPassword,
            role: 'admin',
            status: true,
            audit: {
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        await admin.save();
        console.log('Admin user created successfully (email: amelia@skywin.aero, password: admin123A)');
    }
    else {
        console.log('Admin user already exists');
    }
    const existingOperator = await userModel.findOne({ email: 'operator@skywin.aero' }).exec();
    if (!existingOperator) {
        const operator = new userModel({
            fullName: 'Operator User',
            email: 'operator@skywin.aero',
            password: operatorPassword,
            role: 'operator',
            status: true,
            audit: {
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        await operator.save();
        console.log('Operator user created successfully (email: operator@skywin.aero, password: admin123A)');
    }
    else {
        console.log('Operator user already exists');
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed.js.map