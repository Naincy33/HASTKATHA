from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse


router = APIRouter(prefix="/orders", tags=["Orders"])


def _order_payload(order: Order, db: Session) -> dict:
    return {
        "id": order.id,
        "user_id": order.user_id,
        "total_amount": order.total_amount,
        "status": order.status,
        "shipping_name": order.shipping_name,
        "shipping_email": order.shipping_email,
        "shipping_phone": order.shipping_phone,
        "shipping_address": order.shipping_address,
        "shipping_city": order.shipping_city,
        "shipping_state": order.shipping_state,
        "shipping_pincode": order.shipping_pincode,
        "payment_method": order.payment_method,
        "items": db.query(OrderItem).filter(OrderItem.order_id == order.id).all(),
    }


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Aggregate duplicate product rows before inventory validation.
    quantities: dict[int, int] = defaultdict(int)
    for item in order_data.items:
        quantities[item.product_id] += item.quantity

    products: dict[int, Product] = {}
    for product_id, quantity in quantities.items():
        product = (
            db.query(Product)
            .filter(Product.id == product_id)
            .with_for_update()
            .first()
        )
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
        if not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {product.name} is inactive")
        if product.stock < quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")
        products[product_id] = product

    total_amount = sum(products[pid].price * qty for pid, qty in quantities.items())
    order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="confirmed",
        shipping_name=order_data.shipping_name.strip(),
        shipping_email=order_data.shipping_email.strip().lower(),
        shipping_phone=order_data.shipping_phone.strip(),
        shipping_address=order_data.shipping_address.strip(),
        shipping_city=order_data.shipping_city.strip(),
        shipping_state=order_data.shipping_state.strip(),
        shipping_pincode=order_data.shipping_pincode,
        payment_method=order_data.payment_method,
    )

    try:
        db.add(order)
        db.flush()
        for product_id, quantity in quantities.items():
            product = products[product_id]
            db.add(OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                price=product.price,
            ))
            product.stock -= quantity
        db.commit()
        db.refresh(order)
    except Exception:
        db.rollback()
        raise

    return _order_payload(order, db)


@router.get("/", response_model=list[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.id.desc())
        .all()
    )
    return [_order_payload(order, db) for order in orders]
