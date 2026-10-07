from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel, Field

# 1. Unstructured Parsing Schemas
class OrderParseRequest(BaseModel):
    raw_text: str = Field(..., description="문자/카톡/OCR 비정형 원문 텍스트")
    merchant_id: UUID = Field(..., description="농가/업체 고유 식별자")
    channel_source: Optional[str] = Field("WEB_LINK", description="채널 유입 경로 (SMS, KAKAO_TALK, OCR_IMAGE, WEB_LINK)")
    referrer_id: Optional[str] = Field(None, description="추천인 코드")

class ParsedOrderResponse(BaseModel):
    order_id: Optional[UUID] = None
    merchant_id: UUID
    referrer_id: Optional[str] = None
    channel_source: str
    
    orderer_name: Optional[str] = None
    orderer_phone: Optional[str] = None
    receiver_name: Optional[str] = None
    receiver_phone: Optional[str] = None
    
    raw_address: Optional[str] = None
    refined_road_address: Optional[str] = None
    refined_detail_address: Optional[str] = None
    zip_code: Optional[str] = None
    building_management_num: Optional[str] = None
    
    product_id: Optional[UUID] = None
    product_name: Optional[str] = None
    order_quantity: int = 1
    unit_price: Optional[float] = None
    total_amount: Optional[float] = None
    
    greeting_card_message: Optional[str] = None
    delivery_message: Optional[str] = None
    is_designated_date_requested: bool = False
    requested_delivery_date: Optional[date] = None
    
    status: str = "STAGING_PENDING"
    confidence_score: float
    confidence_level: str = Field(..., description="GREEN, YELLOW, RED")
    confidence_flags: Dict[str, Any] = Field(default_factory=dict)
    
    created_at: Optional[datetime] = None

# 2. Logistics & Courier Invoice Schemas
class PostOfficeInvoiceRequest(BaseModel):
    order_ids: List[UUID] = Field(..., min_length=1, description="송장 발급 대상 주문 ID 리스트")

class IssuedInvoiceItem(BaseModel):
    order_id: UUID
    receiver_name: str
    tracking_number: str
    courier_code: str
    invoice_issued_at: datetime
    alimtalk_dispatched: bool

class PostOfficeInvoiceResponse(BaseModel):
    success_count: int
    failed_count: int
    issued_tracking_numbers: List[IssuedInvoiceItem]

# 3. Notification Schemas
class AlimtalkSendRequest(BaseModel):
    order_id: UUID
    template_code: str = Field(default="ORDER_CONFIRMED_V1")
    custom_message: Optional[str] = None

class AlimtalkSendResponse(BaseModel):
    result_code: int = 0
    message: str = "Success"
    msg_id: str
    channel_used: str = "KAKAO_ALIMTALK"  # or SMS_FAILOVER

# 4. Pre-Order Trigger Schemas
class PreOrderAddressTriggerRequest(BaseModel):
    merchant_id: UUID
    days_before_harvest: int = Field(default=30, description="수확 예정일 전 잔여 일수 (30 또는 7)")

class TriggeredPreOrderItem(BaseModel):
    pre_order_id: UUID
    order_id: UUID
    receiver_name: str
    receiver_phone: str
    harvest_target_date: date
    confirmation_link: str

class PreOrderAddressTriggerResponse(BaseModel):
    triggered_count: int
    items: List[TriggeredPreOrderItem]

# 5. Customer Pre-Order Confirmation
class PreOrderConfirmRequest(BaseModel):
    refined_road_address: str
    refined_detail_address: str
    zip_code: str
    receiver_name: Optional[str] = None
    receiver_phone: Optional[str] = None
    customer_notes: Optional[str] = None
