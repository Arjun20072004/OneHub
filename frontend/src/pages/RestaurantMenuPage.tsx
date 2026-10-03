import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getRestaurant } from "../services/food";
import type { MenuItem, RestaurantDetail } from "../services/food";
import "./ServicePages.css";

type CartLine = { item: MenuItem; quantity: number; variantId?: number; addonIds: number[] };

export default function RestaurantMenuPage() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [error, setError] = useState("");
  const [variantIds, setVariantIds] = useState<Record<number, number | undefined>>({});
  const [addonIds, setAddonIds] = useState<Record<number, number[]>>({});

  useEffect(() => {
    const id = Number(restaurantId);
    if (!Number.isInteger(id)) return;
    getRestaurant(id).then(setRestaurant).catch(() => setError("Restaurant menu could not be loaded."));
  }, [restaurantId]);

  const allItems = useMemo(() => restaurant?.categories.flatMap((category) => category.items) || [], [restaurant]);
  const priceFor = (line: CartLine) => {
    const variant = line.item.variants.find((item) => item.id === line.variantId);
    const addons = line.item.addons.filter((item) => line.addonIds.includes(item.id));
    return Number(line.item.price) + Number(variant?.price_delta || 0) + addons.reduce((sum, item) => sum + Number(item.price), 0);
  };
  const totalItems = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + priceFor(line) * line.quantity, 0);
  const add = (item: MenuItem) => setCart((current) => [...current, { item, quantity: 1, variantId: variantIds[item.id], addonIds: addonIds[item.id] || [] }]);
  const updateQuantity = (index: number, amount: number) => setCart((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, quantity: Math.max(0, line.quantity + amount) } : line).filter((line) => line.quantity > 0));

  if (!Number.isInteger(Number(restaurantId)) || error) return <main className="service-page"><button className="back-button" onClick={() => navigate("/food")}><ArrowLeft size={17} /> Back to restaurants</button><p className="form-error">{error || "Restaurant not found."}</p></main>;
  if (!restaurant) return <main className="service-page"><p>Loading menu...</p></main>;

  return <main className="service-page"><button className="back-button" onClick={() => navigate("/food")}><ArrowLeft size={17} /> All restaurants</button><section className="service-hero service-hero--food"><div><span className="eyebrow">Restaurant menu</span><h1>{restaurant.name}</h1><p>{restaurant.cuisine} • {restaurant.delivery_minutes} min delivery • {restaurant.address}</p></div><div className="rating"><Star size={16} fill="currentColor" /> {restaurant.rating}</div></section><section className="section-heading"><div><span className="eyebrow">Freshly prepared</span><h2>Choose your food</h2></div><span>{totalItems} items</span></section><div className="menu-list">{allItems.map((item) => { const selected = cart.findIndex((line) => line.item.id === item.id); const quantity = selected >= 0 ? cart[selected].quantity : 0; return <article className="menu-item" key={item.id}><div><span className="menu-category">{item.category_name}</span><h3>{item.name}</h3><p>{item.description}</p><strong>₹{item.price}</strong>{item.variants.length > 0 && <select className="menu-select" value={variantIds[item.id] || ""} onChange={(event) => setVariantIds((current) => ({ ...current, [item.id]: event.target.value ? Number(event.target.value) : undefined }))}><option value="">Choose size</option>{item.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.name} {Number(variant.price_delta) > 0 ? `(+₹${variant.price_delta})` : ""}</option>)}</select>}{item.addons.length > 0 && <div className="addon-row">{item.addons.map((addon) => <label key={addon.id}><input type="checkbox" checked={(addonIds[item.id] || []).includes(addon.id)} onChange={() => setAddonIds((current) => ({ ...current, [item.id]: (current[item.id] || []).includes(addon.id) ? (current[item.id] || []).filter((id) => id !== addon.id) : [...(current[item.id] || []), addon.id] }))} /> {addon.name} +₹{addon.price}</label>)}</div>}</div><div className="menu-action">{quantity ? <div className="quantity-control"><button aria-label="Remove item" onClick={() => updateQuantity(selected, -1)}><Minus size={15} /></button><b>{quantity}</b><button aria-label="Add item" onClick={() => updateQuantity(selected, 1)}><Plus size={15} /></button></div> : <button className="secondary-button" onClick={() => add(item)}>Add <Plus size={15} /></button>}</div></article>; })}</div>{totalItems > 0 && <div className="sticky-cart"><span><ShoppingBag size={18} /> {totalItems} items • ₹{total.toFixed(2)}</span><button className="primary-button" onClick={() => navigate(`/food/${restaurantId}/checkout`, { state: { cart, total, restaurantName: restaurant.name } })}>Continue <ChevronRight size={17} /></button></div>}</main>;
}
