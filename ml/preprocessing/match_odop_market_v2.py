import pandas as pd
import re
from difflib import SequenceMatcher


# ============================================================
# LOAD
# ============================================================

odop = pd.read_csv(
    "../datasets/processed/odop_handicrafts.csv"
)

market = pd.read_csv(
    "../datasets/processed/market_products_final.csv"
)

print("ODOP:", odop.shape)
print("MARKET:", market.shape)


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize(text):

    if pd.isna(text):
        return ""

    text = str(text).lower()

    text = text.replace("&", " and ")

    text = re.sub(r"[^a-z0-9\s]", " ", text)

    words = text.split()

    # Remove generic words
    stopwords = {
        "handmade",
        "handcrafted",
        "handicraft",
        "product",
        "products",
        "made",
        "traditional",
        "natural",
        "design",
        "decorative",
        "beautiful",
        "set",
        "work"
    }

    words = [
        word for word in words
        if word not in stopwords
    ]

    return " ".join(words)


# ============================================================
# CRAFT KEYWORDS
# ============================================================

CRAFT_KEYWORDS = {
    "bamboo",
    "cane",
    "rattan",
    "jute",
    "terracotta",
    "pottery",
    "wood",
    "wooden",
    "sheesham",
    "rosewood",
    "leather",
    "silk",
    "cotton",
    "wool",
    "zardozi",
    "zari",
    "madhubani",
    "phulkari",
    "chikankari",
    "block",
    "carving",
    "lacquer",
    "brass",
    "copper",
    "metal",
    "stone",
    "marble",
    "shell",
    "bead",
    "embroidery",
    "weaving",
    "handloom",
    "carpet",
    "rug",
    "shawl",
    "jutti",
    "basket",
    "toy",
    "painting"
}


# ============================================================
# KEYWORD OVERLAP
# ============================================================

def keyword_score(market_text, odop_text):

    market_words = set(normalize(market_text).split())
    odop_words = set(normalize(odop_text).split())

    if not market_words or not odop_words:
        return 0

    # Only craft-relevant words
    market_craft = market_words & CRAFT_KEYWORDS
    odop_craft = odop_words & CRAFT_KEYWORDS

    if not market_craft or not odop_craft:
        return 0

    overlap = market_craft & odop_craft

    if not overlap:
        return 0

    # Score based on overlapping craft terms
    return min(
        len(overlap) / max(len(market_craft), 1),
        1
    )


# ============================================================
# TEXT SIMILARITY
# ============================================================

def text_similarity(a, b):

    a = normalize(a)
    b = normalize(b)

    if not a or not b:
        return 0

    return SequenceMatcher(
        None,
        a,
        b
    ).ratio()


# ============================================================
# STATE MATCH
# ============================================================

def state_match(market_state, odop_state):

    if pd.isna(market_state):
        return False

    if pd.isna(odop_state):
        return False

    return normalize(market_state) == normalize(odop_state)


# ============================================================
# MATERIAL MATCH
# ============================================================

def material_match(material, odop_text):

    if pd.isna(material):
        return False

    material = normalize(material)
    odop_text = normalize(odop_text)

    if not material or not odop_text:
        return False

    synonyms = {

        "bamboo": [
            "bamboo"
        ],

        "cane": [
            "cane",
            "rattan",
            "bamboo"
        ],

        "wood": [
            "wood",
            "wooden",
            "sheesham",
            "rosewood",
            "carving"
        ],

        "jute": [
            "jute"
        ],

        "terracotta": [
            "terracotta",
            "pottery",
            "clay"
        ],

        "leather": [
            "leather"
        ],

        "silk": [
            "silk"
        ],

        "cotton": [
            "cotton"
        ],

        "copper": [
            "copper"
        ],

        "metal": [
            "metal",
            "brass"
        ],

        "stone": [
            "stone",
            "marble"
        ]
    }

    keywords = synonyms.get(
        material,
        [material]
    )

    return any(
        keyword in odop_text
        for keyword in keywords
    )


# ============================================================
# MATCH
# ============================================================

results = []


for index, market_row in market.iterrows():

    market_name = market_row["product_name"]

    market_material = market_row["material_final"]

    market_state = market_row["state_final"]


    best = None
    best_score = 0


    for _, odop_row in odop.iterrows():

        odop_product = odop_row["Product"]

        odop_description = odop_row["Description"]

        odop_category = odop_row["Category"]

        odop_text = " ".join([
            str(odop_product),
            str(odop_description),
            str(odop_category)
        ])


        # ----------------------------------------------------
        # Individual evidence
        # ----------------------------------------------------

        craft_score = keyword_score(
            market_name,
            odop_text
        )


        text_score = text_similarity(
            market_name,
            odop_product
        )


        state_score = (
            1
            if state_match(
                market_state,
                odop_row["State"]
            )
            else 0
        )


        material_score = (
            1
            if material_match(
                market_material,
                odop_text
            )
            else 0
        )


        # ----------------------------------------------------
        # TOTAL SCORE
        #
        # Craft evidence = 40
        # State = 30
        # Material = 20
        # Text similarity = 10
        # ----------------------------------------------------

        total = (
            craft_score * 40
            +
            state_score * 30
            +
            material_score * 20
            +
            text_score * 10
        )


        # ----------------------------------------------------
        # BEST MATCH
        # ----------------------------------------------------

        if total > best_score:

            best_score = total

            best = {
                "odop_product": odop_product,
                "odop_state": odop_row["State"],
                "odop_district": odop_row["District"],
                "odop_category": odop_row["Category"],
                "odop_sector": odop_row["Sector"],
                "odop_gi_status": odop_row["GI Status"],

                "craft_score": round(
                    craft_score,
                    3
                ),

                "text_similarity": round(
                    text_score,
                    3
                ),

                "state_match": bool(
                    state_score
                ),

                "material_match": bool(
                    material_score
                ),

                "match_score": round(
                    total,
                    2
                )
            }


    # ========================================================
    # CONFIDENCE
    # ========================================================

    if best_score >= 80:

        confidence = "high"

    elif best_score >= 60:

        confidence = "medium"

    elif best_score >= 40:

        confidence = "low"

    else:

        confidence = "no_match"


    # ========================================================
    # REASON
    # ========================================================

    reasons = []

    if best["state_match"]:
        reasons.append("same state")

    if best["material_match"]:
        reasons.append("material evidence")

    if best["craft_score"] >= 0.5:
        reasons.append("craft keyword overlap")

    if best["text_similarity"] >= 0.5:
        reasons.append("product name similarity")


    if not reasons:
        reasons.append("insufficient evidence")


    # ========================================================
    # RESULT
    # ========================================================

    results.append({

        "market_product_name":
            market_row["product_name"],

        "selling_price":
            market_row["selling_price"],

        "mrp":
            market_row["mrp"],

        "market_material":
            market_material,

        "market_state":
            market_state,

        "market_product_type":
            market_row["product_type"],


        "odop_product":
            best["odop_product"],

        "odop_state":
            best["odop_state"],

        "odop_district":
            best["odop_district"],

        "odop_category":
            best["odop_category"],

        "odop_sector":
            best["odop_sector"],

        "odop_gi_status":
            best["odop_gi_status"],


        "craft_score":
            best["craft_score"],

        "text_similarity":
            best["text_similarity"],

        "state_match":
            best["state_match"],

        "material_match":
            best["material_match"],

        "match_score":
            best["match_score"],

        "confidence":
            confidence,

        "match_reason":
            ", ".join(reasons),


        "market_source":
            market_row["source"],

        "market_product_url":
            market_row["product_url"]
    })


    if (index + 1) % 20 == 0:

        print(
            f"Processed {index + 1}/{len(market)}"
        )


# ============================================================
# SAVE
# ============================================================

matches = pd.DataFrame(results)

output_path = (
    "../datasets/processed/"
    "odop_market_matches_v2.csv"
)

matches.to_csv(
    output_path,
    index=False
)


# ============================================================
# REPORT
# ============================================================

print("\n========================================")
print("V2 MATCHING COMPLETE")
print("========================================")

print(
    "Total products:",
    len(matches)
)


print("\nConfidence distribution:")

print(
    matches["confidence"]
    .value_counts()
)


print("\nScore statistics:")

print(
    matches["match_score"]
    .describe()
)


print("\n========================================")
print("TOP MATCHES")
print("========================================")

print(
    matches[
        [
            "market_product_name",
            "odop_product",
            "market_state",
            "odop_state",
            "market_material",
            "match_score",
            "confidence",
            "match_reason"
        ]
    ]
    .sort_values(
        "match_score",
        ascending=False
    )
    .head(20)
    .to_string(index=False)
)


print("\nSaved to:")
print(output_path)