import type { UserRole } from "@/models/User";

export function canUserAccessOrder(
  orderUserId: string,
  authenticatedUserId: string,
  role: UserRole
) {
  return orderUserId === authenticatedUserId || role === "admin";
}
