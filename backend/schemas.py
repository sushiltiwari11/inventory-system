# backend/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import List
from datetime import datetime
from pydantic import BaseModel



class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Products ---
class ProductBase(BaseModel):
    name: str
    sku: str
    price: float = Field(..., gt=0)
    # The 'ge=0' ensures the quantity can never be negative
    quantity: int = Field(..., ge=0) 

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

# --- Customers ---
class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr # Validates proper email format
    phone: str

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    class Config:
        from_attributes = True

# --- Orders ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]

class OrderItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    class Config:
        from_attributes = True

class Order(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    items: List[OrderItem]
    class Config:
        from_attributes = True