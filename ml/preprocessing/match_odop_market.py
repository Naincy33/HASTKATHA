import pandas as pd
import re
from difflib import SequenceMatcher


# ============================================================
# 1. LOAD DATA
# ============================================================

odop_path = "../datasets/processed/odop_handicrafts.csv"
market_path = "../datasets/processed/market_products_final.csv"

odop = pd.read_csv(odop_path)
market = pd.read_csv(market_path)

print("ODOP shape:", odop.shape)
print("Market shape:", market.shape)


# ============================================================
# 2. TEXT NORMALIZATION
# ============================================================

def normalize_text(value):

    if pd.isna(value):
        return ""

    text = str(value).lower()

    # Remove punctuation
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Normalize common terms
    replacements = {
        "handicrafts": "handicraft",
        "handmade": "handicraft",
        "handcrafted": "handicraft",
        "products": "product",
        "product": "product",
        "wooden": "wood",
        "rattan": "cane",
        "bamboo": "bamboo",
        "textiles": "textile",
        "leathers": "leather"
    }

    words = text.split()

    normalized_words = []

    for word in words:

        if word in replacements:
            word = replacements[word]

        normalized_words.append(word)

    return " ".join(normalized_words)


# ============================================================
# 3. TOKEN SIMILARITY
# ============================================================

def token_similarity(text1, text2):

    text1 = normalize_text(text1)
    text2 = normalize_text(text2)

    if not text1 or not text2:
        return 0.0

    tokens1 = set(text1.split())
    tokens2 = set(text2.split())

    if not tokens1 or not tokens2:
        return 0.0

    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)

    jaccard = len(intersection) / len(union)

    sequence = SequenceMatcher(
        None,
        text1,
        text2
    ).ratio()

    # Combine token overlap and sequence similarity
    score = (
        0.6 * jaccard +
        0.4 * sequence
    )

    return score


# ============================================================
# 4. MATERIAL MATCH
# ============================================================

def material_match(market_material, odop_product):

    if pd.isna(market_material):
        return False

    if pd.isna(odop_product):
        return False

    material = normalize_text(market_material)
    product = normalize_text(odop_product)

    if not material or not product:
        return False

    # Direct keyword match
    if material in product:
        return True

    # Important synonyms
    synonyms = {
        "cane": ["rattan", "cane", "bamboo"],
        "wood": ["wood", "wooden", "sheesham", "rosewood"],
        "terracotta": ["terracotta", "clay", "pottery"],
        "leather": ["leather"],
        "jute": ["jute"],
        "silk": ["silk"],
        "cotton": ["cotton"],
        "bamboo": ["bamboo"],
        "copper": ["copper"],
        "metal": ["metal", "brass", "steel"],
        "stone": ["stone", "marble"]
    }

    if material in synonyms:

        for keyword in synonyms[material]:

            if keyword in product:
                return True

    return False


# ============================================================
# 5. STATE MATCH
# ============================================================

def state_match(market_state, odop_state):

    if pd.isna(market_state) or pd.isna(odop_state):
        return False

    state1 = normalize_text(market_state)
    state2 = normalize_text(odop_state)

    return state1 == state2


# ============================================================
# 6. BUILD MATCHES
# ============================================================

results = []

print("\nStarting matching...")


for market_index, market_row in market.iterrows():

    market_name = market_row["product_name"]
    market_material = market_row["material_final"]
    market_state = market_row["state_final"]

    best_match = None
    best_score = 0

    for odop_index, odop_row in odop.iterrows():

        odop_product = odop_row["Product"]
        odop_state = odop_row["State"]

        # ----------------------------------------
        # Product similarity
        # ----------------------------------------

        product_score = token_similarity(
            market_name,
            odop_product
        )

        # Convert to 0-60
        product_points = product_score * 60


        # ----------------------------------------
        # Material
        # ----------------------------------------

        material_points = 0

        if material_match(
            market_material,
            odop_product
        ):
            material_points = 25


        # ----------------------------------------
        # State
        # ----------------------------------------

        state_points = 0

        if state_match(
            market_state,
            odop_state
        ):
            state_points = 15


        # ----------------------------------------
        # Total
        # ----------------------------------------

        total_score = (
            product_points +
            material_points +
            state_points
        )


        # ----------------------------------------
        # Keep best match
        # ----------------------------------------

        if total_score > best_score:

            best_score = total_score

            best_match = {
                "odop_index": odop_index,
                "odop_product": odop_product,
                "odop_state": odop_state,
                "odop_district": odop_row["District"],
                "odop_category": odop_row["Category"],
                "odop_sector": odop_row["Sector"],
                "odop_gi_status": odop_row["GI Status"],
                "product_similarity": round(
                    product_score,
                    4
                ),
                "material_match": material_points > 0,
                "state_match": state_points > 0,
                "score": round(
                    total_score,
                    2
                )
            }


    # ========================================================
    # MATCH CLASSIFICATION
    # ========================================================

    if best_match is None:

        match_type = "unmatched"

    elif best_score >= 85:

        match_type = "exact"

    elif best_score >= 65:

        match_type = "strong"

    elif best_score >= 45:

        match_type = "weak"

    else:

        match_type = "unmatched"


    # ========================================================
    # MATCH REASON
    # ========================================================

    reasons = []

    if best_match["product_similarity"] >= 0.60:
        reasons.append("high product similarity")

    elif best_match["product_similarity"] >= 0.30:
        reasons.append("partial product similarity")

    if best_match["material_match"]:
        reasons.append("material match")

    if best_match["state_match"]:
        reasons.append("state match")

    if not reasons:
        reasons.append("low evidence")


    # ========================================================
    # SAVE RESULT
    # ========================================================

    result = {

        # Market data
        "market_product_name": market_row["product_name"],
        "selling_price": market_row["selling_price"],
        "mrp": market_row["mrp"],
        "market_material": market_material,
        "market_state": market_state,
        "market_product_type": market_row["product_type"],

        # ODOP data
        "odop_product": best_match["odop_product"],
        "odop_state": best_match["odop_state"],
        "odop_district": best_match["odop_district"],
        "odop_category": best_match["odop_category"],
        "odop_sector": best_match["odop_sector"],
        "odop_gi_status": best_match["odop_gi_status"],

        # Matching information
        "product_similarity": best_match["product_similarity"],
        "material_match": best_match["material_match"],
        "state_match": best_match["state_match"],
        "match_score": best_match["score"],
        "match_type": match_type,
        "match_reason": ", ".join(reasons),

        # Source
        "market_source": market_row["source"],
        "market_product_url": market_row["product_url"]
    }

    results.append(result)


    # Progress
    if (market_index + 1) % 20 == 0:

        print(
            f"Processed "
            f"{market_index + 1}/{len(market)}"
        )


# ============================================================
# 7. CREATE DATAFRAME
# ============================================================

matches = pd.DataFrame(results)


# ============================================================
# 8. SAVE
# ============================================================

output_path = (
    "../datasets/processed/"
    "odop_market_matches.csv"
)

matches.to_csv(
    output_path,
    index=False
)


# ============================================================
# 9. REPORT
# ============================================================

print("\n========================================")
print("ODOP MARKET MATCHING COMPLETE")
print("========================================")

print("Total market products:", len(matches))

print("\nMatch distribution:")

print(
    matches["match_type"]
    .value_counts()
)


print("\nMatch score statistics:")

print(
    matches["match_score"]
    .describe()
)


# ============================================================
# 10. SHOW BEST MATCHES
# ============================================================

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
            "match_type",
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


# ============================================================
# 11. SHOW WEAK / UNMATCHED
# ============================================================

print("\n========================================")
print("WEAK / UNMATCHED")
print("========================================")

print(
    matches[
        [
            "market_product_name",
            "odop_product",
            "match_score",
            "match_type",
            "match_reason"
        ]
    ]
    .sort_values(
        "match_score"
    )
    .head(15)
    .to_string(index=False)
)


print("\nSaved to:")
print(output_path)