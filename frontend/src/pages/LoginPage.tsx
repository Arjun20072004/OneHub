import {  useState } from "react";
import type {  FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import { getDefaultRoute } from "../utils/navigation";
import "./LoginPage.css";


export default function LoginPage() {
  const navigate = useNavigate();

  const login = useAuthStore(
    (state) => state.login,
  );

  const isLoading = useAuthStore(
    (state) => state.isLoading,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    try {
      await login(email, password);

const user = useAuthStore.getState().user;

if (!user) {
  throw new Error(
    "Login succeeded but user information was not loaded.",
  );
}

navigate(getDefaultRoute(user), {
  replace: true,
});
    } catch {
      setError("We couldn't find an account with those details. Create a OneHub account to access our services.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-showcase">
        <div className="login-brand">One<span>Hub</span></div>
        <div className="showcase-copy">
          <p className="login-kicker">One place. Every day.</p>
          <h1>Life, arranged around you.</h1>
          <p>Food, care, shopping, travel and local help, brought together in one calm, useful space.</p>
        </div>
        <div className="showcase-note"><span>●</span><p><strong>Gachibowli is live</strong><br />Discover trusted services near you.</p></div>
      </section>

      <section className="login-panel">
        <div className="login-panel__heading">
          <p className="login-kicker">Welcome back</p>
          <h2>Sign in to OneHub</h2>
          <p>Continue where you left off.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address<input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
          <label htmlFor="password">Password<input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign in"}<span>→</span></button>
        </form>
        <button className="login-link-button" type="button" onClick={() => navigate("/forgot-password")}>Forgot password?</button>
        {error && <button className="create-account-link" type="button" onClick={() => navigate("/register")}>Create an account <span>→</span></button>}
        <p className="login-footnote">Secure access to your OneHub account</p>
      </section>
    </main>
  );
}