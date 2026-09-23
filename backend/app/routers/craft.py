from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.models.product import Product

from app.database import get_db
from app.dependencies import get_current_user
from app.models.craft import Craft
from app.models.user import User
from app.schemas.craft import CraftCreate, CraftResponse


router = APIRouter(
    prefix="/crafts",
    tags=["Crafts"]
)


# ============================================================
# CREATE CRAFT
# ============================================================

@router.post(
    "/",
    response_model=CraftResponse
)
def create_craft(
    craft_data: CraftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing_craft = (
        db.query(Craft)
        .filter(Craft.name == craft_data.name)
        .first()
    )

    if existing_craft:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Craft already exists"
        )

    craft = Craft(
        name=craft_data.name,
        description=craft_data.description,
        state=craft_data.state,
        region=craft_data.region,
        material=craft_data.material,
        technique=craft_data.technique,
        gi_status=craft_data.gi_status
    )

    db.add(craft)
    db.commit()
    db.refresh(craft)

    return craft


# ============================================================
# GET ALL CRAFTS
# ============================================================

@router.get(
    "/",
    response_model=list[CraftResponse]
)
def get_all_crafts(
    state: str | None = Query(
        default=None,
        description="Filter crafts by state"
    ),
    gi_status: str | None = Query(
        default=None,
        description="Filter by GI status: Yes / No / Pending"
    ),
    search: str | None = Query(
        default=None,
        description="Search craft name or description"
    ),
    skip: int = Query(
        default=0,
        ge=0
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=100
    ),
    db: Session = Depends(get_db)
):

    query = db.query(Craft)

    # --------------------------------------------------------
    # STATE FILTER
    # --------------------------------------------------------

    if state:
        query = query.filter(
            Craft.state.ilike(f"%{state}%")
        )

    # --------------------------------------------------------
    # GI STATUS FILTER
    # --------------------------------------------------------

    if gi_status:
        query = query.filter(
            Craft.gi_status.ilike(f"%{gi_status}%")
        )

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    if search:
        search_term = f"%{search}%"

        query = query.filter(
            (Craft.name.ilike(search_term))
            |
            (Craft.description.ilike(search_term))
            |
            (Craft.material.ilike(search_term))
            |
            (Craft.technique.ilike(search_term))
        )

    # --------------------------------------------------------
    # PAGINATION + ORDER
    # --------------------------------------------------------

    crafts = (
        query
        .order_by(Craft.name.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return crafts


# ============================================================
# GET SINGLE CRAFT
# ============================================================

@router.get(
    "/{craft_id}",
    response_model=CraftResponse
)
def get_craft(
    craft_id: int,
    db: Session = Depends(get_db)
):

    craft = (
        db.query(Craft)
        .filter(Craft.id == craft_id)
        .first()
    )

    if not craft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Craft not found"
        )

    return craft

# ============================================================
# CRAFT DETAIL + PRODUCTS
# ============================================================

@router.get("/{craft_id}/details")
def get_craft_details(
    craft_id: int,
    db: Session = Depends(get_db)
):
    craft = (
        db.query(Craft)
        .filter(Craft.id == craft_id)
        .first()
    )

    if not craft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Craft not found"
        )

    products = (
        db.query(Product)
        .filter(
            Product.craft_id == craft_id,
            Product.is_active == True
        )
        .all()
    )

    return {
        "craft": {
            "id": craft.id,
            "name": craft.name,
            "description": craft.description,
            "state": craft.state,
            "region": craft.region,
            "material": craft.material,
            "technique": craft.technique,
            "gi_status": craft.gi_status,
        },

        "products": [
            {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "stock": product.stock,
                "material": product.material,
                "dimensions": product.dimensions,
                "production_time_days": product.production_time_days,
                "artisan_id": product.artisan_id,
                "craft_id": product.craft_id,
            }
            for product in products
        ]
    }