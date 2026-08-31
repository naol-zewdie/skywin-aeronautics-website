import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard, Role } from "./roles.guard";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const createContext = (user?: { role: string }) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it("allows access when no roles are required and user is a known role (operator)", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);

    expect(guard.canActivate(createContext({ role: "operator" }))).toBe(true);
  });

  it("allows access when no roles are required and user is a known role (admin)", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);

    expect(guard.canActivate(createContext({ role: "admin" }))).toBe(true);
  });

  it("allows access when user has a required role", () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValue([Role.ADMIN, Role.OPERATOR]);

    expect(guard.canActivate(createContext({ role: "operator" }))).toBe(true);
  });

  it("denies access when user lacks required role", () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValue([Role.ADMIN, Role.OPERATOR]);

    expect(() => guard.canActivate(createContext({ role: "invalid-role" }))).toThrow(
      ForbiddenException,
    );
  });

  it("denies access when user has no role", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(createContext())).toThrow(
      ForbiddenException,
    );
  });

  // ── BOLA Finding Fix: Viewer role must be denied on ALL routes ─────────────
  it("denies a 'viewer' role even on routes with no @Roles() decorator (deny-by-default)", () => {
    // No @Roles() on route → requiredRoles is undefined
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);

    expect(() => guard.canActivate(createContext({ role: "viewer" }))).toThrow(
      ForbiddenException,
    );
  });

  it("denies a 'viewer' role when explicit @Roles(ADMIN, OPERATOR) is declared", () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValue([Role.ADMIN, Role.OPERATOR]);

    expect(() => guard.canActivate(createContext({ role: "viewer" }))).toThrow(
      ForbiddenException,
    );
  });

  it("denies any unrecognized role string that is not in KNOWN_INTERNAL_ROLES", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);

    expect(() => guard.canActivate(createContext({ role: "superuser" }))).toThrow(
      ForbiddenException,
    );
  });
});
