import { useEffect, useState } from "react";
import { ArrowRight, Search, ShoppingBag, Stethoscope, Utensils, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRestaurants } from "../services/food";
import type { Restaurant } from "../services/food";
import "./ServicePages.css";

const quickSearches = ["Biryani", "Doctor near me", "Fuel delivery", "Weekend events"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const navigate = useNavigate();
  useEffect(() => { if (query.trim()) void getRestaurants(query).then(setRestaurants).catch(() => setRestaurants([])); }, [query]);
  const serviceMatches = query.toLowerCase().includes("doctor") ? [{ title: "Doctor Care", detail: "Find specialists and hospitals", path: "/doctor", icon: Stethoscope }] : query.toLowerCase().includes("fuel") || query.toLowerCase().includes("mechanic") ? [{ title: "On The Move", detail: "Fuel delivery and roadside help", path: "/mechanic", icon: Wrench }] : query.toLowerCase().includes("event") || query.toLowerCase().includes("movie") ? [{ title: "Bookings & Events", detail: "Movies, concerts and activities", path: "/bookings", icon: ShoppingBag }] : [];
  return <main className="service-page search-page"><section className="search-intro"><span className="eyebrow">OneHub Search</span><h1>What are you looking for?</h1><p>Search across food, care, shopping, travel and local services.</p><label className="search-field search-field--large"><Search size={22} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “biryani”, “doctor”, or “fuel delivery”" /></label></section>{!query && <section className="quick-searches"><span className="eyebrow">Popular searches</span><div className="chip-row">{quickSearches.map((item) => <button className="chip" key={item} onClick={() => setQuery(item)}>{item}</button>)}</div></section>}{query && <><section className="section-heading"><div><span className="eyebrow">Results for</span><h2>{query}</h2></div><span>{restaurants.length + serviceMatches.length} matches</span></section><div className="search-results">{serviceMatches.map(({ title, detail, path, icon: Icon }) => <button className="search-result" key={title} onClick={() => navigate(path)}><span className="search-result__icon"><Icon size={21} /></span><span><strong>{title}</strong><small>{detail}</small></span><ArrowRight size={18} /></button>)}{restaurants.map((restaurant) => <button className="search-result" key={restaurant.id} onClick={() => navigate(`/food/${restaurant.id}`)}><span className="search-result__icon"><Utensils size={21} /></span><span><strong>{restaurant.name}</strong><small>{restaurant.cuisine} • {restaurant.delivery_minutes} min • ★ {restaurant.rating}</small></span><ArrowRight size={18} /></button>)}{restaurants.length === 0 && serviceMatches.length === 0 && <div className="empty-state"><Search size={25} /><h3>No results yet</h3><p>Try a restaurant, dish, service or activity.</p></div>}</div></>}</main>;
}
