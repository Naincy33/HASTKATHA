import pandas as pd
import re


# ==========================================
# 1. LOAD ENRICHED DATA
# ==========================================

input_path = "../datasets/processed/market_products_enriched.csv"

df = pd.read_csv(input_path)

print("Original shape:", df.shape)


# ==========================================
# 2. CLEAN ITEM TYPE
# ==========================================

def clean_item_type(value):

    if pd.isna(value):
        return None

    value = str(value).strip()

    # Keep only the first meaningful part
    value = re.split(
        r"\s+(?:More Information|Care Instructions|How to Care|Material:|Dimensions:)",
        value,
        flags=re.IGNORECASE
    )[0]

    return value.strip()


df["item_type_clean"] = df["item_type"].apply(clean_item_type)


# ==========================================
# 3. CLEAN MATERIAL
# ==========================================

def clean_material(value):

    if pd.isna(value):
        return None

    value = str(value).strip()

    # Stop when another webpage field begins
    value = re.split(
        r"\s+(?:State of Origin|Dimensions|Item Type|Care Instructions|More Information)",
        value,
        flags=re.IGNORECASE
    )[0]

    value = re.sub(
        r"^Material\s*:\s*",
        "",
        value,
        flags=re.IGNORECASE
    )

    return value.strip()


df["material_detail_clean"] = df["material_detail"].apply(clean_material)


# ==========================================
# 4. CLEAN STATE OF ORIGIN
# ==========================================

def clean_state(value):

    if pd.isna(value):
        return None

    value = str(value).strip()

    # Known Indian states / UTs
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
        "Ladakh",
        "Puducherry",
        "Chandigarh",
        "Andaman and Nicobar Islands",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Lakshadweep"
    ]

    # Find the actual state name inside noisy scraped text
    for state in states:

        if re.search(
            rf"\b{re.escape(state)}\b",
            value,
            flags=re.IGNORECASE
        ):
            return state

    return None


df["state_of_origin_clean"] = df["state_of_origin"].apply(clean_state)


# ==========================================
# 5. CLEAN DIMENSIONS
# ==========================================

def clean_dimensions(value):

    if pd.isna(value):
        return None

    value = str(value).strip()

    # Extract common dimension patterns
    patterns = [
        r"\d+(?:\.\d+)?\s*\(\s*L\s*\)\s*x\s*"
        r"\d+(?:\.\d+)?\s*\(\s*D\s*\)\s*x\s*"
        r"\d+(?:\.\d+)?\s*\(\s*H\s*\)"
        r"\d+(?:\.\d+)?\s*x\s*"
        r"\d+(?:\.\d+)?\s*x\s*"
        r"\d+(?:\.\d+)?\s*(?:cm|CM|inches|inch|Inch|INCH)"
    ]

    # First try to capture L x D x H format
    match = re.search(
        r"\d+(?:\.\d+)?\s*\(\s*L\s*\)\s*x\s*"
        r"\d+(?:\.\d+)?\s*\(\s*D\s*\)\s*x\s*"
        r"\d+(?:\.\d+)?\s*\(\s*H\s*\)"
        r"(?:\s*(?:inches|inch|cm))?",
        value,
        flags=re.IGNORECASE
    )

    if match:
        return match.group(0).strip()

    # Try simple dimensions such as:
    # 36 x 14 x 16 inches
    match = re.search(
        r"\d+(?:\.\d+)?\s*x\s*"
        r"\d+(?:\.\d+)?\s*x\s*"
        r"\d+(?:\.\d+)?"
        r"(?:\s*(?:cm|inches|inch))?",
        value,
        flags=re.IGNORECASE
    )

    if match:
        return match.group(0).strip()

    return None


df["dimensions_clean"] = df["dimensions"].apply(clean_dimensions)


# ==========================================
# 6. NORMALIZE MATERIAL
# ==========================================

def normalize_material(value):

    if pd.isna(value):
        return None

    value = value.lower().strip()

    material_mapping = {
        "bamboo": "bamboo",
        "cane": "cane",
        "rattan": "cane",
        "jute": "jute",
        "cotton": "cotton",
        "silk": "silk",
        "leather": "leather",
        "terracotta": "terracotta",
        "clay": "terracotta",
        "wood": "wood",
        "wooden": "wood",
        "rosewood": "wood",
        "copper": "copper",
        "brass": "brass",
        "stone": "stone",
        "marble": "stone",
        "metal": "metal",
        "wool": "wool"
    }

    for keyword, normalized in material_mapping.items():

        if keyword in value:
            return normalized

    return value


df["material_normalized"] = df["material_detail_clean"].apply(
    normalize_material
)


# ==========================================
# 7. NORMALIZE ITEM TYPE
# ==========================================

def normalize_item_type(value):

    if pd.isna(value):
        return None

    value = value.lower().strip()

    if "handicraft" in value:
        return "handicraft"

    if "handloom" in value:
        return "handloom"

    if "textile" in value:
        return "textile"

    return value


df["item_type_normalized"] = df["item_type_clean"].apply(
    normalize_item_type
)


# ==========================================
# 8. REMOVE COMPLETELY EMPTY COLUMNS
# ==========================================

# We keep original scraped columns for traceability,
# but create clean columns for ML.


# ==========================================
# 9. SAVE CLEAN DATASET
# ==========================================

output_path = "../datasets/processed/market_products_clean_enriched.csv"

df.to_csv(output_path, index=False)


# ==========================================
# 10. DATA QUALITY REPORT
# ==========================================

print("\n========================================")
print("CLEANING COMPLETE")
print("========================================")

print("Rows:", len(df))
print("Columns:", len(df.columns))

print("\nClean fields found:")

print(
    "Item Type:",
    df["item_type_clean"].notna().sum()
)

print(
    "Material:",
    df["material_detail_clean"].notna().sum()
)

print(
    "State:",
    df["state_of_origin_clean"].notna().sum()
)

print(
    "Dimensions:",
    df["dimensions_clean"].notna().sum()
)

print(
    "Normalized Material:",
    df["material_normalized"].notna().sum()
)

print(
    "Normalized Item Type:",
    df["item_type_normalized"].notna().sum()
)


# ==========================================
# 11. SHOW SAMPLE
# ==========================================

print("\nSample cleaned data:")

print(
    df[
        [
            "product_name",
            "selling_price",
            "material_detail_clean",
            "material_normalized",
            "state_of_origin_clean",
            "dimensions_clean",
            "item_type_normalized"
        ]
    ].head(15).to_string(index=False)
)


print("\nMaterial distribution:")

print(
    df["material_normalized"]
    .value_counts(dropna=False)
    .head(20)
)


print("\nState distribution:")

print(
    df["state_of_origin_clean"]
    .value_counts(dropna=False)
    .head(20)
)


print("\nSaved to:")
print(output_path)