import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import type { User } from "../types/auth";
import "./ProfilePage.css";

type ProfileForm = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  dateOfBirth: string;
  avatarData: string;
};

const formFromUser = (user: User | null): ProfileForm => ({
  firstName: user?.first_name || "",
  lastName: user?.last_name || "",
  phone: user?.phone || "",
  address: user?.customer_profile?.address || "",
  city: user?.customer_profile?.city || "",
  dateOfBirth: user?.customer_profile?.date_of_birth || "",
  avatarData: user?.avatar_data || "",
});

const accountName = (user: User | null) =>
  [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "OneHub user";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileForm>(() => formFromUser(user));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(formFromUser(user));
  }, [user]);

  const updateField = (field: keyof ProfileForm, value: string) => {
    setMessage("");
    setError("");
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file for your profile photo.");
      return;
    }
    if (file.size > 2_000_000) {
      setError("Please choose an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateField("avatarData", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      await updateProfile({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        phone: form.phone.trim(),
        avatar_data: form.avatarData,
        customer_profile: {
          address: form.address.trim(),
          city: form.city.trim(),
          date_of_birth: form.dateOfBirth || null,
        },
      });
      setMessage("Your profile has been updated.");
    } catch {
      setError("We couldn’t save your changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const name = accountName(user);
  const joined = user?.date_joined
    ? new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(user.date_joined))
    : "Recently";

  return (
    <main className="profile-page">
      <header className="profile-page__heading">
        <div>
          <span className="eyebrow">Account settings</span>
          <h1>Profile & preferences</h1>
          <p>Keep your personal details current for a smoother OneHub experience.</p>
        </div>
        <span className="profile-verified"><CheckCircle2 size={16} /> Verified account</span>
      </header>

      <section className="profile-hero">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar" aria-label={`${name} profile photo`}>
            {form.avatarData ? <img src={form.avatarData} alt="" /> : <span>{initials(name)}</span>}
          </div>
          <button className="profile-avatar-action" type="button" onClick={() => photoInputRef.current?.click()} aria-label="Change profile photo">
            <Camera size={15} />
          </button>
          <input ref={photoInputRef} className="sr-only" type="file" accept="image/*" onChange={handlePhotoChange} />
        </div>
        <div className="profile-hero__identity">
          <span className="profile-role">{user?.roles[0] || "customer"}</span>
          <h2>{name}</h2>
          <div className="profile-hero__contact">
            <span><Mail size={15} /> {user?.email || "No email available"}</span>
            <span><Phone size={15} /> {user?.phone || "Add phone number"}</span>
          </div>
        </div>
        <div className="profile-hero__meta">
          <span>Member since</span>
          <strong>{joined}</strong>
        </div>
      </section>

      <div className="profile-layout">
        <form className="profile-card profile-form-card" onSubmit={handleSubmit}>
          <div className="profile-card__heading">
            <div>
              <span className="eyebrow">Personal information</span>
              <h2>Your details</h2>
              <p>These details help us make your orders and bookings feel personal.</p>
            </div>
            <button className="profile-photo-link" type="button" onClick={() => photoInputRef.current?.click()}><ImagePlus size={16} /> Change photo</button>
          </div>

          <div className="profile-form-grid">
            <label>
              <span>First name</span>
              <input value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} placeholder="Your first name" required />
            </label>
            <label>
              <span>Last name</span>
              <input value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} placeholder="Your last name" required />
            </label>
            <label className="profile-form-grid__wide">
              <span>Email address <small>Verified</small></span>
              <div className="profile-input-with-icon profile-input-with-icon--locked"><Mail size={17} /><input value={user?.email || ""} readOnly aria-label="Email address" /><ShieldCheck size={17} /></div>
              <em>Your email is used to sign in and can’t be changed here.</em>
            </label>
            <label>
              <span>Phone number</span>
              <div className="profile-input-with-icon"><Phone size={17} /><input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Your mobile number" inputMode="tel" /></div>
            </label>
            <label>
              <span>Date of birth <small>Optional</small></span>
              <div className="profile-input-with-icon"><CalendarDays size={17} /><input type="date" value={form.dateOfBirth} onChange={(event) => updateField("dateOfBirth", event.target.value)} /></div>
            </label>
          </div>

          <div className="profile-form-divider" />

          <div className="profile-card__heading profile-card__heading--compact">
            <div>
              <span className="eyebrow">Delivery & location</span>
              <h2>Where you are</h2>
              <p>Used to speed up delivery and show relevant nearby services.</p>
            </div>
          </div>
          <div className="profile-form-grid">
            <label className="profile-form-grid__wide">
              <span>Address</span>
              <div className="profile-input-with-icon profile-input-with-icon--textarea"><MapPin size={17} /><textarea value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="House, street, landmark and locality" rows={3} /></div>
            </label>
            <label>
              <span>City</span>
              <div className="profile-input-with-icon"><MapPin size={17} /><input value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="e.g. Hyderabad" /></div>
            </label>
          </div>

          {error && <p className="profile-form-message profile-form-message--error" role="alert">{error}</p>}
          {message && <p className="profile-form-message profile-form-message--success" role="status"><CheckCircle2 size={17} /> {message}</p>}

          <div className="profile-form-actions">
            {form.avatarData && <button className="profile-reset" type="button" onClick={() => updateField("avatarData", "")}><X size={16} /> Remove photo</button>}
            <button className="profile-save" type="submit" disabled={isSaving}>
              {isSaving ? <LoaderCircle size={17} className="profile-spin" /> : <CheckCircle2 size={17} />}
              {isSaving ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>

        <aside className="profile-sidebar">
          <section className="profile-card profile-status-card">
            <span className="eyebrow">Account at a glance</span>
            <h2>Everything looks good.</h2>
            <ul>
              <li><span className="profile-status-icon"><CheckCircle2 size={16} /></span><span><strong>Email verified</strong><small>Your sign-in email is confirmed.</small></span></li>
              <li><span className="profile-status-icon"><ShieldCheck size={16} /></span><span><strong>Account secured</strong><small>Your profile is protected by your password.</small></span></li>
              <li><span className="profile-status-icon"><UserRound size={16} /></span><span><strong>{user?.roles[0] || "Customer"} account</strong><small>One account for every OneHub service.</small></span></li>
            </ul>
          </section>

          <section className="profile-tip-card">
            <MapPin size={20} />
            <div><strong>Make checkout faster</strong><p>Add your address above and your delivery information will be ready next time.</p></div>
          </section>
        </aside>
      </div>

      <section className="profile-signout">
        <div><strong>Signed in on this device</strong><span>Sign out when you are using a shared computer.</span></div>
        <button type="button" onClick={handleLogout}><LogOut size={17} /> Sign out</button>
      </section>
    </main>
  );
}
