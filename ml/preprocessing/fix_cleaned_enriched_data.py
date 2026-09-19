import pandas as pd
import re


# ==========================================
# 1. LOAD DATA
# ==========================================

input_path = "../datasets/processed/market_products_clean_enriched.csv"

df = pd.read_csv(input_path)

print("Loaded:", df.shape)


# ==========================================
# 2. BETTER MATERIAL NORMALIZATION
# ==========================================

def normalize_material(row):

    # First try detailed scraped material
    detail = row["material_detail_clean"]

    # If detailed material is missing/noisy,
    # fall back to our earlier material extraction
    existing = row["material_existing"]

    text = ""

    if pd.notna(detail):
        text += str(detail).lower() + " "

    if pd.notna(existing):
        text += str(existing).lower()

    # Order matters:
    # specific materials first
    material_keywords = [
        ("bamboo", "bamboo"),
        ("rattan", "cane"),
        ("cane", "cane"),
        ("jute", "jute"),
        ("terracotta", "terracotta"),
        ("leather", "leather"),
        ("silk", "silk"),
        ("cotton", "cotton"),
        ("wool", "wool"),
        ("copper", "copper"),
        ("brass", "brass"),
        ("wood", "wood"),
        ("wooden", "wood"),
        ("rosewood", "wood"),
        ("sheesham", "wood"),
        ("stainless steel", "metal"),
        ("metal", "metal"),
        ("stone", "stone"),
        ("marble", "stone"),
        ("shell", "shell"),
        ("bead", "beads"),
        ("beads", "beads"),
        ("clay", "terracotta"),
        ("mud", "clay"),
    ]

    for keyword, normalized in material_keywords:

        if keyword in text:
            return normalized

    return None


df["material_final"] = df.apply(
    normalize_material,
    axis=1
)


# ==========================================
# 3. BETTER DIMENSION EXTRACTION
# ==========================================

def extract_dimensions(value):

    if pd.isna(value):
        return None

    text = str(value)

    # --------------------------------------
    # Format:
    # Length 14 inch x Breadth 12 inch x Height 12 inch
    # --------------------------------------

    match = re.search(
        r"Length\s*[:\-]?\s*([\d.]+)\s*(?:inch|inches|cm)?"
        r".{0,30}?"
        r"Breadth\s*[:\-]?\s*([\d.]+)\s*(?:inch|inches|cm)?"
        r".{0,30}?"
        r"Height\s*[:\-]?\s*([\d.]+)\s*(?:inch|inches|cm)?",
        text,
        re.IGNORECASE
    )

    if match:
        return (
            f"{match.group(1)} x "
            f"{match.group(2)} x "
            f"{match.group(3)}"
        )


    # --------------------------------------
    # Format:
    # 72(L) x 32(D) x 34(H) inches
    # --------------------------------------

    match = re.search(
        r"([\d.]+)\s*\(\s*L\s*\)"
        r"\s*x\s*"
        r"([\d.]+)\s*\(\s*D\s*\)"
        r"\s*x\s*"
        r"([\d.]+)\s*\(\s*H\s*\)"
        r"\s*(cm|inches|inch)?",
        text,
        re.IGNORECASE
    )

    if match:

        unit = match.group(4) or ""

        return (
            f"{match.group(1)} x "
            f"{match.group(2)} x "
            f"{match.group(3)} {unit}"
        ).strip()


    # --------------------------------------
    # Format:
    # 36 x 14 x 16 inches
    # 12x10x12 Inches
    # --------------------------------------

    match = re.search(
        r"([\d.]+)\s*[x×]\s*"
        r"([\d.]+)\s*[x×]\s*"
        r"([\d.]+)"
        r"\s*(cm|centimeter|centimeters|inch|inches)?",
        text,
        re.IGNORECASE
    )

    if match:

        unit = match.group(4) or ""

        return (
            f"{match.group(1)} x "
            f"{match.group(2)} x "
            f"{match.group(3)} {unit}"
        ).strip()


    return None


# Search BOTH scraped dimensions and material detail
df["dimensions_final"] = df["dimensions"].fillna(
    df["material_detail_clean"]
).apply(extract_dimensions)


# ==========================================
# 4. CLEAN STATE
# ==========================================

def normalize_state(value):

    if pd.isna(value):
        return None

    value = str(value)

    states = [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
        "Delhi",
        "Jammu and Kashmir",
        "Ladakh"
    ]

    for state in states:

        if re.search(
            rf"\b{re.escape(state)}\b",
            value,
            re.IGNORECASE
        ):
            return state

    return None


df["state_final"] = df["state_of_origin"].apply(
    normalize_state
)


# ==========================================
# 5. ITEM TYPE
# ==========================================

def normalize_item_type(value):

    if pd.isna(value):
        return None

    value = str(value).lower()

    if "handicraft" in value:
        return "handicraft"

    if "handloom" in value:
        return "handloom"

    if "textile" in value:
        return "textile"

    return None


df["item_type_final"] = df["item_type"].apply(
    normalize_item_type
)


# ==========================================
# 6. FINAL DATASET
# ==========================================

final_columns = [
    "product_name",
    "selling_price",
    "mrp",
    "discount_percent",

    # Existing baseline features
    "material_existing",
    "product_type",

    # Clean enriched features
    "material_final",
    "item_type_final",
    "state_final",
    "dimensions_final",

    "source",
    "product_url"
]


final_df = df[final_columns].copy()


# ==========================================
# 7. SAVE
# ==========================================

output_path = (
    "../datasets/processed/"
    "market_products_final.csv"
)

final_df.to_csv(
    output_path,
    index=False
)


# ==========================================
# 8. REPORT
# ==========================================

print("\n========================================")
print("FINAL CLEANING COMPLETE")
print("========================================")

print("Rows:", len(final_df))
print("Columns:", len(final_df.columns))

print("\nMaterial found:")
print(
    final_df["material_final"]
    .notna()
    .sum()
)

print("\nItem Type found:")
print(
    final_df["item_type_final"]
    .notna()
    .sum()
)

print("\nState found:")
print(
    final_df["state_final"]
    .notna()
    .sum()
)

print("\nDimensions found:")
print(
    final_df["dimensions_final"]
    .notna()
    .sum()
)


print("\n========================================")
print("MATERIAL DISTRIBUTION")
print("========================================")

print(
    final_df["material_final"]
    .value_counts(dropna=False)
)


print("\n========================================")
print("STATE DISTRIBUTION")
print("========================================")

print(
    final_df["state_final"]
    .value_counts(dropna=False)
)


print("\n========================================")
print("SAMPLE")
print("========================================")

print(
    final_df[
        [
            "product_name",
            "selling_price",
            "material_final",
            "state_final",
            "dimensions_final",
            "item_type_final"
        ]
    ]
    .head(15)
    .to_string(index=False)
)


print("\nSaved to:")
print(output_path)