export const ROLE_MAP_TO_OPAQUE: Record<string, string> = {
  admin: "r_9a3f",
  operator: "r_4b7e",
};

export const OPAQUE_MAP_TO_ROLE: Record<string, string> = {
  r_9a3f: "admin",
  r_4b7e: "operator",
};

/**
 * Converts internal/DB role ("admin") to opaque client token ("r_9a3f").
 * Prevents raw role string disclosure in HTTP response bodies / DevTools.
 */
export function toOpaqueRole(role: string): string {
  return ROLE_MAP_TO_OPAQUE[role] || role;
}

/**
 * Converts opaque client token ("r_9a3f") to internal/DB role ("admin").
 */
export function toInternalRole(role: string): string {
  return OPAQUE_MAP_TO_ROLE[role] || role;
}
