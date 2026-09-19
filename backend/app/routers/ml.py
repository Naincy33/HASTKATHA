from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.price_service import get_price_estimate


router = APIRouter(
    prefix="/api/ml",
    tags=["ML"]
)


# ============================================================
# REQUEST SCHEMA
# ============================================================

class PriceEstimateRequest(BaseModel):

    product_name: str = Field(
        ...,
        min_length=2,
        max_length=200
    )

    material: str | None = None

    product_type: str | None = None

    mrp: float | None = Field(
        default=None,
        gt=0
    )


# ============================================================
# PRICE ESTIMATE API
# ============================================================

@router.post("/price-estimate")
def price_estimate(
    request: PriceEstimateRequest
):

    try:

        result = get_price_estimate(
            product_name=request.product_name,
            material=request.material,
            product_type=request.product_type,
            mrp=request.mrp
        )

        return {
            "success": True,
            "data": result
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Price estimation failed: {str(e)}"
        )