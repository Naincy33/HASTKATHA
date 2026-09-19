import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
import time


BASE_URL = "https://www.indiahandmade.com/handicraft-products.html"

headers = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/153.0 Safari/537.36"
    )
}


def extract_price(text):
    """
    Extract the first rupee price.
    Usually this is the Special Price / Selling Price.
    """

    matches = re.findall(
        r"₹\s*([\d,]+(?:\.\d+)?)",
        text
    )

    if matches:
        return float(matches[0].replace(",", ""))

    return None


def extract_mrp(text):
    """
    Extract Regular Price / MRP if available.
    """

    match = re.search(
        r"Regular Price\s*₹\s*([\d,]+(?:\.\d+)?)",
        text,
        re.IGNORECASE
    )

    if match:
        return float(match.group(1).replace(",", ""))

    return None


products = []


for page in range(1, 5):

    if page == 1:
        url = BASE_URL
    else:
        url = f"{BASE_URL}?p={page}"

    print(f"\nScraping page {page}...")

    response = requests.get(
        url,
        headers=headers,
        timeout=30
    )

    print("Status:", response.status_code)

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    # Main product card selector
    cards = soup.select(
        "li.item.product.product-item"
    )

    # Backup selectors
    if not cards:
        cards = soup.select(
            ".product-item"
        )

    if not cards:
        cards = soup.select(
            ".product-item-info"
        )

    print("Products found:", len(cards))


    # Process every product card
    for card in cards:

        # Product name
        name_tag = card.select_one(
            ".product-item-link"
        )

        if not name_tag:
            continue

        product_name = name_tag.get_text(
            " ",
            strip=True
        )

        # Product URL
        product_url = name_tag.get("href")

        # Complete card text
        card_text = card.get_text(
            " ",
            strip=True
        )

        # Prices
        selling_price = extract_price(
            card_text
        )

        mrp = extract_mrp(
            card_text
        )

        # Skip products without price
        if selling_price is None:
            continue

        products.append({
            "product_name": product_name,
            "selling_price": selling_price,
            "mrp": mrp,
            "source": "IndiaHandmade",
            "product_url": product_url
        })


    # Be polite to website
    time.sleep(1)


# Convert to DataFrame
market_df = pd.DataFrame(products)


# Remove duplicate URLs
market_df = market_df.drop_duplicates(
    subset=["product_url"]
)


# Reset index
market_df = market_df.reset_index(
    drop=True
)


# Save dataset
output_path = "../datasets/raw/market_products.csv"

market_df.to_csv(
    output_path,
    index=False
)


print("\n==============================")
print("SCRAPING COMPLETE")
print("==============================")


print(
    "Total products:",
    len(market_df)
)


print("\nColumns:")
print(
    market_df.columns.tolist()
)


print("\nFirst 10 products:")
print(
    market_df.head(10)
)


if not market_df.empty:

    print("\nPrice statistics:")
    print(
        market_df["selling_price"].describe()
    )

else:

    print("\nWARNING: No products were collected.")