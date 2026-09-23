"use client";

import Link from "next/link";

import { ArrowRight, Bot, Sparkles } from "lucide-react";

import { motion } from "framer-motion";

import { useEffect, useState } from "react";

import { api, Craft as CraftType } from "@/lib/api";

/* ============================================================
   IMAGES
============================================================ */

const images = {
  hero: "https://commons.wikimedia.org/wiki/Special:FilePath/Bamboo_craft_work.jpg?width=1400",

  bamboo:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Bamboo_products_made_by_tribals.jpg?width=1000",

  madhubani:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Madhubani_art.jpg?width=1000",

  dhokra:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Dokra_from_tribes_of_Bastar_DSCN1172_01.jpg?width=1000",
};

/* ============================================================
   FEATURED CRAFT CONFIG
============================================================ */

const featuredCrafts = [
  {
    image: images.bamboo,

    tag: "Bamboo · India",

    title: "Bamboo Craft",

    aliases: ["Bamboo Craft", "Bamboo Products", "Bamboo Art", "Bamboo Crafts"],

    text: "Everyday objects shaped from one of India's most versatile natural materials.",
  },

  {
    image: images.madhubani,

    tag: "Mithila · Bihar",

    title: "Madhubani Art",

    aliases: ["Madhubani Painting", "Madhubani Paintings", "Madhubani Art"],

    text: "Intricate lines, natural colours and stories rooted in the Mithila tradition.",
  },

  {
    image: images.dhokra,

    tag: "Bastar · Chhattisgarh",

    title: "Dhokra Metalwork",

    aliases: ["Dhokra", "Dhokra Metalwork", "Dokra", "Dokra Metalwork"],

    text: "Lost-wax casting transforms metal into expressive figures and ritual forms.",
  },
];

/* ============================================================
   HOME
============================================================ */

export default function Home() {
  const [crafts, setCrafts] = useState<CraftType[]>([]);

  const [craftsLoading, setCraftsLoading] = useState(true);

  /* ==========================================================
     LOAD REAL CRAFTS FROM BACKEND
  ========================================================== */

  useEffect(() => {
    async function loadCrafts() {
      try {
        const data = await api.getCrafts();

        setCrafts(data);
      } catch (error) {
        console.error("Failed to load crafts:", error);
      } finally {
        setCraftsLoading(false);
      }
    }

    loadCrafts();
  }, []);

  /* ==========================================================
     FIND DATABASE CRAFT ID
  ========================================================== */

  function findCraftId(aliases: string[]): number | null {
    const found = crafts.find((craft) => {
      const dbName = craft.name.trim().toLowerCase();

      return aliases.some((alias) => alias.trim().toLowerCase() === dbName);
    });

    return found?.id ?? null;
  }

  return (
    <>
      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="nav">
        <Link href="/" className="brand">
          <span className="brand-mark">ह</span>
          HASTKATHA
        </Link>

        <div className="navlinks">
          <a href="#discover">Discover</a>

          <Link href="/products">Shop</Link>

          <a href="#intelligence">Intelligence</a>

          <a href="#mission">Mission</a>

          <Link href="/seller">Sell with HASTKATHA</Link>
        </div>

        <Link href="/ai-assistant" className="nav-cta">
          Ask HASTKATHA
        </Link>
      </nav>

      <main>
        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="hero">
          <div className="container hero-grid">
            <motion.div
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
              }}
            >
              <div className="eyebrow">
                <span className="dot" />
                Digital ecosystem for Indian crafts
              </div>

              <h1>
                Stories
                <br />
                <i>Woven</i> by Hand.
              </h1>

              <p className="hero-copy">
                Discover the people, places and techniques behind India&apos;s
                living craft traditions — while giving artisans modern tools to
                grow without losing their roots.
              </p>

              <div className="hero-actions">
                <Link className="btn btn-primary" href="/products">
                  Explore crafts
                  <ArrowRight size={17} />
                </Link>

                <Link className="btn btn-soft" href="/ai-assistant">
                  <Sparkles size={17} />
                  Talk to AI
                </Link>
              </div>

              <div className="hero-meta">
                <div>
                  <strong>1,241</strong>
                  ODOP records
                </div>

                <div>
                  <strong>252</strong>
                  handicraft records
                </div>

                <div>
                  <strong>164</strong>
                  market listings
                </div>
              </div>
            </motion.div>

            {/* HERO IMAGES */}

            <motion.div
              className="hero-art"
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.9,
                delay: 0.15,
              }}
            >
              <div className="image-card image-main">
                <img src={images.hero} alt="Indian bamboo craft" />
              </div>

              <div className="image-card image-small float">
                <img src={images.bamboo} alt="Bamboo products made in India" />
              </div>

              <div className="floating-note">
                <span>Living heritage</span>

                <strong>Made by hand.</strong>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ====================================================
            DISCOVER
        ==================================================== */}

        <section id="discover" className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-kicker">01 / Discover</div>

                <h2 className="section-title">India, one craft at a time.</h2>
              </div>

              <p className="section-desc">
                Explore craft traditions by material, region and story.
                HASTKATHA connects structured ODOP knowledge with a visual,
                human-first experience.
              </p>
            </div>

            {/* =================================================
                CRAFT CARDS
            ================================================= */}

            <div className="cards">
              {featuredCrafts.map((featured, index) => {
                const craftId = findCraftId(featured.aliases);

                return (
                  <Craft
                    key={featured.title}
                    image={featured.image}
                    tag={featured.tag}
                    title={featured.title}
                    text={featured.text}
                    craftId={craftId}
                    loading={craftsLoading}
                    index={index}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================================
            INTELLIGENCE
        ==================================================== */}

        <section id="intelligence" className="section dark-section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-kicker">02 / Intelligence</div>

                <h2 className="section-title">Heritage, powered by AI.</h2>
              </div>

              <p className="section-desc">
                Practical intelligence layers sit on top of the HASTKATHA data
                pipeline: a craft knowledge RAG and a market-aware price engine.
              </p>
            </div>

            <div className="ai-grid">
              {/* RAG */}

              <Link href="/ai-assistant" className="ai-card">
                <div className="ai-icon">
                  <Bot size={22} />
                </div>

                <h3>Craft Knowledge AI</h3>

                <p>
                  Ask questions about Indian craft traditions. Semantic
                  retrieval finds relevant ODOP records and the language model
                  turns the evidence into a grounded answer with sources.
                </p>

                <div className="mini-list">
                  <span>Sentence Transformers</span>

                  <span>ChromaDB</span>

                  <span>Groq</span>

                  <span>Source grounded</span>
                </div>

                <span className="arrow">
                  <ArrowRight size={18} />
                </span>
              </Link>

              {/* PRICE */}

              <Link href="/price-estimator" className="ai-card">
                <div className="ai-icon">
                  <Sparkles size={22} />
                </div>

                <h3>Price Intelligence</h3>

                <p>
                  Estimate a reference market price and observed range using the
                  trained XGBoost model plus comparable real marketplace
                  listings.
                </p>

                <div className="mini-list">
                  <span>XGBoost</span>

                  <span>164 listings</span>

                  <span>Market comparables</span>

                  <span>Confidence</span>
                </div>

                <span className="arrow">
                  <ArrowRight size={18} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ====================================================
            MISSION
        ==================================================== */}

        <section id="mission" className="section">
          <div className="container">
            <div className="stats">
              <Stat n="01" t="Discover" />

              <Stat n="02" t="Empower" />

              <Stat n="03" t="Preserve" />

              <Stat n="AI" t="Built into the ecosystem" />
            </div>

            <div
              style={{
                height: 55,
              }}
            />

            <div className="quote">
              <div className="quote-mark">“</div>

              <p>
                Technology should not replace the story of a craft. It should
                help more people find it, understand it, and value the hands
                behind it.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="footer">
        <div className="container">
          <div className="footer-row">
            <div className="brand">
              <span className="brand-mark">ह</span>
              HASTKATHA
            </div>

            <small>Discover · Empower · Preserve</small>
          </div>

          <div className="credits">
            Visual references use Wikimedia Commons media under their respective
            Creative Commons/free licences: Bamboo craft work; Bamboo products
            made by tribals; Madhubani art; Dokra from tribes of Bastar.
            Attribution/licence details are recorded on the respective Commons
            pages.
          </div>
        </div>
      </footer>
    </>
  );
}

/* ============================================================
   CRAFT CARD
============================================================ */

function Craft({
  image,
  tag,
  title,
  text,
  craftId,
  loading,
  index,
}: {
  image: string;
  tag: string;
  title: string;
  text: string;
  craftId: number | null;
  loading: boolean;
  index: number;
}) {
  /*
   * If the craft exists in PostgreSQL:
   *      /crafts/{id}
   *
   * If it doesn't exist yet:
   *      /crafts
   *
   * This prevents broken links for Bamboo/Dhokra
   * until those records are added to the database.
   */

  const href = craftId !== null ? `/crafts/${craftId}` : "/crafts";

  return (
    <motion.article
      className="craft-card"
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
      }}
    >
      {/* IMAGE */}

      <Link href={href}>
        <div className="card-img">
          <img src={image} alt={title} />
        </div>
      </Link>

      {/* BODY */}

      <div className="card-body">
        <span className="pill">{tag}</span>

        <h3>{title}</h3>

        <p>{text}</p>

        <Link href={href} className="card-link">
          {loading
            ? "Loading story..."
            : craftId !== null
              ? "Explore story"
              : "Explore archive"}

          <ArrowRight size={15} />
        </Link>
      </div>
    </motion.article>
  );
}

/* ============================================================
   STAT
============================================================ */

function Stat({ n, t }: { n: string; t: string }) {
  return (
    <div className="stat">
      <strong>{n}</strong>

      <span>{t}</span>
    </div>
  );
}

