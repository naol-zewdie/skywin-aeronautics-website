import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

/** Enum of all valid user roles in the system. */
export enum Role {
  ADMIN = "admin",
  OPERATOR = "operator",
  VIEWER = "viewer",
}

/** Metadata key used to store required roles on route handlers. */
export const ROLES_KEY = "roles";

/**
 * Decorator that marks a route as requiring specific roles.
 * Applied to controllers or individual route handlers.
 *
 * @example
 * @Roles(Role.ADMIN)
 * @Get('admin-only')
 * adminRoute() {}
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Guard that enforces role-based access control.
 * Reads required roles from route metadata and compares against
 * the authenticated user's role. Must be used after JwtAuthGuard.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access to all authenticated users.
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException("Access denied: No role assigned");
    }

    if (!requiredRoles.includes(user.role as Role)) {
      throw new ForbiddenException("Access denied: Insufficient permissions");
    }

    return true;
  }
}
