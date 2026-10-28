"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, MapPin, PackageCheck } from "lucide-react";
import { api } from "@/lib/api";
import { CartItem, cartTotal, readCart, writeCart } from "@/lib/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [payment, setPayment] = useState<"cod" | "online">("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(readCart());
    setReady(true);
    if (!localStorage.getItem("hastkatha_token")) return;
    api.getMe().then((user) => { setName(user.name || ""); setEmail(user.email || ""); }).catch(() => {});
  }, []);

  const total = cartTotal(items);
  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!items.length) { setError("Your cart is empty."); return; }
    if (!localStorage.getItem("hastkatha_token")) { router.push("/login?next=/checkout"); return; }
    if (!/^\d{6}$/.test(pincode.trim())) { setError("Enter a valid 6-digit PIN code."); return; }
    if (payment === "online") { setError("Online payment is not enabled yet. Choose Cash on Delivery; no payment has been taken."); return; }
    setLoading(true);
    try {
      const order = await api.createOrder({
        items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
        shipping_name: name.trim(), shipping_email: email.trim(), shipping_phone: phone.trim(),
        shipping_address: address.trim(), shipping_city: city.trim(), shipping_state: state.trim(),
        shipping_pincode: pincode.trim(), payment_method: payment,
      });
      writeCart([]);
      router.push("/orders?placed=" + order.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't place your order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (ready && items.length === 0) return <main className="shop-page"><div className="shop-container"><div className="shop-empty"><PackageCheck size={34} /><h2>Your cart is empty</h2><p>Add a few handmade favourites before checkout.</p><Link href="/products" className="shop-dark-btn">Explore marketplace <ArrowRight size={17} /></Link></div></div></main>;

  return (
    <main className="shop-page"><div className="shop-container">
      <Link href="/cart" className="shop-back"><ArrowLeft size={17} /> Back to cart</Link>
      <div className="shop-heading"><div><p className="shop-kicker">THE FINAL STEP</p><h1>Almost <i>yours.</i></h1><p className="shop-lede">A simple, thoughtful checkout for your handmade finds.</p></div><div className="shop-heading-icon"><LockKeyhole size={27} /></div></div>
      <form className="checkout-layout" onSubmit={submitOrder}>
        <div className="checkout-main">
          <section className="checkout-card">
            <div className="checkout-section-heading"><span>01</span><div><h2>Delivery details</h2><p>Where should your craft story arrive?</p></div></div>
            <div className="checkout-fields">
              <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" maxLength={120} /></label>
              <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" maxLength={150} /></label>
              <label>Phone number<input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" pattern="[0-9+() -]{10,16}" autoComplete="tel" maxLength={16} /></label>
              <label className="checkout-wide">Street address<input value={address} onChange={(e) => setAddress(e.target.value)} required autoComplete="street-address" placeholder="House / flat, street, landmark" maxLength={2000} /></label>
              <label>City<input value={city} onChange={(e) => setCity(e.target.value)} required autoComplete="address-level2" maxLength={100} /></label>
              <label>State<input value={state} onChange={(e) => setState(e.target.value)} required autoComplete="address-level1" maxLength={100} /></label>
              <label>PIN code<input value={pincode} onChange={(e) => setPincode(e.target.value)} required maxLength={6} inputMode="numeric" pattern="[0-9]{6}" autoComplete="postal-code" /></label>
            </div>
            <p className="checkout-local-note"><MapPin size={15} /> Shipping charges are not yet calculated; the amount shown is the product subtotal.</p>
          </section>
          <section className="checkout-card">
            <div className="checkout-section-heading"><span>02</span><div><h2>Payment method</h2><p>Choose how you would like to pay.</p></div></div>
            <label className={"payment-choice " + (payment === "cod" ? "selected" : "")}><input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} /><span className="payment-symbol">₹</span><span><strong>Cash on Delivery</strong><small>Pay when your order arrives.</small></span><CheckCircle2 size={19} /></label>
            <label className={"payment-choice " + (payment === "online" ? "selected" : "")}><input type="radio" checked={payment === "online"} onChange={() => setPayment("online")} /><span className="payment-symbol">↗</span><span><strong>Online payment</strong><small>Not available yet — no charge will be made.</small></span></label>
          </section>
          {error && <div className="auth-error" role="alert">{error}</div>}
        </div>
        <aside className="cart-summary checkout-summary"><p className="shop-kicker">YOUR ORDER</p>
          {items.map(({ product, quantity }) => <div className="checkout-item" key={product.id}><span>{product.name} <small>× {quantity}</small></span><strong>₹{(product.price * quantity).toLocaleString("en-IN")}</strong></div>)}
          <div className="summary-row"><span>Subtotal</span><strong>₹{total.toLocaleString("en-IN")}</strong></div><div className="summary-row"><span>Shipping</span><span>To be confirmed</span></div>
          <div className="summary-total"><span>Order total*</span><strong>₹{total.toLocaleString("en-IN")}</strong></div>
          <button className="shop-dark-btn shop-full-btn" disabled={loading || !ready || items.length === 0}>{loading ? "Placing order…" : "Place order"} <ArrowRight size={17} /></button>
          <p className="summary-note">*Shipping is not included. This demo checkout does not process online payments.</p>
        </aside>
      </form>
    </div></main>
  );
}
