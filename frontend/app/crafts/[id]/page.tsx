"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

import { api, CraftDetails } from "@/lib/api";


export default function CraftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const [data, setData] = useState<CraftDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    async function loadCraft() {

      try {

        const { id } = await params;

        const result =
          await api.getCraftDetails(
            Number(id)
          );

        setData(result);

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load craft."
        );

      } finally {

        setLoading(false);

      }
    }

    loadCraft();

  }, [params]);


  if (loading) {

    return (
      <main className="min-h-screen bg-[#f6f1e7] px-6 py-20">
        <div className="mx-auto max-w-6xl text-center text-[#697067]">
          Loading craft story...
        </div>
      </main>
    );
  }


  if (error || !data) {

    return (
      <main className="min-h-screen bg-[#f6f1e7] px-6 py-20">

        <div className="mx-auto max-w-6xl">

          <Link
            href="/crafts"
            className="inline-flex items-center gap-2 text-[#a94f35]"
          >
            <ArrowLeft size={18} />
            Back to crafts
          </Link>

          <div className="mt-12 rounded-[28px] bg-white p-10">
            <h1 className="font-serif text-4xl">
              Craft not found
            </h1>

            <p className="mt-3 text-[#697067]">
              {error || "Unable to load this craft."}
            </p>
          </div>

        </div>

      </main>
    );
  }


  const craft = data.craft;


  return (
    <main className="min-h-screen bg-[#f6f1e7] px-6 py-8">

      <div className="mx-auto max-w-6xl">

        {/* ================================================= */}
        {/* BACK */}
        {/* ================================================= */}

        <Link
          href="/crafts"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#a94f35]"
        >
          <ArrowLeft size={17} />
          Back to crafts
        </Link>


        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="mt-12 rounded-[36px] bg-[#20251f] p-8 text-white md:p-14">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#d08a70]">
            HASTKATHA CRAFT ARCHIVE
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-tight md:text-7xl">
            {craft.name}
          </h1>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-[#d8ddd4]">

            {craft.state && (
              <span className="flex items-center gap-2">
                <MapPin size={16} />
                {craft.state}
                {craft.region
                  ? ` · ${craft.region}`
                  : ""}
              </span>
            )}

            {craft.gi_status && (
              <span className="rounded-full bg-white/10 px-4 py-2">
                GI: {craft.gi_status}
              </span>
            )}

          </div>

        </section>


        {/* ================================================= */}
        {/* STORY */}
        {/* ================================================= */}

        <section className="mt-10 grid gap-8 md:grid-cols-[1.4fr_0.6fr]">

          <div className="rounded-[30px] bg-white p-8 md:p-10">

            <div className="flex items-center gap-3">

              <Sparkles
                size={20}
                className="text-[#b65338]"
              />

              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#b65338]">
                The story
              </p>

            </div>

            <h2 className="mt-5 font-serif text-4xl text-[#20251f]">
              A craft shaped by place and tradition.
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#697067]">
              {craft.description ||
                "This craft is part of India's rich living heritage, preserved through generations of skilled artisans."}
            </p>

          </div>


          {/* DETAILS */}

          <div className="rounded-[30px] bg-[#e9eee4] p-8">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#697067]">
              Craft details
            </p>

            <div className="mt-7 space-y-6">

              {craft.state && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#8a9188]">
                    State
                  </p>

                  <p className="mt-1 font-semibold text-[#20251f]">
                    {craft.state}
                  </p>
                </div>
              )}


              {craft.region && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#8a9188]">
                    Region
                  </p>

                  <p className="mt-1 font-semibold text-[#20251f]">
                    {craft.region}
                  </p>
                </div>
              )}


              {craft.material && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#8a9188]">
                    Material
                  </p>

                  <p className="mt-1 font-semibold text-[#20251f]">
                    {craft.material}
                  </p>
                </div>
              )}


              {craft.technique && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#8a9188]">
                    Technique
                  </p>

                  <p className="mt-1 font-semibold text-[#20251f]">
                    {craft.technique}
                  </p>
                </div>
              )}

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* PRODUCTS */}
        {/* ================================================= */}

        <section className="mt-16">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#b65338]">
                Shop this tradition
              </p>

              <h2 className="mt-3 font-serif text-4xl text-[#20251f]">
                Products from this craft
              </h2>

            </div>

            <ShoppingBag
              size={28}
              className="text-[#b65338]"
            />

          </div>


          {data.products.length === 0 ? (

            <div className="mt-8 rounded-[28px] border border-[#ded6c9] bg-white p-10">

              <h3 className="font-serif text-2xl text-[#20251f]">
                Products coming soon
              </h3>

              <p className="mt-3 max-w-xl leading-7 text-[#697067]">
                Artisans will be able to list products from this
                craft tradition here. HASTKATHA's AI-assisted
                seller workflow will make that process easier.
              </p>

            </div>

          ) : (

            <div className="mt-8 grid gap-6 md:grid-cols-3">

              {data.products.map((product) => (

                <div
                  key={product.id}
                  className="rounded-[28px] bg-white p-7 shadow-sm"
                >

                  <h3 className="font-serif text-2xl text-[#20251f]">
                    {product.name}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-[#697067]">
                    {product.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between">

                    <span className="text-xl font-bold text-[#20251f]">
                      ₹{product.price}
                    </span>

                    <span className="text-sm text-[#697067]">
                      {product.stock} available
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ================================================= */}
        {/* AI */}
        {/* ================================================= */}

        <section className="mt-16 rounded-[30px] bg-[#e9eee4] p-8 md:p-12">

          <div className="max-w-2xl">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#b65338]">
              HASTKATHA AI
            </p>

            <h2 className="mt-3 font-serif text-4xl text-[#20251f]">
              Curious about this craft?
            </h2>

            <p className="mt-4 leading-7 text-[#697067]">
              Ask HASTKATHA about the history, region,
              techniques and heritage records associated
              with this craft.
            </p>

            <Link
              href="/ai-assistant"
              className="mt-7 inline-flex rounded-full bg-[#20251f] px-6 py-3 font-semibold text-white"
            >
              Ask HASTKATHA →
            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}