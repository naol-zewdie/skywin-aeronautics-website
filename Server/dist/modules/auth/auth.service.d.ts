import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
export declare class AuthService {
    private jwtService;
    private userModel?;
    private readonly fallbackUsers;
    constructor(jwtService: JwtService, userModel?: Model<User> | undefined);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
        token: string;
        user: {
            id: any;
            fullName: any;
            email: any;
            role: any;
            status: any;
        };
    }>;
    getMe(userId: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: string;
        status: boolean;
    }>;
}
