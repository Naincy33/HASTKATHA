"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ImagePlus,
  Sparkles,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

export default function NewProductPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [aiListing, setAiListing] = useState<{
    product_name: string;
    description: string;
    material: string;
    product_type: string;
    craft_name: string;
    region: string | null;
    state: string | null;
    ocr_text: string | null;
    tags: string[];
    visual_features: string[];
    confidence: string;
  } | null>(null);

  // ============================================================
  // IMAGE SELECT
  // ============================================================

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setUploadedImageUrl(null);

    // Image validation
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10 MB.");
      return;
    }

    // Remove previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);
  }

  // ============================================================
  // REMOVE IMAGE
  // ============================================================

  function removeImage() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setError(null);
  }

  // ============================================================
  // UPLOAD IMAGE
  // ============================================================
  async function handleGenerateListing() {
    if (!selectedImage) {
      setError("Please choose a product image first.");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Step 1: Upload image
      const uploadResult = await api.uploadProductImage(selectedImage);

      setUploadedImageUrl(uploadResult.image_url);

      // Step 2: AI analysis
      const aiResult = await api.generateProductListing(selectedImage);

      console.log("AI listing:", aiResult);

      // Step 3: Store AI result in state
      setAiListing(aiResult.data);
    } catch (err) {
      console.error("Listing generation failed:", err);

      setError(
        err instanceof Error ? err.message : "AI listing generation failed.",
      );
    } finally {
      setUploading(false);
    }
  }
  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="seller-page">
      <div className="container">
        {/* =====================================================
            BACK
        ===================================================== */}

        <Link href="/seller" className="back-link">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="new-product-header">
          <div className="section-kicker">NEW LISTING</div>

          <h1>
            Turn your craft
            <br />
            <i>into a story.</i>
          </h1>

          <p>
            Start with a photograph. HASTKATHA will help transform it into a
            complete product listing.
          </p>
        </section>

        {/* =====================================================
            UPLOAD CARD
        ===================================================== */}

        <section className="ai-upload-card">
          <div className="upload-icon">
            <ImagePlus size={32} />
          </div>

          <h2>Upload your craft</h2>

          <p>Upload a clear photograph of your handmade product.</p>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              style={{
                marginTop: 20,
                padding: "12px 16px",
                borderRadius: 12,
                background: "#fff0ed",
                color: "#b7472a",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {/* =================================================
              NO IMAGE
          ================================================= */}

          {!previewUrl && (
            <label className="upload-box">
              <ImagePlus size={25} />

              <strong>Choose product image</strong>

              <span>JPG, PNG or WEBP · Max 10 MB</span>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                hidden
              />
            </label>
          )}

          {/* =================================================
              IMAGE PREVIEW
          ================================================= */}

          {previewUrl && (
            <div className="image-preview-wrapper">
              <div className="image-preview">
                <img src={previewUrl} alt="Selected product" />

                {!uploading && (
                  <button
                    type="button"
                    className="remove-image"
                    onClick={removeImage}
                    aria-label="Remove image"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="selected-file">
                <div>
                  <strong>{selectedImage?.name}</strong>

                  <span>
                    {selectedImage
                      ? (selectedImage.size / 1024 / 1024).toFixed(2)
                      : "0"}{" "}
                    MB
                  </span>
                </div>

                {!uploading && (
                  <label className="change-image">
                    Change image
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                      hidden
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* =================================================
              GENERATE / UPLOAD BUTTON
          ================================================= */}

          {selectedImage && (
            <button
              type="button"
              className="generate-listing-btn"
              onClick={handleGenerateListing}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading image...
                </>
              ) : uploadedImageUrl ? (
                <>
                  <CheckCircle2 size={18} />
                  Image uploaded ✓
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate listing with AI
                </>
              )}
            </button>
          )}

          {/* =================================================
              UPLOAD SUCCESS
          ================================================= */}

          {uploadedImageUrl && (
            <div
              style={{
                marginTop: 24,
                padding: 20,
                borderRadius: 16,
                background: "#eef4e9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={18} />
                Product image uploaded successfully
              </div>

              <img
                src={
                  uploadedImageUrl.startsWith("http")
                    ? uploadedImageUrl
                    : `${process.env.NEXT_PUBLIC_API_URL}${uploadedImageUrl}`
                }
                alt="Uploaded product"
                style={{
                  width: "100%",
                  maxWidth: 320,
                  height: 260,
                  objectFit: "cover",
                  borderRadius: 14,
                }}
              />

              <p
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  opacity: 0.7,
                }}
              >
                Your image is now stored and ready for AI listing generation.
              </p>
            </div>
          )}

          {/* =================================================
              NO IMAGE MESSAGE
          ================================================= */}

          {!selectedImage && (
            <div className="ai-coming">
              <Sparkles size={18} />
              Upload an image to continue
            </div>
          )}

          {/* =================================================
              NEXT STEP MESSAGE
          ================================================= */}

          {uploadedImageUrl && (
            <div
              className="ai-coming"
              style={{
                marginTop: 16,
              }}
            >
              <Sparkles size={18} />
              AI product description generation comes next
            </div>
          )}

          {aiListing && (
            <div className="mt-8 rounded-3xl border border-[#d8d2c4] bg-[#f8f5ed] p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">
                    AI Generated Listing
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-600">
                  Review and edit the AI-generated details before publishing.
                </p>
              </div>

              {/* Product Name */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium">
                  Product Name
                </label>

                <input
                  value={aiListing.product_name}
                  onChange={(e) =>
                    setAiListing({
                      ...aiListing,
                      product_name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none"
                />
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={aiListing.description}
                  onChange={(e) =>
                    setAiListing({
                      ...aiListing,
                      description: e.target.value,
                    })
                  }
                  rows={6}
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none"
                />
              </div>

              {/* Material + Product Type */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Material
                  </label>

                  <input
                    value={aiListing.material}
                    onChange={(e) =>
                      setAiListing({
                        ...aiListing,
                        material: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Product Type
                  </label>

                  <input
                    value={aiListing.product_type}
                    onChange={(e) =>
                      setAiListing({
                        ...aiListing,
                        product_type: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  />
                </div>
              </div>

              {/* Craft */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">Craft</label>

                <input
                  value={aiListing.craft_name}
                  onChange={(e) =>
                    setAiListing({
                      ...aiListing,
                      craft_name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                />
              </div>

              {/* State + Region */}
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    State
                  </label>

                  <input
                    value={aiListing.state || ""}
                    onChange={(e) =>
                      setAiListing({
                        ...aiListing,
                        state: e.target.value,
                      })
                    }
                    placeholder="Not identified"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Region
                  </label>

                  <input
                    value={aiListing.region || ""}
                    onChange={(e) =>
                      setAiListing({
                        ...aiListing,
                        region: e.target.value,
                      })
                    }
                    placeholder="Not identified"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">Tags</label>

                <div className="flex flex-wrap gap-2">
                  {aiListing.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-[#e5dfd1] px-3 py-1 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Confidence */}
              <div className="mt-6 rounded-xl bg-white p-4">
                <p className="text-sm text-gray-600">AI Confidence</p>

                <p className="mt-1 font-semibold capitalize">
                  {aiListing.confidence}
                </p>
              </div>

              {/* Price + Stock */}
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Your Selling Price (₹)
                  </label>

                  <input
                    type="number"
                    placeholder="Enter your price"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  />
                </div>
              </div>

              {/* Publish */}
              <button className="mt-8 w-full rounded-xl bg-[#24231f] px-6 py-4 font-medium text-white transition hover:opacity-90">
                Publish Product
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
