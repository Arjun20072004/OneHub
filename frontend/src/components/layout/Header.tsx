import {
  Bell,
  MapPin,
  UserCircle,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import LocationPicker from "../location/LocationPicker";
import { useAuthStore } from "../../store/authStore";
import { useLocationStore } from "../../store/locationStore";

import "./Header.css";

export default function Header() {
  const user = useAuthStore((state) => state.user);

  const location = useLocationStore(
    (state) => state.location,
  );

  const locationSource = useLocationStore(
    (state) => state.source,
  );

  const locationStatus = useLocationStore(
    (state) => state.status,
  );

  const openLocationPicker = useLocationStore(
    (state) => state.openPicker,
  );

  const detectLocation = useLocationStore(
    (state) => state.detectLocation,
  );

  const navigate = useNavigate();

  const hasRequestedAutomaticLocation =
    useRef(false);

  const isAdmin =
    user?.roles.includes("admin") ||
    user?.roles.includes("super_admin");

  const isProvider =
    user?.roles.includes("provider");

  const homePath = isAdmin
    ? "/admin"
    : isProvider
      ? "/provider"
      : "/customer";

  const profilePath = isAdmin
    ? "/admin/profile"
    : isProvider
      ? "/provider/profile"
      : "/customer/profile";

  const notificationPath = isAdmin
    ? "/admin/notifications"
    : isProvider
      ? "/provider/notifications"
      : "/customer/notifications";

  useEffect(() => {
    if (
      !hasRequestedAutomaticLocation.current &&
      locationSource !== "manual" &&
      locationStatus !== "locating"
    ) {
      hasRequestedAutomaticLocation.current = true;

      void detectLocation();
    }
  }, [
    detectLocation,
    locationSource,
    locationStatus,
  ]);

  return (
    <header className="app-header">
      <button
        className="app-header__brand"
        type="button"
        onClick={() => navigate(homePath)}
        aria-label="Go to OneHub home"
      >
        <span className="app-header__logo-mark">
          O
        </span>

        <span className="app-header__logo">
          One<span>Hub</span>
        </span>
      </button>

      <div className="app-header__actions">
        <button
          type="button"
          className="app-header__action app-header__location-button"
          aria-label={`Change location, currently ${location.label}`}
          title="Change location"
          onClick={openLocationPicker}
        >
          <MapPin size={20} />

          <span className="app-header__location">
            {location.label}
          </span>
        </button>

        <button
          type="button"
          className="app-header__action"
          aria-label="Notifications"
          title="Notifications"
          onClick={() => navigate(notificationPath)}
        >
          <Bell size={20} />
        </button>

        <button
          type="button"
          className="app-header__profile"
          aria-label="Profile"
          title="Profile"
          onClick={() => navigate(profilePath)}
        >
          <UserCircle size={25} />

          <span className="app-header__username">
            {user?.first_name || "User"}
          </span>
        </button>
      </div>

      <LocationPicker />
    </header>
  );
}