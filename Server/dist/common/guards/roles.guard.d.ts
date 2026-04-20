import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare enum Role {
    ADMIN = "admin",
    OPERATOR = "operator",
    VIEWER = "viewer"
}
export declare const ROLES_KEY = "roles";
export declare class RolesGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
