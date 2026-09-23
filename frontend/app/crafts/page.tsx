"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  MapPin,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import { api, Craft } from "@/lib/api";


export default function CraftsPage() {

  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [state, setState] = useState("");

  async function loadCrafts() {

    try {

      setLoading(true);
      setError("");

      const data = await api.getCrafts({
        search: search || undefined,
        state: state || undefined,
        limit: 50,
      });

      setCrafts(data);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load crafts."
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    loadCrafts();
  }, []);


  return (
    <main className="min-h-screen bg-[#f6f1e7] px-6 py-8">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mx-auto max-w-7xl">

        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#a94f35]"
        >
          <ArrowLeft size={17} />
          Back home
        </Link>


        <div className="mb-12 max-w-3xl">

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#b65338]">
            HASTKATHA ARCHIVE
          </p>

          <h1 className="font-serif text-5xl leading-tight text-[#20251f] md:text-7xl">
            Explore India&apos;s
            <br />
            living crafts.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#697067]">
            Discover traditional crafts from across India,
            explore their origins, and learn the stories behind
            the people and places that keep them alive.
          </p>

        </div>


        {/* ================================================= */}
        {/* SEARCH */}
        {/* ================================================= */}

        <div className="mb-12 rounded-[28px] border border-[#ded6c9] bg-white/70 p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">

            {/* Search */}

            <div className="relative">

              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7b8179]"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search crafts, materials, techniques..."
                className="w-full rounded-2xl border border-[#ddd5c8] bg-[#faf8f3] px-12 py-4 outline-none transition focus:border-[#b65338]"
              />

            </div>


            {/* State */}

            <input
              value={state}
              onChange={(e) =>
                setState(e.target.value)
              }
              placeholder="Filter by state"
              className="rounded-2xl border border-[#ddd5c8] bg-[#faf8f3] px-4 py-4 outline-none transition focus:border-[#b65338]"
            />


            {/* Search button */}

            <button
              onClick={loadCrafts}
              className="rounded-2xl bg-[#20251f] px-7 py-4 font-semibold text-white transition hover:scale-[1.02]"
            >
              Explore
            </button>

          </div>

        </div>


        {/* ================================================= */}
        {/* RESULTS */}
        {/* ================================================= */}

        {loading && (

          <div className="py-20 text-center text-[#697067]">
            Loading crafts...
          </div>

        )}


        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>

        )}


        {!loading && !error && (

          <>
            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b9189]">
                  CRAFT COLLECTION
                </p>

                <h2 className="mt-2 font-serif text-3xl text-[#20251f]">
                  {crafts.length} crafts found
                </h2>

              </div>

              <Sparkles
                size={28}
                className="text-[#b65338]"
              />

            </div>


            {crafts.length === 0 ? (

              <div className="rounded-[28px] bg-white p-12 text-center">

                <h3 className="font-serif text-3xl text-[#20251f]">
                  No crafts found
                </h3>

                <p className="mt-3 text-[#697067]">
                  Try another craft name or state.
                </p>

              </div>

            ) : (

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {crafts.map((craft) => (

                  <Link
                    key={craft.id}
                    href={`/crafts/${craft.id}`}
                    className="group rounded-[28px] border border-[#ded6c9] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* Category */}

                    <div className="mb-6 flex items-center justify-between">

                      <span className="rounded-full bg-[#edf1e7] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#59665a]">
                        {craft.gi_status || "Traditional craft"}
                      </span>

                      <ChevronRight
                        size={20}
                        className="text-[#a94f35] transition-transform group-hover:translate-x-1"
                      />

                    </div>


                    {/* Name */}

                    <h3 className="font-serif text-3xl text-[#20251f]">
                      {craft.name}
                    </h3>


                    {/* Description */}

                    <p className="mt-4 line-clamp-3 leading-7 text-[#697067]">
                      {craft.description ||
                        "A traditional Indian craft preserved through generations of skilled artisans."}
                    </p>


                    {/* Location */}

                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[#737970]">

                      <MapPin size={16} />

                      <span>
                        {craft.state || "India"}
                        {craft.region
                          ? ` · ${craft.region}`
                          : ""}
                      </span>

                    </div>


                    {/* Material / technique */}

                    <div className="mt-5 flex flex-wrap gap-2">

                      {craft.material && (
                        <span className="rounded-full bg-[#f5eee3] px-3 py-1 text-xs text-[#6b6b61]">
                          {craft.material}
                        </span>
                      )}

                      {craft.technique && (
                        <span className="rounded-full bg-[#f5eee3] px-3 py-1 text-xs text-[#6b6b61]">
                          {craft.technique}
                        </span>
                      )}

                    </div>


                    <div className="mt-7 border-t border-[#eee8dc] pt-5 text-sm font-semibold text-[#a94f35]">
                      Explore story →
                    </div>

                  </Link>

                ))}

              </div>

            )}

          </>

        )}

      </div>

    </main>
  );
}