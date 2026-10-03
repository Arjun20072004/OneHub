import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute() {
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
    return (
      <Navigate to="/login" replace/>
    );
  }

  return <Outlet />;
}