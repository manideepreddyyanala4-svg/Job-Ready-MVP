from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from .models import OrderStatus, ShipmentStatus, UserRole


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.customer


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: str
    role: UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class CustomerCreate(BaseModel):
    phone: str | None = Field(default=None, max_length=30)
    address: str = Field(min_length=5, max_length=500)


class CustomerOut(CustomerCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int


class OrderCreate(BaseModel):
    pickup_address: str = Field(min_length=5, max_length=500)
    delivery_address: str = Field(min_length=5, max_length=500)
    description: str = Field(min_length=1, max_length=1000)


class ShipmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    driver_id: int | None
    status: ShipmentStatus
    tracking_note: str | None


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    reference: str
    customer_id: int
    pickup_address: str
    delivery_address: str
    description: str
    status: OrderStatus
    created_at: datetime
    shipment: ShipmentOut | None = None


class TransitionRequest(BaseModel):
    status: str
    note: str | None = Field(default=None, max_length=1000)


class AssignmentRequest(BaseModel):
    driver_id: int
