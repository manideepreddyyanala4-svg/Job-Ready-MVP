from datetime import datetime, timezone
from enum import StrEnum
from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base


def now() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(StrEnum):
    admin = "admin"
    dispatcher = "dispatcher"
    driver = "driver"
    customer = "customer"


class OrderStatus(StrEnum):
    pending = "pending"
    confirmed = "confirmed"
    assigned = "assigned"
    in_transit = "in_transit"
    delivered = "delivered"
    cancelled = "cancelled"


class ShipmentStatus(StrEnum):
    pending = "pending"
    assigned = "assigned"
    picked_up = "picked_up"
    in_transit = "in_transit"
    delivered = "delivered"
    failed = "failed"


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default=UserRole.customer.value)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    customer: Mapped["Customer | None"] = relationship(back_populates="user", uselist=False)


class Customer(Base):
    __tablename__ = "customers"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    phone: Mapped[str | None] = mapped_column(String(30))
    address: Mapped[str] = mapped_column(Text)
    user: Mapped[User] = relationship(back_populates="customer")
    orders: Mapped[list["Order"]] = relationship(back_populates="customer")


class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    pickup_address: Mapped[str] = mapped_column(Text)
    delivery_address: Mapped[str] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default=OrderStatus.pending.value)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    customer: Mapped[Customer] = relationship(back_populates="orders")
    shipment: Mapped["Shipment | None"] = relationship(back_populates="order", uselist=False, cascade="all, delete-orphan")


class Shipment(Base):
    __tablename__ = "shipments"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), unique=True)
    driver_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(20), default=ShipmentStatus.pending.value)
    tracking_note: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)
    order: Mapped[Order] = relationship(back_populates="shipment")
    driver: Mapped[User | None] = relationship(foreign_keys=[driver_id])
