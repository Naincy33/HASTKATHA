from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

from app.models.product import Product
from app.models.artisan import Artisan
from app.models.craft import Craft
from app.models.user import User

from app.schemas.product import ProductCreate, ProductResponse


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# ============================================================
# CREATE PRODUCT
# ============================================================

@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --------------------------------------------------------
    # Check whether current user is an artisan
    # --------------------------------------------------------

    artisan = (
        db.query(Artisan)
        .filter(
            Artisan.user_id == current_user.id
        )
        .first()
    )

    if not artisan:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only artisans can create products"
        )

    # --------------------------------------------------------
    # Check craft
    # --------------------------------------------------------

    craft = (
        db.query(Craft)
        .filter(
            Craft.id == product_data.craft_id
        )
        .first()
    )

    if not craft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Craft not found"
        )

    # --------------------------------------------------------
    # Create product
    # --------------------------------------------------------

    product = Product(
        artisan_id=artisan.id,
        craft_id=product_data.craft_id,
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        stock=product_data.stock,
        material=product_data.material,
        dimensions=product_data.dimensions,
        production_time_days=product_data.production_time_days,
        is_active=True
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


# ============================================================
# GET ALL ACTIVE PRODUCTS
# ============================================================

@router.get(
    "/",
    response_model=list[ProductResponse]
)
def get_all_products(
    search: Optional[str] = None,
    craft_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = (
        db.query(Product)
        .filter(
            Product.is_active == True
        )
    )

    # --------------------------------------------------------
    # Search by product name
    # --------------------------------------------------------

    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%")
        )

    # --------------------------------------------------------
    # Filter by craft
    # --------------------------------------------------------

    if craft_id:
        query = query.filter(
            Product.craft_id == craft_id
        )

    # --------------------------------------------------------
    # Pagination
    # --------------------------------------------------------

    products = (
        query
        .offset(skip)
        .limit(limit)
        .all()
    )

    return products


# ============================================================
# GET SINGLE PRODUCT
# ============================================================

@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.is_active == True
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return product


@router.get(
    "/my",
    response_model=list[ProductResponse]
)
def get_my_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    artisan = db.query(Artisan).filter(
        Artisan.user_id == current_user.id
    ).first()

    if not artisan:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seller profile not found"
        )

    products = db.query(Product).filter(
        Product.artisan_id == artisan.id
    ).all()

    return products

# ============================================================
# GET CURRENT ARTISAN'S PRODUCTS
# ============================================================

@router.get(
    "/mine/list",
    response_model=list[ProductResponse]
)
def get_my_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --------------------------------------------------------
    # Find artisan profile
    # --------------------------------------------------------

    artisan = (
        db.query(Artisan)
        .filter(
            Artisan.user_id == current_user.id
        )
        .first()
    )

    if not artisan:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only artisans can access their products"
        )

    # --------------------------------------------------------
    # Get artisan's products
    # --------------------------------------------------------

    products = (
        db.query(Product)
        .filter(
            Product.artisan_id == artisan.id
        )
        .order_by(Product.id.desc())
        .all()
    )

    return products
