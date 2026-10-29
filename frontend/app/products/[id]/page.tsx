"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingBag, MapPin, Sparkles, Package, CheckCircle2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { api, Craft, Product, ProductImage } from "@/lib/api";
import { addToCart } from "@/lib/cart";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [craft, setCraft] = useState<Craft | null>(null);
  const [image, setImage] = useState<ProductImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!productId) return;
    async function loadProduct() {
      try {
        setLoading(true);
        const productData = await api.getProduct(productId);
        setProduct(productData);
        const results = await Promise.allSettled([
          api.getCraft(productData.craft_id),
          api.getProductImages(productId),
        ]);
        if (results[0].status === "fulfilled") setCraft(results[0].value);
        if (results[1].status === "fulfilled") {
          const images = results[1].value;
          setImage(images.find((item) => item.is_primary) || images[0] || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load product.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  function handleAddToCart(goToCart = false) {
    if (!product || product.stock <= 0) return;
    addToCart(product);
    setNotice(product.name + " added to your cart.");
    if (goToCart) router.push("/cart");
  }

  if (loading) return <main className="archive-page"><div className="container"><div className="market-empty"><Sparkles size={26} /><p>Loading product…</p></div></div></main>;
  if (error || !product) return <main className="archive-page"><div className="container"><Link href="/products" className="back-link"><ArrowLeft size={17} /> Back to marketplace</Link><div className="market-empty"><h3>Product not found</h3><p>{error || "This product is no longer available."}</p></div></div></main>;

  const imageUrl = image?.image_url
    ? (image.image_url.startsWith("http") ? image.image_url : "http://127.0.0.1:8000" + (image.image_url.startsWith("/") ? "" : "/") + image.image_url)
    : null;

  return (
    <main className="archive-page"><div className="container">
      <Link href="/products" className="back-link"><ArrowLeft size={17} /> Back to marketplace</Link>
      <div className="archive-kicker">HASTKATHA MARKETPLACE</div>
      <section className="product-detail">
        <div className="product-detail-image">
          {imageUrl ? <img className="product-real-image" src={imageUrl} alt={product.name} /> : <><ShoppingBag size={70} /><span>HANDCRAFTED</span></>}
        </div>
        <div className="product-detail-info">
          {craft && <Link href={\`/crafts/\${craft.id}\`} className="pill product-craft-link">{craft.name}</Link>}
          <h1>{product.name}</h1>
          <p className="product-detail-description">{product.description || "A handcrafted product made by an Indian artisan."}</p>
          <div className="product-detail-price">₹{product.price.toLocaleString("en-IN")}</div>
          <div className="product-detail-meta"><div><Package size={18} /><span>{product.stock > 0 ? \`\${product.stock} available\` : "Out of stock"}</span></div>{product.material && <div><Sparkles size={18} /><span>Material: {product.material}</span></div>}{craft?.state && <div><MapPin size={18} /><span>{craft.state}{craft.region ? \` · \${craft.region}\` : ""}</span></div>}</div>
          {notice && <p className="cart-inline-success"><CheckCircle2 size={17} /> {notice} <Link href="/cart">View cart</Link></p>}
          <div className="product-actions"><button className="btn btn-primary" onClick={() => handleAddToCart()} disabled={product.stock <= 0}><ShoppingBag size={18} /> Add to cart</button><button className="btn btn-soft" onClick={() => handleAddToCart(true)} disabled={product.stock <= 0}>Buy now <ArrowRight size={17} /></button></div>
          <div className="artisan-note"><strong>Supporting Indian artisans</strong><p>Your purchase helps keep traditional craft practices connected to modern markets.</p></div>
        </div>
      </section>
      {craft && <section className="product-story"><div><div className="section-kicker">THE CRAFT BEHIND IT</div><h2>{craft.name}</h2></div><div><p>{craft.description || "Explore the tradition, region and techniques connected to this product."}</p><Link href={\`/crafts/\${craft.id}\`} className="card-link">Explore this craft <ArrowRight size={16} /></Link></div></section>}
      <section className="market-ai-banner"><div className="market-ai-icon"><Sparkles size={22} /></div><div><span>CURIOUS ABOUT THIS PRODUCT?</span><h3>Ask HASTKATHA about its craft.</h3><p>Learn about the region, tradition, materials and heritage behind it.</p></div><Link href="/ai-assistant" className="market-ai-link">Ask HASTKATHA <ArrowRight size={17} /></Link></section>
    </div></main>
  );
}
