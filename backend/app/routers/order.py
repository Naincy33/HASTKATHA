from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User

from app.schemas.order import (
    OrderCreate,
    OrderResponse
)


router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


@router.post(
    "/",
    response_model=OrderResponse
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    total_amount = 0

    # Check products
    for item in order_data.items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found"
            )

        if not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product.name} is inactive"
            )

        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for {product.name}"
            )

        total_amount += product.price * item.quantity

    # Create order
    order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="pending"
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    # Create order items
    for item in order_data.items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        )

        product.stock -= item.quantity

        db.add(order_item)

    db.commit()

    return order

@router.get(
    "/",
    response_model=list[OrderResponse]
)
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    orders = db.query(Order).filter(
        Order.user_id == current_user.id
    ).all()

    return orders