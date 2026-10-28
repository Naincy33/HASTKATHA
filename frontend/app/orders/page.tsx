"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, PackageCheck, ShoppingBag } from "lucide-react";
import { api, Order } from "@/lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [placed, setPlaced] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setPlaced(query.get("placed") || "");
    if (!localStorage.getItem("hastkatha_token")) {
      window.location.href = "/login?next=/orders";
      return;
    }
    api.getOrders().then(setOrders).catch((err) => {
      setError(err instanceof Error ? err.message : "Unable to load your orders.");
    }).finally(() => setLoading(false));
  }, []);

  return (
    <main className="shop-page"><div className="shop-container">
      <Link href="/products" className="shop-back"><ArrowLeft size={17} /> Marketplace</Link>
      {placed && <div className="order-success"><PackageCheck size={22} /><div><strong>Order #{placed} placed successfully!</strong><p>Your order is saved. You can see its current status below.</p></div></div>}
      <div className="shop-heading"><div><p className="shop-kicker">YOUR HASTKATHA ACCOUNT</p><h1>My <i>orders.</i></h1><p className="shop-lede">A home for the craft stories you've chosen.</p></div><div className="shop-heading-icon"><PackageCheck size={28} /></div></div>
      {loading ? <div className="shop-empty">Loading your orders…</div> : error ? (
        <div className="shop-empty"><h2>We couldn't load your orders.</h2><p>{error}</p><Link href="/login" className="shop-dark-btn">Sign in again</Link></div>
      ) : orders.length === 0 ? (
        <div className="shop-empty"><span className="shop-empty-icon"><ShoppingBag size={30} /></span><h2>Your next favourite has a story.</h2><p>Orders you place will appear here, along with their current status.</p><Link href="/products" className="shop-dark-btn">Explore marketplace <ArrowRight size={17} /></Link></div>
      ) : (
        <section className="orders-list">{orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-card-top"><div><span className="cart-overline">HASTKATHA ORDER</span><h2>Order #{order.id}</h2><p>{order.shipping_city ? order.shipping_city + ", " + (order.shipping_state || "") : "Handcrafted items from our marketplace"}</p></div><span className={"order-status status-" + order.status.toLowerCase()}>{order.status}</span></div>
            <div className="order-card-bottom"><div><span>Order total</span><strong>₹{order.total_amount.toLocaleString("en-IN")}</strong></div><div><span>Items</span><strong>{order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? "—"}</strong></div><div><span>Payment</span><strong>{order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method || "Not specified"}</strong></div><Link href="/products">Shop again <ArrowRight size={16} /></Link></div>
          </article>
        ))}</section>
      )}
    </div></main>
  );
}
