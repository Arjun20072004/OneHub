import { useEffect } from "react";

import { useAuthStore } from "../store/authStore";

export default function AppInitializer() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  return null;
}