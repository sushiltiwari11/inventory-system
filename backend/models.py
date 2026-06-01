from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, index=True)
    price = Column(Float)
    quantity = Column(Integer)
    sku = Column(String, unique=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    total_amount = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # 1. Added the missing timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 
    
    # 2. Added the relationship so FastAPI can see the items
    items = relationship("OrderItem", back_populates="order") 

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    
    # 3. Linked back to the parent order
    order = relationship("Order", back_populates="items")