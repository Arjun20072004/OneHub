import { CheckCircle2, Clock3, CreditCard, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { restaurantName } from "./foodData";
import type { Order } from "../types/order";
import "./ServicePages.css";

export default function FoodPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { order?: Order; customerName?: string; online?: boolean } | null;
  const order = state?.order;
  const [paid, setPaid] = useState(false);
  if (!order) return <main className="service-page"><h1>Order details unavailable</h1><button className="primary-button" onClick={() => navigate("/food")}>Browse restaurants</button></main>;
  const online = state?.online;
  const showGateway = Boolean(online && !paid);
  return <main className="service-page confirmation-page"><section className="confirmation-card"><div className="success-icon"><CheckCircle2 size={48} /></div><span className="eyebrow">{showGateway ? "Payment gateway" : "Order confirmed"}</span><h1>{showGateway ? "Complete your payment" : "Your order is on its way"}</h1>{showGateway ? <><p>Secure payment for {restaurantName}. This demo gateway is ready for a payment provider integration.</p><div className="gateway-box"><CreditCard size={22} /><span>OneHub Secure Checkout<strong>Card, UPI or net banking</strong></span></div><button className="primary-button" onClick={() => setPaid(true)}><CreditCard size={17} /> Pay ₹{order.total_amount}</button></> : <><p>Thank you, {state?.customerName || "customer"}. {online ? "Your online payment was successful." : "Pay cash when your OneHub delivery partner arrives."}</p><div className="order-id">Order ID <strong>{order.order_number}</strong></div><div className="delivery-info"><div><Clock3 size={20} /><span>Estimated delivery<strong>30-40 minutes</strong></span></div><div><MapPin size={20} /><span>Delivering to<strong>{order.delivery_address}</strong></span></div></div><button className="primary-button" onClick={() => navigate("/bookings")}>View my bookings</button></>}</section></main>;
}
