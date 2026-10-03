import {
  CalendarCheck,
  Home,
  Search,
  User,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const links = [
  {
    to: "/customer",
    label: "Home",
    icon: Home,
  },
  {
    to: "/customer/search",
    label: "Search",
    icon: Search,
  },
  {
    to: "/customer/bookings",
    label: "Bookings",
    icon: CalendarCheck,
  },
  {
    to: "/customer/profile",
    label: "Profile",
    icon: User,
  },
];

export default function MobileNavigation() {
  return (
    <nav className="app-mobile-nav">
      <div className="app-mobile-nav__grid">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `app-mobile-nav__link${isActive ? " app-mobile-nav__link--active" : ""}`}
            >
              <Icon size={18} />

              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}