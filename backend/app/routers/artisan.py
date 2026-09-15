from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

from app.models.artisan import Artisan
from app.models.user import User

from app.schemas.artisan import (
    ArtisanCreate,
    ArtisanResponse
)


router = APIRouter(
    prefix="/artisans",
    tags=["Artisans"]
)


@router.post(
    "/",
    response_model=ArtisanResponse
)
def create_artisan(
    artisan_data: ArtisanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Check whether user already has artisan profile
    existing_artisan = db.query(Artisan).filter(
        Artisan.user_id == current_user.id
    ).first()

    if existing_artisan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Artisan profile already exists"
        )

    artisan = Artisan(
        user_id=current_user.id,
        business_name=artisan_data.business_name,
        bio=artisan_data.bio,
        state=artisan_data.state,
        district=artisan_data.district
    )

    db.add(artisan)
    db.commit()
    db.refresh(artisan)

    return artisan


@router.get(
    "/me",
    response_model=ArtisanResponse
)
def get_my_artisan_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    artisan = db.query(Artisan).filter(
        Artisan.user_id == current_user.id
    ).first()

    if not artisan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artisan profile not found"
        )

    return artisan