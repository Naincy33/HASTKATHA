"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  IndianRupee,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

type ComparableProduct = {
  product_name: string;
  selling_price: number;
  material?: string;
  product_type?: string;
  source?: string;
  url?: string;
};

type PriceResult = {
  predicted_price: number;

  // Backend may return either of these names.
  estimated_range?: {
    min: number;
    max: number;
  };

  price_range?: {
    min: number;
    max: number;
  };

  confidence: string;

  comparison_basis?: string;

  comparable_products_count?: number;

  comparable_products?: ComparableProduct[];
};

export default function PriceEstimator() {
  const [name, setName] = useState(
    "Handmade Bamboo Stool"
  );

  const [material, setMaterial] = useState("bamboo");

  const [type, setType] = useState("stool");

  const [mrp, setMrp] = useState("1500");

  const [result, setResult] =
    useState<PriceResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function estimate() {
    if (
      !name.trim() ||
      !material.trim() ||
      !type.trim() ||
      !mrp
    ) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.estimatePrice({
        product_name: name.trim(),
        material: material.trim(),
        product_type: type.trim(),
        mrp: Number(mrp),
      });

      setResult(response.data);
    } catch (error) {
      console.error("Price estimation error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not reach the ML price service."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Backend currently uses estimated_range.
   * This also supports price_range in case the schema changes.
   */
  const range =
    result?.estimated_range ||
    result?.price_range;

  const comparableCount =
    result?.comparable_products_count ??
    result?.comparable_products?.length ??
    0;

  return (
    <div className="page-shell">
      <div className="container tool-wrap">

        {/* Back */}
        <Link href="/" className="card-link">
          <ArrowLeft size={15} />
          Back home
        </Link>

        {/* Header */}
        <div className="tool-header">
          <div>
            <div className="section-kicker">
              PRICE INTELLIGENCE
            </div>

            <h1 className="section-title">
              Price, with evidence.
            </h1>

            <p className="section-desc">
              A model estimate is combined with observed
              comparable listings. The range is an
              approximation, not a fixed artisan price.
            </p>
          </div>

          <div className="ai-icon">
            <IndianRupee size={25} />
          </div>
        </div>

        {/* Main Card */}
        <div className="tool-card">

          {/* Form */}
          <div className="field-grid">

            {/* Product Name */}
            <div className="field full">
              <label>Product name</label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. Handmade Bamboo Stool"
              />
            </div>

            {/* Material */}
            <div className="field">
              <label>Material</label>

              <input
                value={material}
                onChange={(e) =>
                  setMaterial(e.target.value)
                }
                placeholder="e.g. bamboo"
              />
            </div>

            {/* Product Type */}
            <div className="field">
              <label>Product type</label>

              <input
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
                placeholder="e.g. stool"
              />
            </div>

            {/* MRP */}
            <div className="field">
              <label>Reference MRP</label>

              <input
                type="number"
                min="0"
                value={mrp}
                onChange={(e) =>
                  setMrp(e.target.value)
                }
                placeholder="1500"
              />
            </div>
          </div>

          {/* Estimate Button */}
          <button
            className="btn btn-primary"
            style={{ marginTop: 18 }}
            onClick={estimate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Estimating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Estimate market range
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div
              style={{
                color: "#a9523c",
                marginTop: 18,
                padding: "14px 16px",
                borderRadius: 12,
                background: "#fff4f0",
                border: "1px solid #ead1c8",
              }}
            >
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="result">

              {/* Result label */}
              <div className="eyebrow">
                <CheckCircle2 size={14} />
                Model + market evidence
              </div>

              {/* Predicted Price */}
              <div className="result-price">
                ₹
                {Number(
                  result.predicted_price
                ).toLocaleString("en-IN")}
              </div>

              {/* Range */}
              {range && (
                <div className="range">
                  Observed estimate range · ₹
                  {Number(range.min).toLocaleString(
                    "en-IN"
                  )}{" "}
                  – ₹
                  {Number(range.max).toLocaleString(
                    "en-IN"
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="result-grid">

                {/* Confidence */}
                <div className="result-stat">
                  <small>Confidence</small>

                  <strong>
                    {result.confidence || "—"}
                  </strong>
                </div>

                {/* Comparison */}
                <div className="result-stat">
                  <small>
                    Comparison basis
                  </small>

                  <strong>
                    {result.comparison_basis ||
                      "Market comparables"}
                  </strong>
                </div>

                {/* Comparable products */}
                <div className="result-stat">
                  <small>
                    Comparable listings
                  </small>

                  <strong>
                    {comparableCount}
                  </strong>
                </div>
              </div>

              {/* Comparable Products */}
              {result.comparable_products &&
                result.comparable_products.length >
                  0 && (
                  <div className="sources">

                    <div className="section-kicker">
                      Comparable listings
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                        marginTop: 12,
                      }}
                    >
                      {result.comparable_products.map(
                        (product, index) => (
                          <div
                            className="source"
                            key={index}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent:
                                  "space-between",
                                alignItems:
                                  "flex-start",
                                gap: 15,
                              }}
                            >
                              <div>
                                <strong>
                                  {
                                    product.product_name
                                  }
                                </strong>

                                <small>
                                  ₹
                                  {Number(
                                    product.selling_price
                                  ).toLocaleString(
                                    "en-IN"
                                  )}

                                  {" · "}

                                  {product.material ||
                                    "—"}

                                  {" · "}

                                  {product.product_type ||
                                    "—"}

                                  {product.source && (
                                    <>
                                      {" · "}
                                      {
                                        product.source
                                      }
                                    </>
                                  )}
                                </small>
                              </div>

                              {product.url && (
                                <a
                                  href={product.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: "inline-flex",
                                    alignItems:
                                      "center",
                                    gap: 5,
                                    fontSize: 13,
                                    color:
                                      "#a9523c",
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  View
                                  <ExternalLink
                                    size={13}
                                  />
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}