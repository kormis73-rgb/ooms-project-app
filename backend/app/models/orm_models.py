import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Numeric, Boolean, Date, DateTime, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Merchant(Base):
    __tablename__ = "merchants"

    merchant_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_code = Column(String(50), unique=True, nullable=False, index=True)
    business_name = Column(String(100), nullable=False)
    representative_name = Column(String(50), nullable=False)
    phone_number = Column(String(20), nullable=False)
    bank_name = Column(String(50))
    bank_account_number = Column(String(50))
    bank_account_holder = Column(String(50))
    post_office_customer_num = Column(String(10))
    post_office_approval_num = Column(String(20))
    kakao_sender_key = Column(String(100))
    profile_image_url = Column(Text)
    farm_address = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    products = relationship("Product", back_populates="merchant", cascade="all, delete-orphan")
    crop_stories = relationship("CropStory", back_populates="merchant", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="merchant")
    claims = relationship("Claim", back_populates="merchant")
    settlements = relationship("Settlement", back_populates="merchant")


class Product(Base):
    __tablename__ = "products"

    product_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id = Column(UUID(as_uuid=True), ForeignKey("merchants.merchant_id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String(100), nullable=False)
    variety_name = Column(String(50))
    characteristics = Column(Text)
    specification = Column(String(50), nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    box_quantity = Column(Integer, default=1)
    max_harvest_capacity = Column(Integer, default=0)
    current_reserved_qty = Column(Integer, default=0)
    is_pre_order_enabled = Column(Boolean, default=False)
    harvest_expected_date = Column(Date)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="products")
    orders = relationship("Order", back_populates="product")


class CropStory(Base):
    __tablename__ = "crop_stories"

    story_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id = Column(UUID(as_uuid=True), ForeignKey("merchants.merchant_id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    planting_date = Column(Date)
    expected_harvest_date = Column(Date)
    media_type = Column(String(10))  # IMAGE, VIDEO
    media_url = Column(Text, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="crop_stories")


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id = Column(UUID(as_uuid=True), ForeignKey("merchants.merchant_id"), nullable=False)
    referrer_id = Column(String(50), index=True)
    raw_text_content = Column(Text)
    channel_source = Column(String(20), default="WEB_LINK")

    # Parsed & Refined Fields
    orderer_name = Column(String(50))
    orderer_phone = Column(String(20))
    receiver_name = Column(String(50))
    receiver_phone = Column(String(20))

    # Address Refinement
    raw_address = Column(Text)
    refined_road_address = Column(Text)
    refined_detail_address = Column(Text)
    zip_code = Column(String(5), nullable=False, index=True)
    building_management_num = Column(String(25))

    # Product & Message
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id"))
    order_quantity = Column(Integer, default=1)
    greeting_card_message = Column(Text)
    delivery_message = Column(Text)
    is_designated_date_requested = Column(Boolean, default=False)
    requested_delivery_date = Column(Date)

    # Status & Safety
    status = Column(String(30), default="STAGING_PENDING", index=True)
    confidence_score = Column(Numeric(3, 2), index=True)
    confidence_flags = Column(JSONB, default=dict)
    payment_confirmed_by_merchant = Column(Boolean, default=False)

    # Logistics Tracking
    courier_code = Column(String(20), default="POST_OFFICE")
    tracking_number = Column(String(20))
    invoice_issued_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="orders")
    product = relationship("Product", back_populates="orders")
    pre_order = relationship("PreOrder", back_populates="order", uselist=False, cascade="all, delete-orphan")


class PreOrder(Base):
    __tablename__ = "pre_orders"

    pre_order_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.order_id", ondelete="CASCADE"), nullable=False)
    harvest_target_date = Column(Date, nullable=False, index=True)
    stage = Column(String(30), default="RESERVATION_RECEIVED", index=True)
    address_check_sent_at = Column(DateTime(timezone=True))
    is_address_confirmed_by_customer = Column(Boolean, default=False)
    customer_notes = Column(Text)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order", back_populates="pre_order")


class Claim(Base):
    __tablename__ = "claims"

    claim_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.order_id"))
    merchant_id = Column(UUID(as_uuid=True), ForeignKey("merchants.merchant_id"), nullable=False)
    claim_type = Column(String(30), nullable=False)
    proof_image_url = Column(Text)
    description = Column(Text)
    resolution_status = Column(String(20), default="OPEN")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    resolved_at = Column(DateTime(timezone=True))

    merchant = relationship("Merchant", back_populates="claims")


class Settlement(Base):
    __tablename__ = "settlements"

    settlement_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id = Column(UUID(as_uuid=True), ForeignKey("merchants.merchant_id"), nullable=False)
    settlement_period_start = Column(Date, nullable=False)
    settlement_period_end = Column(Date, nullable=False)
    total_gross_sales = Column(Numeric(12, 2), default=0)
    platform_fee_amount = Column(Numeric(12, 2), default=0)
    referral_incentive_amount = Column(Numeric(12, 2), default=0)
    net_payout_amount = Column(Numeric(12, 2), default=0)
    is_settled = Column(Boolean, default=False)
    settled_at = Column(DateTime(timezone=True))

    merchant = relationship("Merchant", back_populates="settlements")
