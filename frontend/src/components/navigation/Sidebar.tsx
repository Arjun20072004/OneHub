import {
  CalendarCheck,
  Hotel,
  Home,
  Search,
  ShoppingBag,
  Stethoscope,
  Utensils,
  Wrench,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/customer", label: "Home", icon: Home, group: "main" },
  { to: "/customer/search", label: "Search", icon: Search, group: "main" },
  { to: "/customer/food", label: "Food & Dining", icon: Utensils, group: "services" },
  { to: "/customer/shopping", label: "Shopping", icon: ShoppingBag, group: "services" },
  { to: "/customer/doctor", label: "Health & Medicine", icon: Stethoscope, group: "services" },
  { to: "/customer/mechanic", label: "Mechanic", icon: Wrench, group: "services" },
  { to: "/customer/travel", label: "Travel & Stay", icon: Hotel, group: "services" },
  { to: "/customer/bookings", label: "Bookings & Events", icon: CalendarCheck, group: "activity" },
] as const;

const groups = [
  { id: "main", label: "" },
  { id: "services", label: "Services" },
  { id: "activity", label: "Your activity" },
] as const;

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <nav className="app-sidebar__nav" aria-label="Customer navigation">
        {groups.map((group) => (
          <div className="app-sidebar__group" key={group.id}>
            {group.label && <span className="app-sidebar__label">{group.label}</span>}
            {links.filter((link) => link.group === group.id).map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/customer"}
                  className={({ isActive }) => `app-sidebar__link${isActive ? " app-sidebar__link--active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
