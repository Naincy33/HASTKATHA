import sys
from pathlib import Path


# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]

ML_PATH = PROJECT_ROOT / "ml"
INFERENCE_PATH = ML_PATH / "inference"


# ============================================================
# ADD ML / INFERENCE TO PYTHON PATH
# ============================================================

if str(ML_PATH) not in sys.path:
    sys.path.insert(0, str(ML_PATH))

if str(INFERENCE_PATH) not in sys.path:
    sys.path.insert(0, str(INFERENCE_PATH))


# ============================================================
# IMPORT PRICE ENGINE
# ============================================================

from price_engine import estimate_price


# ============================================================
# SERVICE FUNCTION
# ============================================================

def get_price_estimate(
    product_name: str,
    material: str | None = None,
    product_type: str | None = None,
    mrp: float | None = None
):

    result = estimate_price(
        product_name=product_name,
        material=material,
        product_type=product_type,
        mrp=mrp
    )

    return result