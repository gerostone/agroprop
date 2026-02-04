export type Role = "USER" | "AGENT" | "ADMIN";

export const roleRank: Record<Role, number> = {
  USER: 1,
  AGENT: 2,
  ADMIN: 3
};

export function hasRole(userRole: Role, required: Role) {
  return roleRank[userRole] >= roleRank[required];
}
