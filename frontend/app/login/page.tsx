"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Leaf, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import GoogleIdentity from "@/app/GoogleIdentity";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(email.trim(), password);
      const user = await api.getMe();
      const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      if (next && next.startsWith("/") && !next.startsWith("//")) router.push(next);
      else router.push(user.role === "artisan" ? "/seller" : user.role === "admin" ? "/admin" : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-story">
        <Link href="/" className="auth-brand"><span className="brand-mark">ह</span> HASTKATHA</Link>
        <div className="auth-story-copy"><span className="auth-eyebrow"><Leaf size={15} /> STORIES WOVEN BY HAND</span><h1>Welcome<br /><i>back home.</i></h1><p>Find meaningful objects, learn the stories behind them and support the hands that keep Indian craft alive.</p><div className="auth-promise"><ShieldCheck size={19} /> Your account brings your cart and orders together.</div></div>
        <div className="auth-story-foot">DISCOVER · EMPOWER · PRESERVE</div>
      </div>
      <section className="auth-form-side">
        <div className="auth-mobile-brand"><Link href="/" className="auth-brand"><span className="brand-mark">ह</span> HASTKATHA</Link></div>
        <div className="auth-form-wrap">
          <p className="auth-eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2>Sign in to HASTKATHA</h2><p className="auth-muted">Your next favourite craft is waiting.</p>
          <div className="auth-google"><GoogleIdentity /></div><div className="auth-divider"><span>or continue with email</span></div>
          <form className="auth-form" onSubmit={handleLogin}>
            <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" /></label>
            <label>Password<span className="auth-password"><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required autoComplete="current-password" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"} <ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">New to HASTKATHA? <Link href="/register">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}
