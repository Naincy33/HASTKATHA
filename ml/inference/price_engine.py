import os
import joblib
import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "price_model.pkl"
)

MARKET_DATA_PATH = os.path.join(
    BASE_DIR,
    "datasets",
    "processed",
    "market_products_final.csv"
)


# ============================================================
# LOAD MODEL
# ============================================================

if not os.path.exists(MODEL_PATH):

    raise FileNotFoundError(
        f"Price model not found at: {MODEL_PATH}"
    )

model = joblib.load(MODEL_PATH)


# ============================================================
# LOAD REAL MARKET DATA
# ============================================================

if not os.path.exists(MARKET_DATA_PATH):

    raise FileNotFoundError(
        f"Market data not found at: {MARKET_DATA_PATH}"
    )

market_df = pd.read_csv(
    MARKET_DATA_PATH
)


# ============================================================
# PRICE ENGINE
# ============================================================

def estimate_price(
    product_name,
    material=None,
    product_type=None,
    mrp=None
):
    """
    Estimate an approximate market price range
    for a handicraft product.

    Uses:
    1. Trained XGBoost model
    2. Real marketplace comparable products

    Returns:
    - predicted price
    - estimated price range
    - confidence
    - comparable products
    """

    # ========================================================
    # 1. VALIDATE INPUT
    # ========================================================

    if not product_name:

        raise ValueError(
            "product_name is required"
        )


    # ========================================================
    # 2. PREPARE MODEL INPUT
    # ========================================================

    input_data = pd.DataFrame([
        {
            "product_name": product_name,

            "material":
                material
                if material
                else "other",

            "product_type":
                product_type
                if product_type
                else "other",

            "mrp":
                float(mrp)
                if mrp is not None
                else 0
        }
    ])


    # ========================================================
    # 3. MODEL PREDICTION
    # ========================================================

    prediction = float(
        model.predict(input_data)[0]
    )

    # Price cannot be negative
    prediction = max(
        0,
        prediction
    )


    # ========================================================
    # 4. COPY MARKET DATA
    # ========================================================

    candidates = market_df.copy()


    # ========================================================
    # 5. MATERIAL MATCH
    # ========================================================

    if material:

        material_matches = candidates[
            candidates["material_final"]
            .fillna("")
            .str.lower()
            .str.contains(
                str(material).lower(),
                regex=False
            )
        ]

    else:

        material_matches = candidates.iloc[0:0]


    # ========================================================
    # 6. PRODUCT TYPE MATCH
    # ========================================================

    if product_type:

        type_matches = candidates[
            candidates["product_type"]
            .fillna("")
            .str.lower()
            .str.contains(
                str(product_type).lower(),
                regex=False
            )
        ]

    else:

        type_matches = candidates.iloc[0:0]


    # ========================================================
    # 7. SMART COMPARABLE SELECTION
    # ========================================================
    #
    # Priority:
    #
    # 1. Same material + same product type
    # 2. Same product type
    # 3. Same material
    # 4. Entire marketplace dataset
    #
    # This prevents something like:
    #
    # Bamboo Stool
    #
    # from being compared mainly with:
    #
    # Bamboo Sofa / Bamboo Swing
    #
    # ========================================================


    # --------------------------------------------------------
    # LEVEL 1
    # SAME MATERIAL + SAME PRODUCT TYPE
    # --------------------------------------------------------

    if material and product_type:

        same_material_type = candidates[
            (
                candidates["material_final"]
                .fillna("")
                .str.lower()
                == str(material).lower()
            )
            &
            (
                candidates["product_type"]
                .fillna("")
                .str.lower()
                == str(product_type).lower()
            )
        ]

    else:

        same_material_type = pd.DataFrame()


    # --------------------------------------------------------
    # LEVEL 2
    # SAME PRODUCT TYPE
    # --------------------------------------------------------

    if len(same_material_type) >= 3:

        comparable = same_material_type

        comparison_level = (
            "same material + same product type"
        )

    else:

        if product_type:

            same_type = candidates[
                candidates["product_type"]
                .fillna("")
                .str.lower()
                == str(product_type).lower()
            ]

        else:

            same_type = pd.DataFrame()


        # ----------------------------------------------------
        # LEVEL 3
        # SAME MATERIAL
        # ----------------------------------------------------

        if len(same_type) >= 3:

            comparable = same_type

            comparison_level = (
                "same product type"
            )

        elif len(material_matches) >= 3:

            comparable = material_matches

            comparison_level = (
                "same material"
            )

        # ----------------------------------------------------
        # LEVEL 4
        # FALLBACK
        # ----------------------------------------------------

        else:

            comparable = candidates

            comparison_level = (
                "all marketplace products"
            )


    # ========================================================
    # 8. SAFETY FALLBACK
    # ========================================================

    if len(comparable) == 0:

        comparable = candidates

        comparison_level = (
            "all marketplace products"
        )


    # ========================================================
    # 9. MARKET PRICE DISTRIBUTION
    # ========================================================

    prices = comparable[
        "selling_price"
    ].dropna()


    if len(prices) >= 3:

        # Robust range using quartiles
        market_min = float(
            prices.quantile(0.25)
        )

        market_max = float(
            prices.quantile(0.75)
        )

    elif len(prices) > 0:

        market_min = float(
            prices.min()
        )

        market_max = float(
            prices.max()
        )

    else:

        market_min = (
            prediction * 0.80
        )

        market_max = (
            prediction * 1.20
        )


    # ========================================================
    # 10. COMBINE MODEL + MARKET EVIDENCE
    # ========================================================

    final_min = min(
        market_min,
        prediction
    )

    final_max = max(
        market_max,
        prediction
    )


    # ========================================================
    # 11. SMALL BUFFER
    # ========================================================

    final_min = (
        final_min * 0.90
    )

    final_max = (
        final_max * 1.10
    )


    # ========================================================
    # 12. PREVENT EXTREMELY WIDE RANGE
    # ========================================================
    #
    # We don't want a result such as:
    #
    # ₹960 - ₹22000
    #
    # for a bamboo stool.
    #
    # If the marketplace distribution is extremely wide,
    # cap the range around the model prediction.
    #
    # ========================================================

    if prediction > 0:

        maximum_ratio = 2.5

        if final_max > (
            prediction * maximum_ratio
        ):

            final_max = (
                prediction
                * maximum_ratio
            )

        minimum_ratio = 0.50

        if final_min < (
            prediction * minimum_ratio
        ):

            final_min = (
                prediction
                * minimum_ratio
            )


    # ========================================================
    # 13. ROUND PRICES
    # ========================================================

    predicted_price = round(
        prediction
    )

    final_min = round(
        final_min / 10
    ) * 10

    final_max = round(
        final_max / 10
    ) * 10


    # ========================================================
    # 14. CONFIDENCE
    # ========================================================

    comparable_count = len(
        comparable
    )


    if (
        comparison_level
        == "same material + same product type"
        and comparable_count >= 5
    ):

        confidence = "high"

    elif (
        comparison_level
        in [
            "same material + same product type",
            "same product type"
        ]
        and comparable_count >= 3
    ):

        confidence = "medium"

    elif comparable_count >= 5:

        confidence = "low"

    else:

        confidence = "low"


    # ========================================================
    # 15. TOP COMPARABLE PRODUCTS
    # ========================================================

    comparable_products = []


    if len(comparable) > 0:

        top_products = comparable[
            [
                "product_name",
                "selling_price",
                "material_final",
                "product_type",
                "source",
                "product_url"
            ]
        ].head(5)


        for _, row in top_products.iterrows():

            comparable_products.append(
                {
                    "product_name":
                        row["product_name"],

                    "selling_price":
                        float(
                            row["selling_price"]
                        ),

                    "material":
                        row["material_final"],

                    "product_type":
                        row["product_type"],

                    "source":
                        row["source"],

                    "url":
                        row["product_url"]
                }
            )


    # ========================================================
    # 16. FINAL RESPONSE
    # ========================================================

    return {

        "product_name":
            product_name,

        "predicted_price":
            predicted_price,

        "price_range":
            {
                "min":
                    int(final_min),

                "max":
                    int(final_max)
            },

        "confidence":
            confidence,

        "comparison_basis":
            comparison_level,

        "comparable_products_count":
            comparable_count,

        "comparable_products":
            comparable_products
    }


# ============================================================
# LOCAL TEST
# ============================================================

if __name__ == "__main__":

    result = estimate_price(
        product_name="Handmade Bamboo Stool",
        material="bamboo",
        product_type="stool",
        mrp=1500
    )


    print(
        "\n========================================"
    )

    print(
        "HASTKATHA PRICE ENGINE"
    )

    print(
        "========================================"
    )


    print(
        "Product:",
        result["product_name"]
    )


    print(
        "Predicted price:",
        f"₹{result['predicted_price']}"
    )


    print(
        "Estimated range:",
        f"₹{result['price_range']['min']}"
        f" - "
        f"₹{result['price_range']['max']}"
    )


    print(
        "Confidence:",
        result["confidence"]
    )


    print(
        "Comparison basis:",
        result["comparison_basis"]
    )


    print(
        "Comparable products:",
        result["comparable_products_count"]
    )


    print(
        "\nComparable listings:"
    )


    for product in result[
        "comparable_products"
    ]:

        print(
            f"- {product['product_name']} "
            f"₹{product['selling_price']}"
        )