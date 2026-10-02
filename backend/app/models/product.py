from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    ForeignKey,
    Boolean,
)

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    artisan_id = Column(
        Integer,
        ForeignKey("artisans.id"),
        nullable=False
    )

    craft_id = Column(
        Integer,
        ForeignKey("crafts.id"),
        nullable=False
    )

    name = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text
    )

    price = Column(
        Float,
        nullable=False
    )

    stock = Column(
        Integer,
        default=1
    )

    material = Column(
        String(150)
    )

    dimensions = Column(
        String(100)
    )

    production_time_days = Column(
        Integer
    )

    is_active = Column(
        Boolean,
        default=True
    )