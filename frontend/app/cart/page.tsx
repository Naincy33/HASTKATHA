"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { CartItem, cartTotal, readCart, writeCart } from "@/lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setReady(true);
    const sync = () => setItems(readCart());
    window.addEventListener("hastkatha:cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hastkatha:cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function updateQuantity(productId: number, quantity: number) {
    const next = items.map((item) => item.product.id === productId ? { ...item, quantity } : item).filter((item) => item.quantity > 0);
    const bounded = next.map((item) => ({ ...item, quantity: Math.min(item.quantity, item.product.stock) }));
    setItems(bounded);
    writeCart(bounded);
  }
  function remove(productId: number) {
    const next = items.filter((item) => item.product.id !== productId);
    setItems(next);
    writeCart(next);
  }
  const total = cartTotal(items);

  return (
    <main className="shop-page"><div className="shop-container">
      <Link href="/products" className="shop-back"><ArrowLeft size={17} /> Continue shopping</Link>
      <div className="shop-heading"><div><p className="shop-kicker">YOUR COLLECTION</p><h1>Your <i>cart.</i></h1><p className="shop-lede">Thoughtfully made pieces, chosen by you.</p></div><div className="shop-heading-icon"><ShoppingBag size={28} /></div></div>
      {!ready ? <div className="shop-empty">Loading your cart…</div> : items.length === 0 ? (
        <div className="shop-empty"><span className="shop-empty-icon"><ShoppingBag size={30} /></span><h2>Your cart is waiting for a story.</h2><p>Explore handcrafted pieces made by India's artisans.</p><Link className="shop-dark-btn" href="/products">Explore marketplace <ArrowRight size={17} /></Link></div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">{items.map(({ product, quantity }) => (
            <article className="cart-line" key={product.id}>
              <div className="cart-product-art"><ShoppingBag size={31} /><span>HANDCRAFTED</span></div>
              <div className="cart-line-info"><span className="cart-overline">ARTISAN-MADE</span><h2>{product.name}</h2><p>{product.material || "Traditional craft"} · {product.stock} available</p>
                <div className="cart-line-bottom"><div className="quantity-control">
                  <button type="button" aria-label="Decrease quantity" onClick={() => updateQuantity(product.id, quantity - 1)}><Minus size={15} /></button><span>{quantity}</span>
                  <button type="button" aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => updateQuantity(product.id, quantity + 1)}><Plus size={15} /></button>
                </div><button type="button" className="cart-remove" onClick={() => remove(product.id)}><Trash2 size={15} /> Remove</button></div>
              </div>
              <strong className="cart-line-price">₹{(product.price * quantity).toLocaleString("en-IN")}</strong>
            </article>
          ))}</section>
          <aside className="cart-summary"><p className="shop-kicker">ORDER SUMMARY</p><h2>A little something special.</h2>
            <div className="summary-row"><span>Subtotal</span><strong>₹{total.toLocaleString("en-IN")}</strong></div>
            <div className="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
            <div className="summary-total"><span>Total</span><strong>₹{total.toLocaleString("en-IN")}</strong></div>
            <Link href="/checkout" className="shop-dark-btn shop-full-btn">Continue to checkout <ArrowRight size={17} /></Link>
            <p className="summary-note">Place an order and support traditional artisans directly.</p>
          </aside>
        </div>
      )}
    </div></main>
  );
}
