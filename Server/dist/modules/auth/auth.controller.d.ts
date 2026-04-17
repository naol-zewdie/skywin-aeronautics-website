import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: {
            id: any;
            fullName: any;
            email: any;
            role: any;
            status: any;
        };
    }>;
    getMe(req: any): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: string;
        status: boolean;
    }>;
}
export {};
