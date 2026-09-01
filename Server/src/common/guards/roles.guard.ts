import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { toInternalRole, KNOWN_INTERNAL_ROLES } from "../utils/role-obfuscator";
import { IS_PUBLIC_KEY } from "./public.decorator";

/** Enum of all valid user roles in the system. Add a new value here ONLY if
 *  it also exists in KNOWN_INTERNAL_ROLES (role-obfuscator.ts). Roles absent
 *  from KNOWN_INTERNAL_ROLES are denied by the guard before any route check. */
export enum Role {
  ADMIN = "admin",
  OPERATOR = "operator",
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
 *
 * Security — deny-by-default for unknown roles:
 * Any role string that is not in KNOWN_INTERNAL_ROLES is rejected with 403
 * before route-level role matching even begins. This prevents privilege
 * escalation via accounts whose role was injected directly into the database
 * (bypassing the DTO-level @IsIn(["admin","operator"]) validation).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip role enforcement for routes decorated with @Public().
    // These are unauthenticated endpoints (e.g. /v1/public/*) — JwtAuthGuard
    // already bypasses auth for them, so RolesGuard must do the same.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException("Access denied: No role assigned");
    }

    const internalUserRole = toInternalRole(user.role);

    // ── Deny-by-default: unknown roles ──────────────────────────────────────
    // Reject any role that is not a recognized internal role BEFORE checking
    // route-level @Roles() metadata. This blocks DB-injected accounts (e.g.
    // role="viewer") that bypassed the DTO @IsIn(["admin","operator"]) check.
    // To add a new role: update KNOWN_INTERNAL_ROLES in role-obfuscator.ts
    // AND add it to the Role enum above.
    if (!KNOWN_INTERNAL_ROLES.has(internalUserRole)) {
      throw new ForbiddenException(
        "Access denied: Unrecognized or insufficient role",
      );
    }

    // If no @Roles() decorator is present the route is accessible to any
    // authenticated user that passed the known-role allowlist check above.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // ── Route-level role check ───────────────────────────────────────────────
    if (!requiredRoles.includes(internalUserRole as Role)) {
      throw new ForbiddenException("Access denied: Insufficient permissions");
    }

    return true;
  }
}
