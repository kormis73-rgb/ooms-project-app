import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.schemas.order_schemas import (
    OrderParseRequest, ParsedOrderResponse
)
from backend.app.services.ai_parser import ai_parser_service

router = APIRouter(prefix="/orders", tags=["Orders"])

# 인메모리 캐시 (DB 미가동 환경에서도 즉각 작동 보장)
MOCK_PRODUCTS_STORE = [
    {
        "product_id": uuid.UUID("c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"),
        "product_name": "2026 가을 햇 부사 꿀사과",
        "variety_name": "부사",
        "specification": "5kg(14~16과 특품)",
        "unit_price": 42000.0,
    },
    {
        "product_id": uuid.UUID("d4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a"),
        "product_name": "청송 껍질째 먹는 시나노골드 황금사과",
        "variety_name": "시나노골드",
        "specification": "3kg(9~11과)",
        "unit_price": 35000.0,
    },
    {
        "product_id": uuid.UUID("e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b"),
        "product_name": "나주 명품 신고배 선물세트",
        "variety_name": "신고",
        "specification": "7.5kg(7~9과)",
        "unit_price": 58000.0,
    }
]

IN_MEMORY_ORDERS = {}

@router.post("/parse", response_model=ParsedOrderResponse, status_code=status.HTTP_201_CREATED)
async def parse_unstructured_order(payload: OrderParseRequest):
    """
    1. 비정형 원문 텍스트 인입 (문자, 카톡, 손글씨 OCR 등)
    2. LLM NER & 정규식 엔티티 추출
    3. 행정안전부 도로명주소 오픈 API 주소 정제 및 5자리 우편번호 매핑
    4. 농가 등록 상품과의 유사도 매칭
    5. 신뢰도 점수(Confidence Score) 계산 및 상태 'STAGING_PENDING' 저장
    """
    try:
        parsed_result = await ai_parser_service.parse_unstructured_text(
            raw_text=payload.raw_text,
            merchant_id=payload.merchant_id,
            products_master=MOCK_PRODUCTS_STORE
        )

        order_id = uuid.uuid4()
        now = datetime.utcnow()

        order_record = {
            "order_id": order_id,
            "merchant_id": payload.merchant_id,
            "referrer_id": payload.referrer_id,
            "channel_source": payload.channel_source or "WEB_LINK",
            "raw_text_content": payload.raw_text,
            "orderer_name": parsed_result["orderer_name"],
            "orderer_phone": parsed_result["orderer_phone"],
            "receiver_name": parsed_result["receiver_name"],
            "receiver_phone": parsed_result["receiver_phone"],
            "raw_address": parsed_result["raw_address"],
            "refined_road_address": parsed_result["refined_road_address"],
            "refined_detail_address": parsed_result["refined_detail_address"],
            "zip_code": parsed_result["zip_code"],
            "building_management_num": parsed_result["building_management_num"],
            "product_id": parsed_result["product_id"],
            "product_name": parsed_result["product_name"],
            "order_quantity": parsed_result["order_quantity"],
            "unit_price": parsed_result["unit_price"],
            "total_amount": parsed_result["total_amount"],
            "greeting_card_message": parsed_result["greeting_card_message"],
            "delivery_message": parsed_result["delivery_message"],
            "status": "STAGING_PENDING",
            "confidence_score": parsed_result["confidence_score"],
            "confidence_level": parsed_result["confidence_level"],
            "confidence_flags": parsed_result["confidence_flags"],
            "payment_confirmed_by_merchant": False,
            "created_at": now
        }

        IN_MEMORY_ORDERS[str(order_id)] = order_record
        return order_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"주문 비정형 파싱 실패: {str(e)}")

@router.get("", response_model=List[ParsedOrderResponse])
async def list_orders(
    merchant_id: Optional[uuid.UUID] = None,
    order_status: Optional[str] = None,
    min_confidence: Optional[float] = None
):
    """
    주문 목록 조회 (스테이징 필터, 농가별 필터, 신뢰도 필터)
    """
    orders = list(IN_MEMORY_ORDERS.values())
    if merchant_id:
        orders = [o for o in orders if o.get("merchant_id") == merchant_id]
    if order_status:
        orders = [o for o in orders if o.get("status") == order_status]
    if min_confidence is not None:
        orders = [o for o in orders if o.get("confidence_score", 0.0) >= min_confidence]
    return orders

@router.post("/{order_id}/approve")
async def approve_order(order_id: uuid.UUID):
    """
    스테이징 주문 1-Click 승인 (STAGING_APPROVED 상태 전환)
    """
    str_id = str(order_id)
    if str_id not in IN_MEMORY_ORDERS:
        raise HTTPException(status_code=404, detail="해당 주문을 찾을 수 없습니다.")

    IN_MEMORY_ORDERS[str_id]["status"] = "STAGING_APPROVED"
    return {"order_id": order_id, "status": "STAGING_APPROVED", "message": "주문이 승인되었습니다."}

@router.patch("/{order_id}/payment-confirm")
async def toggle_payment_confirmed(order_id: uuid.UUID):
    """
    농가 대시보드에서 입금 확인 여부 원터치 토글
    """
    str_id = str(order_id)
    if str_id not in IN_MEMORY_ORDERS:
        raise HTTPException(status_code=404, detail="해당 주문을 찾을 수 없습니다.")

    current = IN_MEMORY_ORDERS[str_id].get("payment_confirmed_by_merchant", False)
    IN_MEMORY_ORDERS[str_id]["payment_confirmed_by_merchant"] = not current
    return {
        "order_id": order_id,
        "payment_confirmed_by_merchant": not current,
        "message": "입금 상태가 변경되었습니다."
    }
