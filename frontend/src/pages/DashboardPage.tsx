import {
  ArrowRight,
  ArrowUpRight,
  Hotel,
  MapPin,
  MapPinned,
  Search,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Utensils,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import { useLocationStore } from "../store/locationStore";
import "./DashboardPage.css";

const services = [
  { title: "Food & Dining", description: "Order from restaurants, cafés and cloud kitchens.", icon: Utensils, path: "/food", note: "Delivery from 25 min" },
  { title: "Shopping", description: "Buy everyday essentials, fashion and electronics.", icon: ShoppingBag, path: "/shopping", note: "Essentials near you" },
  { title: "Health & Medicine", description: "Find specialists and book care when you need it.", icon: Stethoscope, path: "/doctor", note: "Verified doctors" },
  { title: "Mechanic", description: "Get roadside help and trusted vehicle services.", icon: Wrench, path: "/mechanic", note: "Help within 50 km" },
  { title: "Travel & Stay", description: "Plan travel, stays and your next getaway.", icon: Hotel, path: "/travel", note: "Compare routes & stays" },
  { title: "Bookings & Events", description: "Reserve movies, events and local experiences.", icon: MapPinned, path: "/bookings", note: "What’s on nearby" },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const location = useLocationStore((state) => state.location);
  const openLocationPicker = useLocationStore((state) => state.openPicker);
  const navigate = useNavigate();
  const nearbyLabel = location.label === "Detecting your location…" || location.label === "Choose your location" ? "your area" : location.label;

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <div className="dashboard-welcome__copy">
          <p className="eyebrow">Your OneHub</p>
          <h1>Hi {user?.first_name || "there"}, what do you need today?</h1>
          <p>Food, essentials, health and local services—organized in one place.</p>
          <div className="dashboard-quick-actions">
            <button type="button" onClick={() => navigate("/customer/food")}><Utensils size={16} /> Order food</button>
            <button type="button" onClick={() => navigate("/customer/doctor")}><Stethoscope size={16} /> Find care</button>
          </div>
        </div>
        <div className="dashboard-welcome__side">
          <button className="dashboard-location" type="button" onClick={openLocationPicker}><MapPin size={16} /> {location.label}</button>
          <span><Sparkles size={16} /> Personalized for your area</span>
        </div>
      </section>

      <button className="dashboard-search" type="button" onClick={() => navigate("/customer/search")}><Search size={20} /><span>Search food, health, shopping and services</span><ArrowRight size={18} /></button>

      <section className="dashboard-section">
        <div className="section-heading">
          <div><span className="eyebrow">Explore OneHub</span><h2>Services for today</h2></div>
          <button className="dashboard-view-all" type="button" onClick={() => navigate("/customer/search")}>Explore all <ArrowUpRight size={16} /></button>
        </div>
        <div className="service-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button key={service.title} type="button" onClick={() => navigate(service.path)} className="service-tile">
                <span className="service-tile__icon"><Icon size={23} /></span>
                <span className="service-tile__content"><span className="service-tile__heading"><h3>{service.title}</h3><ArrowUpRight size={17} /></span><p>{service.description}</p></span>
                <small>{service.note}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="dashboard-highlight">
        <div><span className="eyebrow">Popular near {nearbyLabel}</span><h2>Spice Route Kitchen</h2><p>Chicken dum biryani, fresh kebabs and quick delivery near you.</p><button type="button" onClick={() => navigate("/customer/food")}>Explore food <ArrowRight size={16} /></button></div>
        <div className="highlight-mark">SR</div>
      </section>
    </main>
  );
}
