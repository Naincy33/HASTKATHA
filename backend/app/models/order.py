from sqlalchemy import Column, Integer, Float, String, ForeignKey, Text
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="pending", nullable=False)

    # Optional to keep old orders valid while the checkout migration is applied.
    shipping_name = Column(String(120), nullable=True)
    shipping_email = Column(String(150), nullable=True)
    shipping_phone = Column(String(20), nullable=True)
    shipping_address = Column(Text, nullable=True)
    shipping_city = Column(String(100), nullable=True)
    shipping_state = Column(String(100), nullable=True)
    shipping_pincode = Column(String(6), nullable=True)
    payment_method = Column(String(30), default="cod", nullable=True)
