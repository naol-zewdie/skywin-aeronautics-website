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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("../users/schemas/user.schema");
let AuthService = AuthService_1 = class AuthService {
    jwtService;
    userModel;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(jwtService, userModel) {
        this.jwtService = jwtService;
        this.userModel = userModel;
    }
    async validateUser(email, password) {
        const invalidCredentialsError = new common_1.UnauthorizedException('Authentication failed');
        const user = await this.userModel.findOne({ email }).exec();
        if (!user || !user.status) {
            await bcrypt.compare('dummy', '$2b$10$dummyhashfordummycomparison');
            throw invalidCredentialsError;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw invalidCredentialsError;
        }
        return {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
        };
    }
    async login(user) {
        const tokens = await this.generateTokens({
            email: user.email,
            sub: user.id,
            role: user.role,
        });
        this.logger.log(`User logged in: ${user.email} (${user.role})`);
        return {
            ...tokens,
            user,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            });
            if (payload.type !== 'refresh') {
                throw new common_1.UnauthorizedException('Invalid token type');
            }
            const user = await this.getMe(payload.sub);
            if (!user || !user.status) {
                throw new common_1.UnauthorizedException('User not found or inactive');
            }
            return this.generateTokens({
                email: payload.email,
                sub: payload.sub,
                role: payload.role,
            });
        }
        catch (error) {
            this.logger.warn('Token refresh failed', error);
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async generateTokens(payload) {
        const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
        const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({
                email: payload.email,
                sub: payload.sub,
                role: payload.role,
                type: 'access',
            }, {
                expiresIn: accessTokenExpiresIn,
            }),
            this.jwtService.signAsync({
                email: payload.email,
                sub: payload.sub,
                role: payload.role,
                type: 'refresh',
            }, {
                expiresIn: refreshTokenExpiresIn,
                secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            }),
        ]);
        const expiresInSeconds = this.parseExpirationToSeconds(accessTokenExpiresIn);
        const expiresAt = Date.now() + expiresInSeconds * 1000;
        return { accessToken, refreshToken, expiresAt };
    }
    parseExpirationToSeconds(expiresIn) {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match)
            return 900;
        const value = parseInt(match[1], 10);
        const unit = match[2];
        const multipliers = {
            s: 1,
            m: 60,
            h: 3600,
            d: 86400,
        };
        return value * (multipliers[unit] || 60);
    }
    async getMe(userId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
        };
    }
    async logout(userId) {
        this.logger.log(`User logged out: ${userId}`);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        mongoose_2.Model])
], AuthService);
//# sourceMappingURL=auth.service.js.map