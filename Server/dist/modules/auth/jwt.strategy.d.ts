import { Strategy } from 'passport-jwt';
interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    type: 'access' | 'refresh';
    iat: number;
    exp: number;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptions] | [opt: import("passport-jwt").StrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): Promise<{
        userId: string;
        email: string;
        role: string;
    }>;
}
export {};
