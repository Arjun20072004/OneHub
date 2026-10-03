import { useState } from "react";
import { CalendarCheck, MapPin, Search, Stethoscope } from "lucide-react";
import "./ServicePages.css";

const doctors = [
  ["Dr. Ananya Rao", "Apollo Hospitals", "Cardiologist", "14 yrs", "₹900"],
  ["Dr. Vivek Sharma", "CARE Hospitals", "Orthopedic surgeon", "18 yrs", "₹1,200"],
  ["Dr. Meera Iyer", "KIMS Hospitals", "Dermatologist", "11 yrs", "₹700"],
  ["Dr. Rahul Menon", "Yashoda Hospitals", "Neurologist", "20 yrs", "₹1,500"],
  ["Dr. Farah Khan", "Continental Hospitals", "Gynecologist", "12 yrs", "₹900"],
  ["Dr. Arjun Patel", "AIG Hospitals", "Gastroenterologist", "16 yrs", "₹1,100"],
  ["Dr. Sneha Nair", "Rainbow Children's", "Pediatrician", "10 yrs", "₹800"],
  ["Dr. Karthik Reddy", "Sunshine Hospitals", "ENT specialist", "15 yrs", "₹750"],
];

export default function DoctorPage() {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", phone: "" });
  const visible = doctors.filter(([name, hospital, specialization]) => `${name} ${hospital} ${specialization}`.toLowerCase().includes(query.toLowerCase()));
  return <main className="service-page"><section className="service-hero service-hero--food"><div><span className="eyebrow">OneHub Doctor Care</span><h1>Care that comes closer.</h1><p>Find hospitals and verified doctors by specialization, experience, consultation fee and location.</p></div><Stethoscope size={46} /></section><div className="service-toolbar"><label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search doctor, hospital or specialization" /></label><div className="location-pill" style={{ color: "#173e35", borderColor: "#c9d7d2", marginTop: 18, width: "fit-content" }}><MapPin size={16} /> Gachibowli and nearby hospitals</div></div><section className="section-heading"><div><span className="eyebrow">Verified specialists</span><h2>Doctors available today</h2></div><span>{visible.length} doctors</span></section><div className="catalog-grid">{visible.map(([name, hospital, specialization, experience, fee]) => <article className="catalog-card" key={name}><div className="food-art"><Stethoscope size={38} /></div><div className="catalog-card__body"><div className="card-title"><h3>{name}</h3><span className="rating">4.8</span></div><p>{specialization}</p><small>{hospital} • {experience} experience</small><strong>{fee} <small>consultation</small></strong><button className="primary-button" onClick={() => setSelectedDoctor(name)}><CalendarCheck size={16} /> Book consultation</button></div></article>)}</div>{selectedDoctor && <div className="dialog-backdrop"><section className="dialog-card"><span className="eyebrow">Consultation request</span><h2>{selectedDoctor}</h2><p>Share your details and our team will contact you when a suitable slot is available.</p><input placeholder="Full name" value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} /><input placeholder="Phone number" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} /><button className="primary-button" onClick={() => { setSelectedDoctor(null); setMessage("Our team will contact you when the doctor has an available slot."); }}>Request consultation</button><button className="secondary-button" onClick={() => setSelectedDoctor(null)}>Cancel</button></section></div>}{message && <div className="toast" role="status">{message}</div>}</main>;
}