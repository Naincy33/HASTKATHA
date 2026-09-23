"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Package,
  Plus,
  Sparkles,
  Store,
} from "lucide-react";

import { useEffect, useState } from "react";

import { api, Product } from "@/lib/api";


export default function SellerDashboard() {

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    async function loadProducts() {

      try {

        const data = await api.getMyProducts();

        setProducts(data);

      } catch (err) {

        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load products"
        );

      } finally {

        setLoading(false);

      }

    }

    loadProducts();

  }, []);


  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.is_active
  ).length;

  const totalStock = products.reduce(
    (sum, product) => sum + product.stock,
    0
  );


  return (
    <main className="seller-page">

      <div className="container">

        {/* =====================================================
            TOP
        ===================================================== */}

        <div className="seller-top">

          <Link
            href="/"
            className="back-link"
          >
            <ArrowLeft size={16} />
            Back home
          </Link>

          <div className="seller-label">
            HASTKATHA SELLER
          </div>

        </div>


        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="seller-header">

          <div>

            <div className="section-kicker">
              ARTISAN DASHBOARD
            </div>

            <h1>
              Your craft.
              <br />
              <i>Your marketplace.</i>
            </h1>

            <p>
              Manage your products, create new listings
              and use HASTKATHA AI to turn your craft
              into a marketplace-ready story.
            </p>

          </div>


          <Link
            href="/seller/new-product"
            className="seller-primary-btn"
          >
            <Plus size={18} />
            Add product
          </Link>

        </section>


        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="seller-stats">

          <div className="seller-stat">

            <Package size={22} />

            <div>
              <strong>{totalProducts}</strong>
              <span>Total products</span>
            </div>

          </div>


          <div className="seller-stat">

            <Store size={22} />

            <div>
              <strong>{activeProducts}</strong>
              <span>Active listings</span>
            </div>

          </div>


          <div className="seller-stat">

            <Package size={22} />

            <div>
              <strong>{totalStock}</strong>
              <span>Total stock</span>
            </div>

          </div>

        </section>


        {/* =====================================================
            AI CREATE CARD
        ===================================================== */}

        <section className="seller-ai">

          <div className="seller-ai-icon">
            <Sparkles size={24} />
          </div>

          <div className="seller-ai-content">

            <div className="seller-ai-kicker">
              HASTKATHA INTELLIGENCE
            </div>

            <h2>
              Create a product listing with AI.
            </h2>

            <p>
              Upload a photo of your craft and let
              HASTKATHA help generate the product title,
              description, material and price reference.
            </p>

          </div>

          <Link
            href="/seller/new-product"
            className="seller-ai-btn"
          >
            Start listing
            <ArrowRight size={17} />
          </Link>

        </section>


        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        <section className="seller-products">

          <div className="seller-section-head">

            <div>

              <div className="section-kicker">
                YOUR INVENTORY
              </div>

              <h2>
                Your products.
              </h2>

            </div>

            <span>
              {totalProducts} listings
            </span>

          </div>


          {loading && (

            <div className="seller-empty">
              Loading your products...
            </div>

          )}


          {!loading && error && (

            <div className="seller-empty">

              <strong>
                Could not load seller products.
              </strong>

              <p>
                {error}
              </p>

              <Link
                href="/seller/new-product"
                className="seller-primary-btn"
              >
                Create a listing
              </Link>

            </div>

          )}


          {!loading &&
            !error &&
            products.length === 0 && (

              <div className="seller-empty">

                <Package size={32} />

                <h3>
                  No products yet.
                </h3>

                <p>
                  Your first listing can start with
                  just one photograph of your craft.
                </p>

                <Link
                  href="/seller/new-product"
                  className="seller-primary-btn"
                >
                  <Plus size={17} />
                  Add your first product
                </Link>

              </div>

            )}


          {!loading &&
            !error &&
            products.length > 0 && (

              <div className="seller-product-grid">

                {products.map((product) => (

                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="seller-product-card"
                  >

                    <div className="seller-product-image">

                      <Package size={32} />

                    </div>


                    <div className="seller-product-body">

                      <div className="seller-product-status">

                        <span
                          className={
                            product.is_active
                              ? "status-active"
                              : "status-inactive"
                          }
                        >
                          {product.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>

                        <span>
                          {product.stock} available
                        </span>

                      </div>


                      <h3>
                        {product.name}
                      </h3>


                      <p>
                        {product.description ||
                          "No product description yet."}
                      </p>


                      <div className="seller-product-footer">

                        <strong>
                          ₹
                          {product.price.toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <ArrowRight size={17} />

                      </div>

                    </div>

                  </Link>

                ))}

              </div>

            )}

        </section>

      </div>

    </main>
  );
}