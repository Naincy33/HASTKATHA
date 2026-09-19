import pandas as pd
import numpy as np

from sklearn.model_selection import KFold, cross_validate
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.metrics import make_scorer, mean_absolute_error, mean_squared_error, r2_score

from xgboost import XGBRegressor


# ==========================================
# 1. LOAD DATA
# ==========================================

df = pd.read_csv(
    "../datasets/processed/market_products_clean.csv"
)

print("Dataset shape:", df.shape)


# ==========================================
# 2. CLEAN DATA
# ==========================================

df["product_name"] = df["product_name"].fillna("unknown")
df["material"] = df["material"].fillna("other")
df["product_type"] = df["product_type"].fillna("other")

df["mrp"] = df["mrp"].fillna(df["mrp"].median())


# ==========================================
# 3. FEATURES AND TARGET
# ==========================================

features = [
    "product_name",
    "material",
    "product_type",
    "mrp"
]

X = df[features]

y = df["selling_price"]


# ==========================================
# 4. PREPROCESSING
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "text",
            TfidfVectorizer(
                max_features=100,
                ngram_range=(1, 2)
            ),
            "product_name"
        ),
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            [
                "material",
                "product_type"
            ]
        ),
        (
            "numeric",
            "passthrough",
            ["mrp"]
        )
    ]
)


# ==========================================
# 5. XGBOOST
# ==========================================

model = XGBRegressor(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    random_state=42
)


# ==========================================
# 6. PIPELINE
# ==========================================

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# ==========================================
# 7. 5-FOLD CROSS VALIDATION
# ==========================================

kf = KFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


# ==========================================
# 8. SCORING
# ==========================================

scoring = {
    "MAE": make_scorer(
        mean_absolute_error,
        greater_is_better=False
    ),

    "RMSE": make_scorer(
        lambda y_true, y_pred:
        np.sqrt(mean_squared_error(y_true, y_pred)),
        greater_is_better=False
    ),

    "R2": make_scorer(
        r2_score
    )
}


# ==========================================
# 9. CROSS VALIDATION
# ==========================================

print("\nRunning 5-Fold Cross Validation...")

cv_results = cross_validate(
    pipeline,
    X,
    y,
    cv=kf,
    scoring=scoring,
    return_train_score=False
)


# ==========================================
# 10. GET SCORES
# ==========================================

mae_scores = -cv_results["test_MAE"]

rmse_scores = -cv_results["test_RMSE"]

r2_scores = cv_results["test_R2"]


# ==========================================
# 11. DISPLAY FOLD RESULTS
# ==========================================

print("\n========================================")
print("5-FOLD CROSS VALIDATION RESULTS")
print("========================================")

for i in range(5):

    print(f"\nFold {i + 1}")

    print(f"MAE  : ₹{mae_scores[i]:.2f}")

    print(f"RMSE : ₹{rmse_scores[i]:.2f}")

    print(f"R²   : {r2_scores[i]:.4f}")


# ==========================================
# 12. MEAN RESULTS
# ==========================================

print("\n========================================")
print("AVERAGE PERFORMANCE")
print("========================================")

print(
    f"Mean MAE  : ₹{mae_scores.mean():.2f}"
)

print(
    f"Mean RMSE : ₹{rmse_scores.mean():.2f}"
)

print(
    f"Mean R²   : {r2_scores.mean():.4f}"
)


# ==========================================
# 13. STANDARD DEVIATION
# ==========================================

print("\n========================================")
print("VARIATION ACROSS FOLDS")
print("========================================")

print(
    f"MAE Std  : ₹{mae_scores.std():.2f}"
)

print(
    f"RMSE Std : ₹{rmse_scores.std():.2f}"
)

print(
    f"R² Std   : {r2_scores.std():.4f}"
)


# ==========================================
# 14. SAVE RESULTS
# ==========================================

cv_summary = pd.DataFrame({
    "Fold": [1, 2, 3, 4, 5],
    "MAE": mae_scores,
    "RMSE": rmse_scores,
    "R2": r2_scores
})

cv_summary.to_csv(
    "../datasets/processed/cross_validation_results.csv",
    index=False
)

print("\nCross-validation results saved successfully!")