from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

from app.models.review import Review
from app.models.product import Product
from app.models.user import User

from app.schemas.review import ReviewCreate, ReviewResponse


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


@router.post(
    "/",
    response_model=ReviewResponse
)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    product = db.query(Product).filter(
        Product.id == review_data.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    review = Review(
        user_id=current_user.id,
        product_id=review_data.product_id,
        rating=review_data.rating,
        comment=review_data.comment
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


@router.get(
    "/product/{product_id}",
    response_model=list[ReviewResponse]
)
def get_product_reviews(
    product_id: int,
    db: Session = Depends(get_db)
):

    reviews = db.query(Review).filter(
        Review.product_id == product_id
    ).all()

    return reviews