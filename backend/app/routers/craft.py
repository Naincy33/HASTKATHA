from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.craft import Craft
from app.models.user import User
from app.schemas.craft import CraftCreate, CraftResponse


router = APIRouter(
    prefix="/crafts",
    tags=["Crafts"]
)


@router.post(
    "/",
    response_model=CraftResponse
)
def create_craft(
    craft_data: CraftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing_craft = db.query(Craft).filter(
        Craft.name == craft_data.name
    ).first()

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


@router.get(
    "/",
    response_model=list[CraftResponse]
)
def get_all_crafts(
    db: Session = Depends(get_db)
):
    crafts = db.query(Craft).all()
    return crafts


@router.get(
    "/{craft_id}",
    response_model=CraftResponse
)
def get_craft(
    craft_id: int,
    db: Session = Depends(get_db)
):

    craft = db.query(Craft).filter(
        Craft.id == craft_id
    ).first()

    if not craft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Craft not found"
        )

    return craft