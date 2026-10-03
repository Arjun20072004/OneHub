import { useState } from "react";
import { Fuel, MapPin, Phone, ShieldCheck, Wrench } from "lucide-react";
import "./ServicePages.css";

const services = [
  ["Emergency fuel delivery", "Petrol or diesel delivered to your exact location", "From ₹249", Fuel],
  ["Flat tyre assistance", "On-site puncture repair and spare wheel fitment", "From ₹199", Wrench],
  ["Battery jump start", "Get your car or bike running again", "From ₹299", ShieldCheck],
  ["Towing service", "24/7 towing to the nearest trusted workshop", "From ₹799", Wrench],
 ] as const;

export default function MechanicPage() {
  const [selected, setSelected] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [litres, setLitres] = useState("5");
  const [fuelDialog, setFuelDialog] = useState(false);
  return <main className="service-page"><section className="service-hero service-hero--food"><div><span className="eyebrow">OneHub On The Move</span><h1>Help, wherever the road stops.</h1><p>Request fuel, roadside assistance, towing or a mechanic. Verified partners are available within 50 km.</p></div><MapPin size={46} /></section><section className="section-heading"><div><span className="eyebrow">Available near Gachibowli</span><h2>Choose a roadside service</h2></div><span>Within 50 km • Arrival 25 min</span></section><div className="catalog-grid">{services.map(([name, description, price, Icon]) => <button className="catalog-card" key={name} onClick={() => name === "Emergency fuel delivery" ? setFuelDialog(true) : setSelected(name)} style={{ textAlign: "left" }}><div className="stay-art"><Icon size={38} /></div><div className="catalog-card__body"><h3>{name}</h3><p>{description}</p><strong>{price}</strong><small>Within 50 km • Verified partner</small></div></button>)}</div>{fuelDialog && <div className="dialog-backdrop"><section className="dialog-card"><span className="eyebrow">Fuel delivery</span><h2>How many litres do you need?</h2><input type="number" min="1" max="20" value={litres} onChange={(event) => setLitres(event.target.value)} /><button className="primary-button" onClick={() => { setFuelDialog(false); setSelected("Emergency fuel delivery"); setMessage(`Fuel request for ${litres} litres started.`); }}>Continue request</button><button className="secondary-button" onClick={() => setFuelDialog(false)}>Cancel</button></section></div>}{selected && <section className="travel-panel" style={{ marginTop: 28 }}><div className="section-heading" style={{ marginTop: 0 }}><div><span className="eyebrow">Request service</span><h2>{selected}</h2></div><Phone size={20} /></div><div className="travel-fields"><label><span>Your exact location</span><input placeholder="Share location or landmark" /></label><label><span>Phone number</span><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="10-digit mobile number" /></label><label><span>Vehicle</span><input placeholder="Car / bike and model" /></label><button className="primary-button" onClick={() => setMessage(`Request placed for ${selected}. Our service partner will call ${phone || "you"}.`)}>Request help</button></div></section>}{message && <div className="toast" role="status">{message}</div>}</main>;
}