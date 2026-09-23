"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  MapPin,
  Sparkles,
  Package,
} from "lucide-react";
import { useParams } from "next/navigation";

import { api, Craft, Product } from "@/lib/api";

export default function ProductDetailPage() {
  const params = useParams();

  const productId = Number(params.id);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [craft, setCraft] =
    useState<Craft | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!productId) return;

    loadProduct();
  }, [productId]);

  async function loadProduct() {
    try {
      setLoading(true);

      const productData =
        await api.getProduct(productId);

      setProduct(productData);

      const craftData =
        await api.getCraft(
          productData.craft_id
        );

      setCraft(craftData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load product."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="archive-page">
        <div className="container">
          <div className="market-empty">
            <Sparkles size={26} />
            <p>Loading product...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="archive-page">
        <div className="container">
          <Link
            href="/products"
            className="back-link"
          >
            <ArrowLeft size={17} />
            Back to marketplace
          </Link>

          <div className="market-empty">
            <h3>
              Product not found
            </h3>

            <p>
              {error ||
                "This product is no longer available."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="archive-page">
      <div className="container">
        <Link
          href="/products"
          className="back-link"
        >
          <ArrowLeft size={17} />
          Back to marketplace
        </Link>

        <div className="archive-kicker">
          HASTKATHA MARKETPLACE
        </div>

        <section className="product-detail">
          {/* IMAGE */}

          <div className="product-detail-image">
            <ShoppingBag size={70} />

            <span>
              HANDCRAFTED
            </span>
          </div>

          {/* INFO */}

          <div className="product-detail-info">
            {craft && (
              <Link
                href={`/crafts/${craft.id}`}
                className="pill product-craft-link"
              >
                {craft.name}
              </Link>
            )}

            <h1>
              {product.name}
            </h1>

            <p className="product-detail-description">
              {product.description ||
                "A handcrafted product made by an Indian artisan."}
            </p>

            <div className="product-detail-price">
              ₹
              {product.price.toLocaleString(
                "en-IN"
              )}
            </div>

            <div className="product-detail-meta">
              <div>
                <Package size={18} />

                <span>
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </span>
              </div>

              {product.material && (
                <div>
                  <Sparkles size={18} />

                  <span>
                    Material:{" "}
                    {product.material}
                  </span>
                </div>
              )}

              {craft?.state && (
                <div>
                  <MapPin size={18} />

                  <span>
                    {craft.state}
                    {craft.region
                      ? ` · ${craft.region}`
                      : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="product-actions">
              <button
                className="btn btn-primary"
                disabled={product.stock <= 0}
              >
                <ShoppingBag size={18} />

                Add to cart
              </button>

              <button className="btn btn-soft">
                Buy now
                <ArrowRight size={17} />
              </button>
            </div>

            <div className="artisan-note">
              <strong>
                Supporting Indian artisans
              </strong>

              <p>
                Your purchase helps keep traditional
                craft practices connected to modern
                markets.
              </p>
            </div>
          </div>
        </section>

        {/* CRAFT CONNECTION */}

        {craft && (
          <section className="product-story">
            <div>
              <div className="section-kicker">
                THE CRAFT BEHIND IT
              </div>

              <h2>
                {craft.name}
              </h2>
            </div>

            <div>
              <p>
                {craft.description ||
                  "Explore the tradition, region and techniques connected to this product."}
              </p>

              <Link
                href={`/crafts/${craft.id}`}
                className="card-link"
              >
                Explore this craft
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        )}

        {/* AI */}

        <section className="market-ai-banner">
          <div className="market-ai-icon">
            <Sparkles size={22} />
          </div>

          <div>
            <span>
              CURIOUS ABOUT THIS PRODUCT?
            </span>

            <h3>
              Ask HASTKATHA about its craft.
            </h3>

            <p>
              Learn about the region, tradition,
              materials and heritage behind it.
            </p>
          </div>

          <Link
            href="/ai-assistant"
            className="market-ai-link"
          >
            Ask HASTKATHA
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </main>
  );
}