import {
  BarChart3,
  Bell,
  ClipboardList,
  LayoutDashboard,
  Store,
  UserCircle,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import Header from "../components/layout/Header";
import "./RoleLayouts.css";

const links = [
  ["/provider", "Dashboard", LayoutDashboard],
  ["/provider/orders", "Orders", ClipboardList],
  ["/provider/restaurant", "Restaurant", Store],
  ["/provider/analytics", "Analytics", BarChart3],
  ["/provider/notifications", "Notifications", Bell],
  ["/provider/profile", "Profile", UserCircle],
] as const;

export default function ProviderLayout() {
  return (
    <div className="role-layout role-layout--provider">
      <Header />

      <div className="role-layout__body">
        <aside className="role-sidebar">
          <div className="role-sidebar__title">
            Provider workspace
          </div>

          <nav>
            {links.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/provider"}
                className={({ isActive }) =>
                  isActive
                    ? "role-nav-link role-nav-link--active"
                    : "role-nav-link"
                }
              >
                <Icon size={17} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="role-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}