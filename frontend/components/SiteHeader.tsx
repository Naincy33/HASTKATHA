"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { api } from "@/lib/api";
import { cartCount, readCart } from "@/lib/cart";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const syncCart = () => setCount(cartCount(readCart()));
    syncCart();
    setLoggedIn(Boolean(localStorage.getItem("hastkatha_token")));
    const sync = () => {
      syncCart();
      setLoggedIn(Boolean(localStorage.getItem("hastkatha_token")));
    };
    window.addEventListener("hastkatha:cart-updated", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("hastkatha:auth-updated", sync);
    return () => {
      window.removeEventListener("hastkatha:cart-updated", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("hastkatha:auth-updated", sync);
    };
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  function logout() {
    api.logout();
    setLoggedIn(false);
    window.dispatchEvent(new CustomEvent("hastkatha:auth-updated"));
    router.push("/");
    router.refresh();
  }

  const linkClass = (path: string) => pathname === path ? "site-nav-link active" : "site-nav-link";

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo"><span className="brand-mark">ह</span><span>HASTKATHA</span></Link>
        <nav className={"site-nav " + (open ? "is-open" : "")} aria-label="Main navigation">
          <Link href="/crafts" className={linkClass("/crafts")}>Discover crafts</Link>
          <Link href="/products" className={linkClass("/products")}>Marketplace</Link>
          {loggedIn && <Link href="/orders" className={linkClass("/orders")}>My orders</Link>}
          <Link href="/seller" className="site-nav-link">Sell with us</Link>
          {loggedIn ? <button className="site-nav-login" onClick={logout}>Sign out</button> : <Link href="/login" className="site-nav-login"><UserRound size={15} /> Sign in</Link>}
        </nav>
        <div className="site-header-actions">
          <Link href="/cart" className="site-cart" aria-label={\`Shopping cart, \${count} items\`}><ShoppingBag size={20} /><span>Cart</span>{count > 0 && <b>{count > 99 ? "99+" : count}</b>}</Link>
          <button className="site-menu-toggle" type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
    </header>
  );
}
