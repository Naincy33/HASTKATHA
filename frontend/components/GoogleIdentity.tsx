"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleIdentity() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) return;
    let cancelled = false;
    const initialise = () => {
      if (cancelled || !window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          setLoading(true);
          setError("");
          try {
            await api.googleLogin(credential);
            const user = await api.getMe();
            router.push(user.role === "artisan" ? "/seller" : user.role === "admin" ? "/admin" : "/");
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Google sign-in failed.");
          } finally {
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline", size: "large", shape: "pill", width: 340, text: "continue_with",
      });
    };
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (window.google) initialise();
    else if (existing) existing.addEventListener("load", initialise, { once: true });
    else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initialise;
      script.onerror = () => setError("Google sign-in could not load. Please use email and password.");
      document.head.appendChild(script);
    }
    return () => { cancelled = true; };
  }, [router]);

  if (!GOOGLE_CLIENT_ID) return <div className="google-not-configured">Google sign-in needs setup. Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_ID</code> to the respective environment files.</div>;
  return <div className="google-auth-wrap"><div ref={buttonRef} />{loading && <p className="auth-muted">Signing in with Google…</p>}{error && <p className="auth-error" role="alert">{error}</p>}</div>;
}
