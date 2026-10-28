"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Leaf, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.register({ name: name.trim(), email: email.trim(), password, role: "customer" });
      await api.login(email.trim(), password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-story">
        <Link href="/" className="auth-brand"><span className="brand-mark">ह</span> HASTKATHA</Link>
        <div className="auth-story-copy">
          <span className="auth-eyebrow"><Leaf size={15} /> MADE WITH MEANING</span>
          <h1>Bring home<br /><i>a little heritage.</i></h1>
          <p>Meet the hands behind India’s living craft traditions. Every discovery helps keep a story alive.</p>
          <div className="auth-promise"><ShieldCheck size={19} /> A marketplace built around people, provenance and craft.</div>
        </div>
        <div className="auth-story-foot">DISCOVER · EMPOWER · PRESERVE</div>
      </div>
      <section className="auth-form-side">
        <div className="auth-mobile-brand"><Link href="/" className="auth-brand"><span className="brand-mark">ह</span> HASTKATHA</Link></div>
        <div className="auth-form-wrap">
          <p className="auth-eyebrow">YOUR HASTKATHA JOURNEY</p>
          <h2>Create your account</h2>
          <p className="auth-muted">Save favourites, build your cart and keep track of every order.</p>
          <form className="auth-form" onSubmit={handleRegister}>
            <label>Full name
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" required minLength={2} maxLength={100} />
            </label>
            <label>Email address
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required />
            </label>
            <label>Password
              <span className="auth-password">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" required minLength={8} />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </span>
            </label>
            <label>Confirm password
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Re-enter password" required />
            </label>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"} <ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
          <p className="auth-terms">By continuing, you agree to use HASTKATHA respectfully and responsibly.</p>
        </div>
      </section>
    </main>
  );
}
