from sqlalchemy import Column, Integer, String, Text, ForeignKey

from app.database import Base


class Artisan(Base):
    __tablename__ = "artisans"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    business_name = Column(
        String(150),
        nullable=False
    )

    bio = Column(Text, nullable=True)

    state = Column(
        String(100),
        nullable=True
    )

    district = Column(
        String(100),
        nullable=True
    )

    verification_status = Column(
        String(30),
        default="pending",
        nullable=False
    )