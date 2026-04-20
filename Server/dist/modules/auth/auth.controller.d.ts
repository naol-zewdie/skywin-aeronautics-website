import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
declare class RefreshTokenDto {
    refreshToken: string;
}
interface LoginResponse {
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
interface UserResponse {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: boolean;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<LoginResponse>;
    refreshToken(refreshDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
    }>;
    logout(req: {
        user: {
            userId: string;
        };
    }): Promise<void>;
    getMe(req: {
        user: {
            userId: string;
        };
    }): Promise<UserResponse>;
}
export {};
