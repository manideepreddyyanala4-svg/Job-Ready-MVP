from contextlib import asynccontextmanager
import secrets
from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from .auth import create_token, current_user, hash_password, require_roles, verify_password
from .db import Base, engine, get_db
from .models import Customer, Order, OrderStatus, Shipment, ShipmentStatus, User, UserRole
from .schemas import AssignmentRequest, CustomerCreate, CustomerOut, LoginRequest, OrderCreate, OrderOut, Token, TransitionRequest, UserCreate, UserOut

ORDER_TRANSITIONS = {
    OrderStatus.pending.value: {OrderStatus.confirmed.value, OrderStatus.cancelled.value},
    OrderStatus.confirmed.value: {OrderStatus.assigned.value, OrderStatus.cancelled.value},
    OrderStatus.assigned.value: {OrderStatus.in_transit.value, OrderStatus.cancelled.value},
    OrderStatus.in_transit.value: {OrderStatus.delivered.value},
    OrderStatus.delivered.value: set(), OrderStatus.cancelled.value: set(),
}
SHIPMENT_TRANSITIONS = {
    ShipmentStatus.pending.value: {ShipmentStatus.assigned.value, ShipmentStatus.failed.value},
    ShipmentStatus.assigned.value: {ShipmentStatus.picked_up.value, ShipmentStatus.failed.value},
    ShipmentStatus.picked_up.value: {ShipmentStatus.in_transit.value, ShipmentStatus.failed.value},
    ShipmentStatus.in_transit.value: {ShipmentStatus.delivered.value, ShipmentStatus.failed.value},
    ShipmentStatus.delivered.value: set(), ShipmentStatus.failed.value: set(),
}


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    yield


app = FastAPI(title="Logistics Order API (Internal Reference)", version="1.0.0", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/register", response_model=Token, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == data.email.lower())):
        raise HTTPException(409, "Email is already registered")
    # Public sign-up cannot grant an operational role.
    user = User(email=data.email.lower(), full_name=data.full_name, password_hash=hash_password(data.password), role=UserRole.customer.value)
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Email is already registered")
    db.refresh(user)
    if user.role == UserRole.customer.value:
        db.add(Customer(user_id=user.id, address=""))
        db.commit()
    return Token(access_token=create_token(user), user=user)


@app.post("/users", response_model=UserOut, status_code=201)
def create_internal_user(
    data: UserCreate,
    _: User = Depends(require_roles(UserRole.admin.value)),
    db: Session = Depends(get_db),
):
    if data.role == UserRole.customer:
        raise HTTPException(400, "Use public registration for customers")
    if db.scalar(select(User).where(User.email == data.email.lower())):
        raise HTTPException(409, "Email is already registered")
    user = User(email=data.email.lower(), full_name=data.full_name, password_hash=hash_password(data.password), role=data.role.value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return Token(access_token=create_token(user), user=user)


@app.get("/users/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user


@app.post("/customers/me", response_model=CustomerOut)
def update_customer(data: CustomerCreate, user: User = Depends(require_roles(UserRole.customer.value)), db: Session = Depends(get_db)):
    customer = user.customer or Customer(user_id=user.id)
    customer.phone, customer.address = data.phone, data.address
    db.add(customer); db.commit(); db.refresh(customer)
    return customer


@app.post("/orders", response_model=OrderOut, status_code=201)
def create_order(data: OrderCreate, user: User = Depends(require_roles(UserRole.customer.value)), db: Session = Depends(get_db)):
    if not user.customer or not user.customer.address:
        raise HTTPException(400, "Complete customer profile before creating an order")
    order = Order(reference=f"ORD-{secrets.token_hex(5).upper()}", customer_id=user.customer.id, **data.model_dump())
    db.add(order); db.commit(); db.refresh(order)
    return order


@app.get("/orders", response_model=list[OrderOut])
def list_orders(user: User = Depends(current_user), db: Session = Depends(get_db)):
    query = select(Order).order_by(Order.created_at.desc())
    if user.role == UserRole.customer.value:
        if not user.customer: return []
        query = query.where(Order.customer_id == user.customer.id)
    elif user.role == UserRole.driver.value:
        query = query.join(Shipment).where(Shipment.driver_id == user.id)
    return list(db.scalars(query).unique())


@app.get("/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order: raise HTTPException(404, "Order not found")
    if user.role == UserRole.customer.value and (not user.customer or order.customer_id != user.customer.id):
        raise HTTPException(403, "You cannot access this order")
    if user.role == UserRole.driver.value and (not order.shipment or order.shipment.driver_id != user.id):
        raise HTTPException(403, "You cannot access this order")
    return order


@app.post("/orders/{order_id}/assign", response_model=OrderOut)
def assign(order_id: int, data: AssignmentRequest, _: User = Depends(require_roles(UserRole.admin.value, UserRole.dispatcher.value)), db: Session = Depends(get_db)):
    order = db.get(Order, order_id); driver = db.get(User, data.driver_id)
    if not order: raise HTTPException(404, "Order not found")
    if not driver or driver.role != UserRole.driver.value or not driver.is_active: raise HTTPException(400, "Active driver not found")
    if order.status not in (OrderStatus.confirmed.value, OrderStatus.pending.value): raise HTTPException(409, "Order cannot be assigned from its current state")
    order.status = OrderStatus.assigned.value
    if not order.shipment: order.shipment = Shipment(order_id=order.id)
    order.shipment.driver_id, order.shipment.status = driver.id, ShipmentStatus.assigned.value
    db.commit(); db.refresh(order); return order


@app.post("/orders/{order_id}/transition", response_model=OrderOut)
def transition(order_id: int, data: TransitionRequest, user: User = Depends(current_user), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order: raise HTTPException(404, "Order not found")
    if user.role == UserRole.customer.value and (not user.customer or order.customer_id != user.customer.id): raise HTTPException(403, "Forbidden")
    if user.role == UserRole.driver.value and (not order.shipment or order.shipment.driver_id != user.id): raise HTTPException(403, "Forbidden")
    if data.status not in ORDER_TRANSITIONS.get(order.status, set()): raise HTTPException(409, f"Invalid order transition: {order.status} -> {data.status}")
    order.status = data.status
    if order.shipment and data.status == OrderStatus.in_transit.value: order.shipment.status = ShipmentStatus.in_transit.value
    if order.shipment and data.status == OrderStatus.delivered.value: order.shipment.status, order.shipment.tracking_note = ShipmentStatus.delivered.value, data.note
    db.commit(); db.refresh(order); return order


@app.post("/shipments/{shipment_id}/transition", response_model=OrderOut)
def transition_shipment(
    shipment_id: int,
    data: TransitionRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    shipment = db.get(Shipment, shipment_id)
    if not shipment:
        raise HTTPException(404, "Shipment not found")
    if user.role == UserRole.driver.value and shipment.driver_id != user.id:
        raise HTTPException(403, "Forbidden")
    if user.role == UserRole.customer.value:
        raise HTTPException(403, "Customers cannot update shipments")
    if data.status not in SHIPMENT_TRANSITIONS.get(shipment.status, set()):
        raise HTTPException(409, f"Invalid shipment transition: {shipment.status} -> {data.status}")
    shipment.status = data.status
    shipment.tracking_note = data.note
    if data.status == ShipmentStatus.in_transit.value:
        shipment.order.status = OrderStatus.in_transit.value
    elif data.status == ShipmentStatus.delivered.value:
        shipment.order.status = OrderStatus.delivered.value
    db.commit()
    db.refresh(shipment.order)
    return shipment.order
