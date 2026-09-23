"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  ShoppingBag,
  MapPin,
  Sparkles,
} from "lucide-react";
//import { api, Craft } from "@/lib/api";
import { api, Craft, Product } from "@/lib/api";


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCraft, setSelectedCraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [productData, craftData] = await Promise.all([
        api.getProducts(),
        api.getCrafts({ limit: 100 }),
      ]);

      setProducts(productData);
      setCrafts(craftData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    try {
      setLoading(true);
      setError("");

      const data = await api.getProducts({
        search: search || undefined,
        craft_id: selectedCraft
          ? Number(selectedCraft)
          : undefined,
      });

      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to search products."
      );
    } finally {
      setLoading(false);
    }
  }

  function getCraftName(craftId: number) {
    const craft = crafts.find(
      (item) => item.id === craftId
    );

    return craft?.name || "Indian Craft";
  }

  return (
    <main className="archive-page">
      {/* HEADER */}

      <div className="container">
        <Link href="/" className="back-link">
          <ArrowLeft size={17} />
          Back home
        </Link>

        <div className="archive-kicker">
          HASTKATHA MARKETPLACE
        </div>

        <div className="archive-hero">
          <div>
            <h1 className="archive-title">
              Handmade.
              <br />
              <i>Meaningful.</i>
            </h1>

            <p className="archive-subtitle">
              Discover products made by Indian artisans
              and bring living craft traditions into
              everyday life.
            </p>
          </div>

          <div className="archive-icon">
            <ShoppingBag size={30} />
          </div>
        </div>

        {/* SEARCH */}

        <section className="market-controls">
          <div className="market-search">
            <Search size={20} />

            <input
              type="text"
              placeholder="Search products, crafts or materials..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>

          <select
            value={selectedCraft}
            onChange={(e) => {
              setSelectedCraft(e.target.value);
            }}
          >
            <option value="">
              All crafts
            </option>

            {crafts.map((craft) => (
              <option
                key={craft.id}
                value={craft.id}
              >
                {craft.name}
              </option>
            ))}
          </select>

          <button
            className="market-search-btn"
            onClick={handleSearch}
          >
            Explore
            <ArrowRight size={17} />
          </button>
        </section>

        {/* COLLECTION */}

        <section className="market-section">
          <div className="market-section-head">
            <div>
              <div className="section-kicker">
                01 / Marketplace
              </div>

              <h2 className="section-title">
                Products with a story.
              </h2>
            </div>

            <div className="market-count">
              {products.length} products
            </div>
          </div>

          {loading && (
            <div className="market-empty">
              <Sparkles size={24} />
              <p>Discovering handcrafted products...</p>
            </div>
          )}

          {!loading && error && (
            <div className="market-error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="market-empty">
                <ShoppingBag size={28} />

                <h3>
                  No products found
                </h3>

                <p>
                  Try another search or explore
                  a different craft.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            products.length > 0 && (
              <div className="product-grid">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="market-product-card"
                  >
                    <div className="product-placeholder">
                      <ShoppingBag size={34} />

                      <span>
                        HASTKATHA
                      </span>
                    </div>

                    <div className="product-card-body">
                      <div className="product-card-top">
                        <span className="pill">
                          {getCraftName(
                            product.craft_id
                          )}
                        </span>

                        {product.stock > 0 && (
                          <span className="stock-dot">
                            Available
                          </span>
                        )}
                      </div>

                      <h3>
                        {product.name}
                      </h3>

                      <p>
                        {product.description ||
                          "A handcrafted product created by an Indian artisan."}
                      </p>

                      <div className="product-location">
                        <MapPin size={14} />

                        Indian artisan
                      </div>

                      <div className="product-card-bottom">
                        <strong>
                          ₹
                          {product.price.toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <span>
                          View product
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
        </section>

        {/* AI BANNER */}

        <section className="market-ai-banner">
          <div className="market-ai-icon">
            <Sparkles size={22} />
          </div>

          <div>
            <span>
              HASTKATHA INTELLIGENCE
            </span>

            <h3>
              Not sure what you're looking for?
            </h3>

            <p>
              Ask HASTKATHA about a craft,
              material, region or tradition.
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