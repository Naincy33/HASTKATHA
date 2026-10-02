"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ImagePlus,
  Sparkles,
  X,
  Check,
  Loader2,
  Package,
  Tag,
  MapPin,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  api,
  type Craft,
  type AIListing,
} from "@/lib/api";


export default function NewProductPage() {

  /* =========================
     IMAGE STATE
  ========================= */

  const [
    selectedImage,
    setSelectedImage,
  ] = useState<File | null>(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<string | null>(null);

  const [
    uploadedImageUrl,
    setUploadedImageUrl,
  ] = useState<string | null>(null);


  /* =========================
     AI STATE
  ========================= */

  const [
    aiListing,
    setAiListing,
  ] = useState<AIListing | null>(null);

  const [
    generating,
    setGenerating,
  ] = useState(false);


  /* =========================
     PUBLISH STATE
  ========================= */

  const [
    publishing,
    setPublishing,
  ] = useState(false);


  /* =========================
     CRAFTS
  ========================= */

  const [
    crafts,
    setCrafts,
  ] = useState<Craft[]>([]);

  const [
    selectedCraftId,
    setSelectedCraftId,
  ] = useState("");


  /* =========================
     FORM
  ========================= */

  const [
    productName,
    setProductName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    material,
    setMaterial,
  ] = useState("");

  const [
    productType,
    setProductType,
  ] = useState("");

  const [
    state,
    setState,
  ] = useState("");

  const [
    region,
    setRegion,
  ] = useState("");

  const [
    price,
    setPrice,
  ] = useState("");

  const [
    stock,
    setStock,
  ] = useState("1");


  /* =========================
     UI
  ========================= */

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] = useState<string | null>(null);


  /* =========================
     LOAD CRAFTS
  ========================= */

  useEffect(() => {

    async function loadCrafts() {

      try {

        const data =
          await api.getCrafts();

        setCrafts(data);

      } catch (err) {

        console.error(
          "Could not load crafts:",
          err
        );

      }

    }

    loadCrafts();

  }, []);


  /* =========================
     IMAGE SELECT
  ========================= */

  function handleImageChange(
    event:
      React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      setError(
        "Please select an image file."
      );

      return;
    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      setError(
        "Image must be smaller than 10 MB."
      );

      return;
    }


    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }


    setSelectedImage(file);

    setPreviewUrl(
      URL.createObjectURL(file)
    );

    setUploadedImageUrl(null);

    setAiListing(null);

    setError(null);

    setSuccess(null);

  }


  /* =========================
     REMOVE IMAGE
  ========================= */

  function removeImage() {

    if (previewUrl) {

      URL.revokeObjectURL(
        previewUrl
      );

    }

    setSelectedImage(null);

    setPreviewUrl(null);

    setUploadedImageUrl(null);

    setAiListing(null);

  }


  /* =========================
     GENERATE AI LISTING
  ========================= */

  async function handleGenerateListing() {

    if (!selectedImage) {

      setError(
        "Please choose a product image first."
      );

      return;
    }


    try {

      setGenerating(true);

      setError(null);

      setSuccess(null);


      /*
       * First upload image
       */

      const uploadResult =
        await api.uploadProductImage(
          selectedImage
        );


      setUploadedImageUrl(
        uploadResult.image_url
      );


      /*
       * Then AI analysis
       */

      const result =
        await api.generateProductListing(
          selectedImage
        );


      const listing =
        result.data;


      setAiListing(
        listing
      );


      /*
       * Fill editable fields
       */

      setProductName(
        listing.product_name || ""
      );

      setDescription(
        listing.description || ""
      );

      setMaterial(
        listing.material || ""
      );

      setProductType(
        listing.product_type || ""
      );

      setState(
        listing.state || ""
      );

      setRegion(
        listing.region || ""
      );


      /*
       * Try to automatically
       * match AI craft name
       */

      if (
        listing.craft_name &&
        crafts.length > 0
      ) {

        const aiCraft =
          listing.craft_name
            .toLowerCase()
            .trim();


        const matchedCraft =
          crafts.find(
            (craft) =>
              craft.name
                .toLowerCase()
                .includes(aiCraft) ||
              aiCraft.includes(
                craft.name
                  .toLowerCase()
              )
          );


        if (matchedCraft) {

          setSelectedCraftId(
            String(
              matchedCraft.id
            )
          );

        }

      }


      setSuccess(
        "AI listing generated. Review the details before publishing."
      );

    } catch (err) {

      console.error(
        "AI listing failed:",
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : "AI listing generation failed."
      );

    } finally {

      setGenerating(false);

    }

  }


  /* =========================
     PUBLISH PRODUCT
  ========================= */

  async function handlePublish() {

    setError(null);

    setSuccess(null);


    if (!selectedImage) {

      setError(
        "Please upload a product image."
      );

      return;
    }


    if (!uploadedImageUrl) {

      setError(
        "Please generate the AI listing first."
      );

      return;
    }


    if (!productName.trim()) {

      setError(
        "Product name is required."
      );

      return;
    }


    if (!description.trim()) {

      setError(
        "Product description is required."
      );

      return;
    }


    if (!selectedCraftId) {

      setError(
        "Please select the craft."
      );

      return;
    }


    const numericPrice =
      Number(price);

    if (
      !price ||
      Number.isNaN(numericPrice) ||
      numericPrice <= 0
    ) {

      setError(
        "Please enter a valid selling price."
      );

      return;
    }


    const numericStock =
      Number(stock);

    if (
      Number.isNaN(numericStock) ||
      numericStock < 0
    ) {

      setError(
        "Please enter a valid stock quantity."
      );

      return;
    }


    try {

      setPublishing(true);


      /*
       * Create product
       */

      const product =
        await api.createProduct({

          craft_id:
            Number(
              selectedCraftId
            ),

          name:
            productName.trim(),

          description:
            description.trim(),

          price:
            numericPrice,

          stock:
            numericStock,

          material:
            material.trim() ||
            undefined,

        });


      /*
       * Attach image
       */

      await api.createProductImage({

        product_id:
          product.id,

        image_url:
          uploadedImageUrl,

        is_primary:
          true,

      });


      setSuccess(
        "🎉 Product published successfully!"
      );


      /*
       * Redirect to seller dashboard
       */

      setTimeout(() => {

        window.location.href =
          "/seller";

      }, 1200);


    } catch (err) {

      console.error(
        "Publish failed:",
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : "Could not publish product."
      );

    } finally {

      setPublishing(false);

    }

  }


  return (

    <main className="min-h-screen bg-[#f6f1e7] text-[#202720]">

      {/* =========================
          HEADER
      ========================= */}

      <div className="mx-auto max-w-6xl px-6 py-8">

        <Link
          href="/seller"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5e665f] hover:text-[#202720]"
        >

          <ArrowLeft
            size={18}
          />

          Back to seller dashboard

        </Link>


        <div className="mt-12">

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c55235]">

            HASTKATHA INTELLIGENCE

          </p>


          <h1 className="mt-3 font-serif text-5xl font-bold tracking-tight md:text-7xl">

            Create your listing.

          </h1>


          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#697069]">

            Upload a photo of your craft and let
            HASTKATHA help turn it into a
            marketplace-ready product listing.

          </p>

        </div>


        {/* =========================
            ERROR / SUCCESS
        ========================= */}

        {error && (

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">

            {error}

          </div>

        )}


        {success && (

          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">

            {success}

          </div>

        )}


        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">

          {/* =========================
              LEFT — IMAGE
          ========================= */}

          <section className="rounded-[28px] border border-[#ddd7ca] bg-[#fbf8f1] p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c55235]">

                  Step 01

                </p>

                <h2 className="mt-2 font-serif text-3xl font-bold">

                  Product photo

                </h2>

              </div>


              {uploadedImageUrl && (

                <div className="flex items-center gap-1 rounded-full bg-[#e5efe1] px-3 py-1.5 text-xs font-bold text-[#365337]">

                  <Check
                    size={14}
                  />

                  Uploaded

                </div>

              )}

            </div>


            {!previewUrl ? (

              <label className="mt-8 flex min-h-[420px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#d4cec1] bg-[#f5f1e8] text-center transition hover:border-[#c55235]">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e5eee1]">

                  <ImagePlus
                    size={28}
                  />

                </div>


                <h3 className="mt-5 text-xl font-bold">

                  Upload your craft

                </h3>


                <p className="mt-2 max-w-xs text-sm leading-6 text-[#777d76]">

                  Take a clear photo of your
                  handmade product.

                </p>


                <span className="mt-6 rounded-full bg-[#202720] px-6 py-3 text-sm font-bold text-white">

                  Choose image

                </span>


                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handleImageChange
                  }
                />

              </label>

            ) : (

              <div className="mt-8">

                <div className="relative overflow-hidden rounded-3xl bg-[#eee9df]">

                  <img
                    src={previewUrl}
                    alt="Product preview"
                    className="h-[420px] w-full object-cover"
                  />


                  <button
                    type="button"
                    onClick={
                      removeImage
                    }
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#202720] shadow"
                  >

                    <X
                      size={18}
                    />

                  </button>

                </div>


                <button
                  type="button"
                  onClick={
                    handleGenerateListing
                  }
                  disabled={generating}
                  className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#202720] px-6 py-4 font-bold text-white transition hover:bg-[#303a32] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {generating ? (

                    <>
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />

                      HASTKATHA is analysing...

                    </>

                  ) : (

                    <>
                      <Sparkles
                        size={19}
                      />

                      Generate listing with AI

                    </>

                  )}

                </button>

              </div>

            )}

          </section>


          {/* =========================
              RIGHT — FORM
          ========================= */}

          <section className="rounded-[28px] border border-[#ddd7ca] bg-[#fbf8f1] p-6">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c55235]">

                Step 02

              </p>

              <h2 className="mt-2 font-serif text-3xl font-bold">

                Review your listing

              </h2>

              <p className="mt-2 text-sm leading-6 text-[#777d76]">

                AI suggestions are editable.
                Review everything before publishing.

              </p>

            </div>


            {/* AI confidence */}

            {aiListing && (

              <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#e8efe4] px-4 py-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">

                    <Sparkles
                      size={17}
                    />

                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wide text-[#65705f]">

                      AI confidence

                    </p>

                    <p className="font-bold capitalize">

                      {aiListing.confidence}

                    </p>

                  </div>

                </div>

              </div>

            )}


            <div className="mt-7 space-y-5">

              {/* PRODUCT NAME */}

              <div>

                <label className="mb-2 block text-sm font-bold">

                  Product name

                </label>

                <input
                  value={productName}
                  onChange={(e) =>
                    setProductName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Handwoven Silk Dupatta"
                  className="w-full rounded-2xl border border-[#d5d0c5] bg-white px-4 py-3.5 outline-none transition focus:border-[#202720]"
                />

              </div>


              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-bold">

                  Description

                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={5}
                  placeholder="Describe your product..."
                  className="w-full resize-none rounded-2xl border border-[#d5d0c5] bg-white px-4 py-3.5 outline-none transition focus:border-[#202720]"
                />

              </div>


              {/* MATERIAL + TYPE */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-bold">

                    Material

                  </label>

                  <input
                    value={material}
                    onChange={(e) =>
                      setMaterial(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Silk"
                    className="w-full rounded-2xl border border-[#d5d0c5] bg-white px-4 py-3.5 outline-none focus:border-[#202720]"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-bold">

                    Product type

                  </label>

                  <input
                    value={productType}
                    onChange={(e) =>
                      setProductType(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Dupatta"
                    className="w-full rounded-2xl border border-[#d5d0c5] bg-white px-4 py-3.5 outline-none focus:border-[#202720]"
                  />

                </div>

              </div>


              {/* CRAFT */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-bold">

                  <Tag
                    size={15}
                  />

                  Craft

                </label>

                <select
                  value={selectedCraftId}
                  onChange={(e) =>
                    setSelectedCraftId(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#d5d0c5] bg-white px-4 py-3.5 outline-none focus:border-[#202720]"
                >

                  <option value="">
                    Select the craft
                  </option>

                  {crafts.map(
                    (craft) => (

                      <option
                        key={
                          craft.id
                        }
                        value={
                          craft.id
                        }
                      >

                        {craft.name}

                      </option>

                    )
                  )}

                </select>

                {aiListing?.craft_name && (

                  <p className="mt-2 text-xs text-[#777d76]">

                    AI suggestion:{" "}
                    <strong>
                      {
                        aiListing.craft_name
                      }
                    </strong>

                  </p>

                )}

              </div>


              {/* LOCATION */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 flex items-center gap-2 text-sm font-bold">

                    <MapPin
                      size={15}
                    />

                    State

                  </label>

                  <input
                    value={state}
                    onChange={(e) =>
                      setState(
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                    className="w-full rounded-2xl border border-[#d5d0c5] bg-white px-4 py-3.5 outline-none focus:border-[#202720]"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-bold">

                    Region

                  </label>

                  <input
                    value={region}
                    onChange={(e) =>
                      setRegion(
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                    className="w-full rounded-2xl border border-[#d5d0c5] bg-white px-4 py-3.5 outline-none focus:border-[#202720]"
                  />

                </div>

              </div>


              {/* PRICE + STOCK */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 flex items-center gap-2 text-sm font-bold">

                    ₹ Selling price

                  </label>

                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value
                      )
                    }
                    placeholder="Enter your price"
                    className="w-full rounded-2xl border border-[#d5d0c5] bg-white px-4 py-3.5 outline-none focus:border-[#202720]"
                  />

                  <p className="mt-2 text-xs text-[#777d76]">

                    You decide the final selling price.

                  </p>

                </div>


                <div>

                  <label className="mb-2 flex items-center gap-2 text-sm font-bold">

                    <Package
                      size={15}
                    />

                    Stock

                  </label>

                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) =>
                      setStock(
                        e.target.value
                      )
                    }
                    className="w-full rounded-2xl border border-[#d5d0c5] bg-white px-4 py-3.5 outline-none focus:border-[#202720]"
                  />

                </div>

              </div>


              {/* TAGS */}

              {aiListing &&
                aiListing.tags?.length >
                  0 && (

                  <div>

                    <label className="mb-3 block text-sm font-bold">

                      AI suggested tags

                    </label>

                    <div className="flex flex-wrap gap-2">

                      {aiListing.tags.map(
                        (
                          tag,
                          index
                        ) => (

                          <span
                            key={
                              index
                            }
                            className="rounded-full bg-[#ece7dc] px-3 py-1.5 text-xs font-semibold text-[#596059]"
                          >

                            #{tag}

                          </span>

                        )
                      )}

                    </div>

                  </div>

                )}


              {/* VISUAL FEATURES */}

              {aiListing &&
                aiListing
                  .visual_features
                  ?.length >
                  0 && (

                  <div>

                    <label className="mb-3 block text-sm font-bold">

                      What AI noticed

                    </label>

                    <ul className="space-y-2">

                      {aiListing.visual_features.map(
                        (
                          feature,
                          index
                        ) => (

                          <li
                            key={
                              index
                            }
                            className="flex gap-2 text-sm text-[#687068]"
                          >

                            <Check
                              size={16}
                              className="mt-0.5 shrink-0 text-[#c55235]"
                            />

                            {feature}

                          </li>

                        )
                      )}

                    </ul>

                  </div>

                )}


              {/* PUBLISH */}

              <button
                type="button"
                onClick={
                  handlePublish
                }
                disabled={
                  publishing ||
                  generating ||
                  !aiListing
                }
                className="mt-3 flex w-full items-center justify-center gap-3 rounded-full bg-[#202720] px-6 py-4 font-bold text-white transition hover:bg-[#303a32] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {publishing ? (

                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />

                    Publishing...

                  </>

                ) : (

                  <>
                    <Check
                      size={19}
                    />

                    Publish product

                  </>

                )}

              </button>


              {!aiListing && (

                <p className="text-center text-xs text-[#858a84]">

                  Upload an image and generate
                  the AI listing before publishing.

                </p>

              )}

            </div>

          </section>

        </div>

      </div>

    </main>

  );
}