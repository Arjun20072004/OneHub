import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, CreditCard, MapPin, Phone, User } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { createOrder } from "../services/orders";
import type { MenuItem } from "../services/food";
import "./ServicePages.css";

type PaymentMethod = "cash" | "online";
type CheckoutLine = { item: MenuItem; quantity: number; variantId?: number; addonIds: number[] };

export default function FoodCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurantId } = useParams();
  const state = location.state as { cart?: CheckoutLine[]; total?: number; restaurantName?: string } | null;
  const cart = state?.cart || [];
  const total = state?.total || 0;
  const [form, setForm] = useState<{ name: string; phone: string; address: string; payment: PaymentMethod }>({ name: "", phone: "", address: "", payment: "cash" });
  const [error, setError] = useState("");
  const update = (field: "name" | "phone" | "address", value: string) => setForm((current) => ({ ...current, [field]: value }));
  const setPayment = (payment: PaymentMethod) => setForm((current) => ({ ...current, payment }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.phone || !form.address || cart.length === 0) { setError("Please complete your details and select at least one item."); return; }
    setError("");
    try {
      const order = await createOrder({ order_type: "food", delivery_address: form.address, contact_phone: form.phone, payment_method: form.payment, items: cart.map((line) => ({ menu_item: line.item.id, quantity: line.quantity, variant_id: line.variantId, addon_ids: line.addonIds })) });
      navigate(`/food/${restaurantId}/payment`, { state: { order, customerName: form.name, online: form.payment === "online" } });
    } catch (requestError) {
      const response = requestError as { response?: { data?: { detail?: string; items?: string } } };
      setError(response.response?.data?.detail || response.response?.data?.items || "We could not place your order. Please try again.");
    }
  };
  return <main className="service-page checkout-page"><button className="back-button" onClick={() => navigate(-1)}><ArrowLeft size={17} /> Back to menu</button><section className="checkout-layout"><form className="travel-panel checkout-form" onSubmit={submit}><span className="eyebrow">Delivery details</span><h1>Where should we deliver?</h1><p className="muted">{state?.restaurantName || "OneHub Food"} • {cart.length} selected items</p><label><span><User size={15} /> Full name</span><input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your name" /></label><label><span><Phone size={15} /> Phone number</span><input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="10-digit mobile number" inputMode="tel" /></label><label><span><MapPin size={15} /> Delivery address</span><textarea value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="House number, street, landmark and area" rows={4} /></label><fieldset><legend>Mode of payment</legend><label className="payment-option"><input type="radio" checked={form.payment === "cash"} onChange={() => setPayment("cash")} /> Cash on delivery</label><label className="payment-option"><input type="radio" checked={form.payment === "online"} onChange={() => setPayment("online")} /> Online payment gateway</label></fieldset>{error && <p className="form-error">{error}</p>}<button className="primary-button checkout-submit" type="submit"><CreditCard size={17} /> {form.payment === "cash" ? "Place cash-on-delivery order" : "Continue to payment"}</button></form><aside className="travel-panel order-summary"><span className="eyebrow">Order summary</span><h2>{state?.restaurantName || "Food order"}</h2>{cart.map((line) => <div className="summary-line" key={`${line.item.id}-${line.variantId}`}><span>{line.item.name} × {line.quantity}</span><span>₹{(Number(line.item.price) * line.quantity).toFixed(2)}</span></div>)}<div className="summary-total"><span>Estimated total</span><strong>₹{total.toFixed(2)}</strong></div><small>Final total is recalculated securely by OneHub.</small></aside></section></main>;
}
