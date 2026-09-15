from sqlalchemy import Column, Integer, String, Text, Boolean

from app.database import Base


class Craft(Base):
    __tablename__ = "crafts"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)

    description = Column(Text)

    state = Column(String(100))

    region = Column(String(100))

    material = Column(String(150))

    technique = Column(String(200))

    gi_status = Column(
        String(50),
        default="pending"
    )