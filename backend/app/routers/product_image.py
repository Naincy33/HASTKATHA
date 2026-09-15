from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.product_image import ProductImage
from app.schemas.product_image import (
    ProductImageCreate,
    ProductImageResponse
)


router = APIRouter(
    prefix="/product-image",
    tags=["Product Image"]
)


@router.post(
    "/",
    response_model=ProductImageResponse
)
def create_product_image(
    image_data: ProductImageCreate,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == image_data.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    image = ProductImage(
        product_id=image_data.product_id,
        image_url=image_data.image_url,
        is_primary=image_data.is_primary
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return image


@router.get(
    "/product/{product_id}",
    response_model=list[ProductImageResponse]
)
def get_product_image(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    images = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).all()

    return images


@router.get(
    "/{image_id}",
    response_model=ProductImageResponse
)
def get_product_image(
    image_id: int,
    db: Session = Depends(get_db)
):

    image = db.query(ProductImage).filter(
        ProductImage.id == image_id
    ).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product image not found"
        )

    return image