import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
export interface TokenPayload {
    email: string;
    sub: string;
    role: string;
    type: 'access' | 'refresh';
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}
export interface LoginResult {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    user: {
        id: string;
        fullName: string;
        email: string;
        role: string;
        status: boolean;
    };
}
export declare class AuthService {
    private jwtService;
    private userModel;
    private readonly logger;
    constructor(jwtService: JwtService, userModel: Model<User>);
    validateUser(email: string, password: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: string;
        status: boolean;
    }>;
    login(user: {
        id: string;
        fullName: string;
        email: string;
        role: string;
        status: boolean;
    }): Promise<LoginResult>;
    refreshToken(refreshToken: string): Promise<AuthTokens>;
    private generateTokens;
    private parseExpirationToSeconds;
    getMe(userId: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: string;
        status: boolean;
    } | null>;
    logout(userId: string): Promise<void>;
}
