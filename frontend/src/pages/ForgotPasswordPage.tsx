import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return <main className="login-page"><section className="login-showcase"><button className="login-back" onClick={() => navigate("/login")}><ArrowLeft size={16} /> Back to sign in</button><div className="login-brand">One<span>Hub</span></div><div className="showcase-copy"><p className="login-kicker">Account recovery</p><h1>We’ll help you get back in.</h1><p>Enter the email connected to your OneHub account and we’ll guide you through the next step.</p></div></section><section className="login-panel"><div className="login-panel__heading"><p className="login-kicker">Forgot password</p><h2>Reset your access</h2><p>We’ll send recovery instructions to your email.</p></div>{sent ? <div className="login-success"><Mail size={24} /><h3>Check your inbox</h3><p>If an account exists for {email}, recovery instructions will arrive shortly.</p><button className="login-submit" onClick={() => navigate("/login")}>Back to sign in <span>→</span></button></div> : <form className="login-form" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label><button className="login-submit" type="submit">Send recovery link <span>→</span></button></form>}</section></main>;
}
