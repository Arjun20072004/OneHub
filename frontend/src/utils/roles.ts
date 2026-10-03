import type { User, UserRole } from "../types/auth";

export function hasRole(
  user: User | null,
  role: UserRole,
): boolean {
  return user?.roles.includes(role) ?? false;
}

export function isAdmin(user: User | null): boolean {
  return (
    hasRole(user, "admin") ||
    hasRole(user, "super_admin")
  );
}

export function isApprovedProvider(
  user: User | null,
): boolean {
  return (
    hasRole(user, "provider") &&
    user?.provider_profile?.verification_status ===
      "approved"
  );
}

export function isPendingProvider(
  user: User | null,
): boolean {
  return (
    hasRole(user, "provider") &&
    user?.provider_profile?.verification_status ===
      "pending"
  );
}