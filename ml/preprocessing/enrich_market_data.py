import pandas as pd
import requests
from bs4 import BeautifulSoup
import re
import time


# ==========================================
# 1. LOAD EXISTING MARKET DATA
# ==========================================

df = pd.read_csv(
    "../datasets/processed/market_products_clean.csv"
)

print("Products to enrich:", len(df))


# ==========================================
# 2. HELPER FUNCTION
# ==========================================

def extract_field(text, field_name):
    pattern = rf"{field_name}\s*:\s*([^|\n]+)"
    match = re.search(pattern, text, re.IGNORECASE)

    if match:
        return match.group(1).strip()

    return None


# ==========================================
# 3. SCRAPE PRODUCT DETAILS
# ==========================================

enriched_data = []

headers = {
    "User-Agent": "Mozilla/5.0"
}

for index, row in df.iterrows():

    url = row["product_url"]

    print(f"\n[{index + 1}/{len(df)}] Scraping product...")

    try:

        response = requests.get(
            url,
            headers=headers,
            timeout=20
        )

        print("Status:", response.status_code)

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        page_text = soup.get_text(
            " ",
            strip=True
        )

        # --------------------------------------
        # Extract fields
        # --------------------------------------

        item_type = extract_field(
            page_text,
            "Item Type"
        )

        material = extract_field(
            page_text,
            "Material"
        )

        state = extract_field(
            page_text,
            "State of Origin"
        )

        dimensions = extract_field(
            page_text,
            "Dimensions"
        )

        # Some pages use Fabric instead of Material
        if material is None:

            material = extract_field(
                page_text,
                "Fabric"
            )

        enriched_data.append({

            "product_name":
                row["product_name"],

            "selling_price":
                row["selling_price"],

            "mrp":
                row["mrp"],

            "discount_percent":
                row["discount_percent"],

            "material_existing":
                row["material"],

            "product_type":
                row["product_type"],

            "item_type":
                item_type,

            "material_detail":
                material,

            "state_of_origin":
                state,

            "dimensions":
                dimensions,

            "source":
                row["source"],

            "product_url":
                url
        })

    except Exception as e:

        print("Error:", e)

        enriched_data.append({

            "product_name":
                row["product_name"],

            "selling_price":
                row["selling_price"],

            "mrp":
                row["mrp"],

            "discount_percent":
                row["discount_percent"],

            "material_existing":
                row["material"],

            "product_type":
                row["product_type"],

            "item_type":
                None,

            "material_detail":
                None,

            "state_of_origin":
                None,

            "dimensions":
                None,

            "source":
                row["source"],

            "product_url":
                url
        })

    # Don't hit the website too quickly
    time.sleep(1)


# ==========================================
# 4. CREATE DATAFRAME
# ==========================================

enriched_df = pd.DataFrame(
    enriched_data
)


# ==========================================
# 5. SAVE
# ==========================================

output_path = (
    "../datasets/processed/"
    "market_products_enriched.csv"
)

enriched_df.to_csv(
    output_path,
    index=False
)


# ==========================================
# 6. SUMMARY
# ==========================================

print("\n========================================")
print("ENRICHMENT COMPLETE")
print("========================================")

print(
    "Total products:",
    len(enriched_df)
)

print(
    "Item Type found:",
    enriched_df["item_type"].notna().sum()
)

print(
    "Material found:",
    enriched_df["material_detail"].notna().sum()
)

print(
    "State found:",
    enriched_df["state_of_origin"].notna().sum()
)

print(
    "Dimensions found:",
    enriched_df["dimensions"].notna().sum()
)

print("\nColumns:")
print(enriched_df.columns.tolist())

print("\nFirst 10 rows:")
print(
    enriched_df[
        [
            "product_name",
            "selling_price",
            "item_type",
            "material_detail",
            "state_of_origin",
            "dimensions"
        ]
    ].head(10)
)

print(
    "\nSaved to:",
    output_path
)