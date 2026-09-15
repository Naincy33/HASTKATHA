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


@router.post(
    "/",
    response_model=ProductResponse
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Check artisan
    artisan = db.query(Artisan).filter(
        Artisan.user_id == current_user.id
    ).first()

    if not artisan:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only artisans can create products"
        )

    # Check craft
    craft = db.query(Craft).filter(
        Craft.id == product_data.craft_id
    ).first()

    if not craft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Craft not found"
        )

    product = Product(
        artisan_id=artisan.id,
        craft_id=product_data.craft_id,
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        stock=product_data.stock,
        material=product_data.material,
        dimensions=product_data.dimensions,
        production_time_days=product_data.production_time_days
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@router.get(
    "/",
    response_model=list[ProductResponse]
)
def get_all_products(
    db: Session = Depends(get_db)
):

    products = db.query(Product).filter(
        Product.is_active == True
    ).all()

    return products


@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return product