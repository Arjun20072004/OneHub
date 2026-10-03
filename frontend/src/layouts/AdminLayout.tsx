import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserCircle,
  Users,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import Header from "../components/layout/Header";
import "./RoleLayouts.css";

const links = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/users", "Users", Users],
  ["/admin/providers", "Providers", ShieldCheck],
  ["/admin/restaurants", "Restaurants", ShoppingBag],
  ["/admin/orders", "Orders", ShoppingBag],
  ["/admin/payments", "Payments", CreditCard],
  ["/admin/reports", "Reports", BarChart3],
  ["/admin/settings", "Settings", Settings],
  ["/admin/profile", "Profile", UserCircle],
] as const;

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="role-layout role-layout--admin">
      <Header />

      <div className="role-layout__body">
        <aside className="role-sidebar">
          <button
            type="button"
            className="role-sidebar__brand"
            onClick={() => navigate("/admin")}
            aria-label="Go to OneHub Admin dashboard"
          >
            <span className="role-sidebar__brand-mark">
              O
            </span>

            <span className="role-sidebar__brand-text">
              <strong>OneHub</strong>
              <small>Admin Console</small>
            </span>
          </button>

          <nav>
            {links.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
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