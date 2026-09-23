"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ImagePlus,
  Sparkles,
  X,
} from "lucide-react";

import { useState } from "react";


export default function NewProductPage() {

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);


  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Basic validation
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be smaller than 10 MB.");
      return;
    }

    setSelectedImage(file);

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);
  }


  function removeImage() {

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(null);
    setPreviewUrl(null);
  }


  return (
    <main className="seller-page">

      <div className="container">

        {/* BACK */}

        <Link
          href="/seller"
          className="back-link"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>


        {/* HEADER */}

        <section className="new-product-header">

          <div className="section-kicker">
            NEW LISTING
          </div>

          <h1>
            Turn your craft
            <br />
            <i>into a story.</i>
          </h1>

          <p>
            Start with a photograph. HASTKATHA will
            help transform it into a complete product
            listing.
          </p>

        </section>


        {/* UPLOAD CARD */}

        <section className="ai-upload-card">

          <div className="upload-icon">
            <ImagePlus size={32} />
          </div>


          <h2>
            Upload your craft
          </h2>


          <p>
            Upload a clear photograph of your handmade
            product.
          </p>


          {/* =================================================
              NO IMAGE
          ================================================= */}

          {!previewUrl && (

            <label className="upload-box">

              <ImagePlus size={25} />

              <strong>
                Choose product image
              </strong>

              <span>
                JPG, PNG or WEBP · Max 10 MB
              </span>


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

                <img
                  src={previewUrl}
                  alt="Selected product"
                />


                <button
                  type="button"
                  className="remove-image"
                  onClick={removeImage}
                  aria-label="Remove image"
                >
                  <X size={18} />
                </button>

              </div>


              <div className="selected-file">

                <div>

                  <strong>
                    {selectedImage?.name}
                  </strong>

                  <span>
                    {selectedImage
                      ? (
                        selectedImage.size /
                        1024 /
                        1024
                      ).toFixed(2)
                      : "0"
                    } MB
                  </span>

                </div>


                <label className="change-image">

                  Change image

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    hidden
                  />

                </label>

              </div>

            </div>

          )}


          {/* =================================================
              AI BUTTON
          ================================================= */}

          {selectedImage && (

            <button
              type="button"
              className="generate-listing-btn"
              onClick={() => {
                console.log(
                  "Selected image:",
                  selectedImage
                );
              }}
            >

              <Sparkles size={18} />

              Generate listing with AI

            </button>

          )}


          {!selectedImage && (

            <div className="ai-coming">

              <Sparkles size={18} />

              Upload an image to continue

            </div>

          )}

        </section>

      </div>

    </main>
  );
}