import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

type Role = "customer" | "provider" | "admin";

interface RoleRouteProps {
  allowedRoles: Role[];
  requireApprovedProvider?: boolean;
}

export default function RoleRoute({
  allowedRoles,
  requireApprovedProvider = false,
}: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );
  const isLoading = useAuthStore(
    (state) => state.isLoading,
  );
  const isInitialized = useAuthStore(
    (state) => state.isInitialized,
  );

  if (!isInitialized || isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = user?.roles ?? [];

  const hasAllowedRole = allowedRoles.some((role) =>
    userRoles.includes(role),
  );

  if (!hasAllowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (
    requireApprovedProvider &&
    userRoles.includes("provider")
  ) {
    const verificationStatus =
      user?.provider_profile?.verification_status;

    if (verificationStatus !== "approved") {
      return <Navigate to="/provider/status" replace />;
    }
  }

  return <Outlet />;
}