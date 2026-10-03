import { useEffect, useState } from "react";
import { CalendarDays, Clapperboard, MapPin, Music2, Trophy } from "lucide-react";
import "./ServicePages.css";
import { cancelOrder, getOrders } from "../services/orders";
import type { Order } from "../types/order";

const events = [
  ["Project Hail Mary", "Movies", "INOX GVK One, Hyderabad", "Today • 7:30 PM", Clapperboard],
  ["Sunburn Arena", "Concerts", "Gachibowli Stadium", "Sat, 28 Sep • 6:00 PM", Music2],
  ["Hyderabad FC vs Kerala Blasters", "Sports", "GMC Balayogi Stadium", "Sun, 29 Sep • 7:30 PM", Trophy],
  ["Weekend pottery workshop", "Activities", "Jubilee Hills", "Sun, 29 Sep • 11:00 AM", CalendarDays],
 ] as const;

export default function BookingsPage() {
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { void getOrders().then(setOrders).catch(() => undefined); }, []);
  const cancel = async (orderId: number) => {
    try { const updated = await cancelOrder(orderId); setOrders((current) => current.map((order) => order.id === orderId ? updated : order)); setMessage("Order cancelled."); } catch { setMessage("This order can no longer be cancelled."); }
  };
  const filters = ["All", "Movies", "Concerts", "Sports", "Activities"];
  const visible = filter === "All" ? events : events.filter((event) => event[1] === filter);
  return <main className="service-page"><section className="service-hero service-hero--travel"><div><span className="eyebrow">OneHub Bookings</span><h1>Your plans, in one place.</h1><p>Book movies, live events, sports, workshops and experiences across the city.</p></div><CalendarDays size={46} /></section><section className="section-heading"><div><span className="eyebrow">Your activity</span><h2>Orders and bookings</h2></div><span>{orders.length} records</span></section><div className="provider-orders">{orders.length === 0 && <div className="travel-panel"><p style={{ color: "#6c7e78" }}>Your confirmed tickets, appointments, stays and service requests will appear here.</p></div>}{orders.map((order) => <article className="travel-panel provider-order" key={order.id}><div><span className="eyebrow">{order.order_number} • {order.order_type}</span><h2>₹{order.total_amount}</h2><p>{order.items.map((item) => `${item.item_name} × ${item.quantity}`).join(", ")}</p><strong>{order.status.replaceAll("_", " ")}</strong></div>{["pending", "confirmed"].includes(order.status) && <button className="secondary-button" onClick={() => void cancel(order.id)}>Cancel order</button>}</article>)}</div><div className="service-toolbar"><div className="chip-row" style={{ marginTop: 0 }}>{filters.map((item) => <button key={item} className={filter === item ? "chip chip--active" : "chip"} onClick={() => setFilter(item)}>{item}</button>)}</div></div><section className="section-heading"><div><span className="eyebrow">Happening around you</span><h2>Discover events</h2></div><span><MapPin size={16} /> Hyderabad</span></section><div className="catalog-grid">{visible.map(([name, type, venue, date, Icon]) => <article className="catalog-card" key={name}><div className="stay-art"><Icon size={38} /></div><div className="catalog-card__body"><span className="eyebrow">{type}</span><h3>{name}</h3><p>{venue}</p><small>{date}</small><button className="primary-button" onClick={() => setMessage(`${name} selected. Choose seats to continue.`)}>Book tickets</button></div></article>)}</div>{message && <div className="toast" role="status">{message}</div>}</main>;
}