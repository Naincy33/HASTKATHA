import pandas as pd
import numpy as np
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
...

# ==========================================
# 1. LOAD DATA
# ==========================================

df = pd.read_csv(
    "../datasets/processed/market_products_clean.csv"
)

print("Dataset shape:", df.shape)


# ==========================================
# 2. COMMON DATA CLEANING
# ==========================================

df["product_name"] = df["product_name"].fillna("unknown")
df["material"] = df["material"].fillna("other")
df["product_type"] = df["product_type"].fillna("other")

df["mrp"] = df["mrp"].fillna(df["mrp"].median())


# Target
y = df["selling_price"]


# ==========================================
# 3. TRAIN / TEST SPLIT
# ==========================================

indices = np.arange(len(df))

train_idx, test_idx = train_test_split(
    indices,
    test_size=0.2,
    random_state=42
)

print("Training samples:", len(train_idx))
print("Testing samples:", len(test_idx))


# ==========================================
# 4. FUNCTION TO CREATE MODEL
# ==========================================

def create_model(use_mrp=True):

    numeric_features = []

    if use_mrp:
        numeric_features.append("mrp")

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
                numeric_features
            )
        ]
    )

    model = XGBRegressor(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        random_state=42
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model)
        ]
    )

    return pipeline


# ==========================================
# 5. FUNCTION TO EVALUATE MODEL
# ==========================================

def evaluate_model(model, X_train, X_test, y_train, y_test):

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    mae = mean_absolute_error(
        y_test,
        predictions
    )

    rmse = np.sqrt(
        mean_squared_error(
            y_test,
            predictions
        )
    )

    r2 = r2_score(
        y_test,
        predictions
    )

    return mae, rmse, r2, predictions


# ==========================================
# 6. MODEL A — WITH MRP
# ==========================================

print("\n========================================")
print("MODEL A — WITH MRP")
print("========================================")

features_with_mrp = [
    "product_name",
    "material",
    "product_type",
    "mrp"
]

X_with_mrp = df[features_with_mrp]

X_train_a = X_with_mrp.iloc[train_idx]
X_test_a = X_with_mrp.iloc[test_idx]

y_train = y.iloc[train_idx]
y_test = y.iloc[test_idx]

model_a = create_model(use_mrp=True)

mae_a, rmse_a, r2_a, pred_a = evaluate_model(
    model_a,
    X_train_a,
    X_test_a,
    y_train,
    y_test
)

print(f"MAE  : ₹{mae_a:.2f}")
print(f"RMSE : ₹{rmse_a:.2f}")
print(f"R²   : {r2_a:.4f}")


# ==========================================
# 7. MODEL B — WITHOUT MRP
# ==========================================

print("\n========================================")
print("MODEL B — WITHOUT MRP")
print("========================================")

features_without_mrp = [
    "product_name",
    "material",
    "product_type"
]

X_without_mrp = df[features_without_mrp]

X_train_b = X_without_mrp.iloc[train_idx]
X_test_b = X_without_mrp.iloc[test_idx]

model_b = create_model(use_mrp=False)

mae_b, rmse_b, r2_b, pred_b = evaluate_model(
    model_b,
    X_train_b,
    X_test_b,
    y_train,
    y_test
)

print(f"MAE  : ₹{mae_b:.2f}")
print(f"RMSE : ₹{rmse_b:.2f}")
print(f"R²   : {r2_b:.4f}")


# ==========================================
# 8. COMPARISON
# ==========================================

print("\n========================================")
print("MODEL COMPARISON")
print("========================================")

comparison = pd.DataFrame({
    "Model": [
        "XGBoost + MRP",
        "XGBoost without MRP"
    ],
    "MAE": [
        mae_a,
        mae_b
    ],
    "RMSE": [
        rmse_a,
        rmse_b
    ],
    "R2": [
        r2_a,
        r2_b
    ]
})

print(comparison.to_string(index=False))


# ==========================================
# 9. SAMPLE PREDICTIONS
# ==========================================

results = pd.DataFrame({
    "Product": df.iloc[test_idx]["product_name"].values,
    "Actual Price": y_test.values,
    "Predicted With MRP": np.round(pred_a, 2),
    "Predicted Without MRP": np.round(pred_b, 2)
})

print("\n========================================")
print("SAMPLE PREDICTIONS")
print("========================================")

print(results.head(10).to_string(index=False))


# ==========================================
# 10. SAVE COMPARISON
# ==========================================

comparison.to_csv(
    "../datasets/processed/model_comparison.csv",
    index=False
)

results.to_csv(
    "../datasets/processed/price_model_predictions.csv",
    index=False
)

print("\nResults saved successfully!")


# ==========================================
# 11. TRAIN FINAL PRODUCTION MODEL
# ==========================================

print("\n========================================")
print("TRAINING FINAL PRODUCTION MODEL")
print("========================================")

final_features = [
    "product_name",
    "material",
    "product_type",
    "mrp"
]

X_final = df[final_features]
y_final = df["selling_price"]

final_model = create_model(
    use_mrp=True
)

final_model.fit(
    X_final,
    y_final
)


# ==========================================
# 12. SAVE FINAL MODEL
# ==========================================

models_dir = "../models"

os.makedirs(
    models_dir,
    exist_ok=True
)

model_path = os.path.join(
    models_dir,
    "price_model.pkl"
)

joblib.dump(
    final_model,
    model_path
)

print("\n========================================")
print("FINAL MODEL SAVED")
print("========================================")

print("Model path:", model_path)
print("Training samples:", len(X_final))
print("Features:", final_features)
print(
    "Model:",
    "XGBoost + TF-IDF + OneHotEncoder + MRP"
)

print("\nReady for inference!")