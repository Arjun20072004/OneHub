import type { User } from "../types/auth";

export function getDefaultRoute(user: User): string {
  if (
    user.roles.includes("admin") ||
    user.roles.includes("super_admin")
  ) {
    return "/admin";
  }

  if (user.roles.includes("provider")) {
    const status =
      user.provider_profile?.verification_status;

    if (status === "approved") {
      return "/provider";
    }

    return "/provider/status";
  }

  return "/customer";
}