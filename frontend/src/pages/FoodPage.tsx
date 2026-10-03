import { useEffect, useState } from "react";
import { MapPin, Search, ShoppingBag, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRestaurants } from "../services/food";
import type { Restaurant } from "../services/food";
import "./ServicePages.css";

export default function FoodPage() {
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("All cuisines");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getRestaurants(cuisine === "All cuisines" ? query : `${query} ${cuisine}`)
      .then((data) => { if (active) setRestaurants(data); })
      .catch(() => { if (active) setError("Restaurants could not be loaded. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, cuisine]);

  return <main className="service-page">
    <section className="service-hero service-hero--food"><div><span className="eyebrow">OneHub Food</span><h1>Good food, close to home.</h1><p>Discover restaurants, menus, offers and delivery from verified local partners.</p></div><div className="location-pill"><MapPin size={17} /> Gachibowli, Hyderabad</div></section>
    <div className="service-toolbar"><label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search restaurants or dishes" /></label><div className="chip-row">{["All cuisines", "Biryani", "Pizza", "Healthy", "South Indian"].map((item) => <button className={cuisine === item ? "chip chip--active" : "chip"} key={item} onClick={() => setCuisine(item)}>{item}</button>)}</div></div>
    <section className="section-heading"><div><span className="eyebrow">Near you</span><h2>Restaurants and dining</h2></div><span>{loading ? "Loading..." : `${restaurants.length} places`}</span></section>
    {error && <p className="form-error">{error}</p>}
    <div className="catalog-grid">{restaurants.map((restaurant) => <article className="catalog-card" key={restaurant.id}><div className="food-art">{restaurant.name.slice(0, 1)}</div><div className="catalog-card__body"><div className="card-title"><h3>{restaurant.name}</h3><span className="rating"><Star size={14} fill="currentColor" /> {restaurant.rating}</span></div><p>{restaurant.cuisine}</p><div className="meta-line"><span>{restaurant.delivery_minutes} min</span><span>₹{restaurant.price_for_two} for two</span></div><small>{restaurant.is_open ? "Open now" : "Currently closed"} • {restaurant.vegetarian_available ? "Vegetarian options" : "Mixed menu"}</small><button className="primary-button" onClick={() => navigate(`/customer/food/${restaurant.id}`)}><ShoppingBag size={16} /> View menu</button></div></article>)}</div>
  </main>;
}
