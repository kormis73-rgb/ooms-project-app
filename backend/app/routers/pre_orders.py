import uuid
from datetime import date, timedelta
from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.order_schemas import (
    PreOrderAddressTriggerRequest, PreOrderAddressTriggerResponse,
    PreOrderConfirmRequest
)
from backend.app.services.pre_order import pre_order_service

router = APIRouter(prefix="/pre-orders", tags=["Pre-Orders"])

# 가상 사전예약 목록
MOCK_PRE_ORDERS = [
    {
        "pre_order_id": uuid.UUID("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
        "harvest_target_date": date.today() + timedelta(days=28),
        "stage": "RESERVATION_RECEIVED",
        "order": {
            "order_id": uuid.UUID("f6a7b89c-0d1e-2f3a-4b5c-6d7e8f9a0b1c"),
            "receiver_name": "최은경",
            "receiver_phone": "010-7733-1122"
        }
    }
]

@router.post("/trigger-address-check", response_model=PreOrderAddressTriggerResponse, status_code=status.HTTP_200_OK)
async def trigger_address_check(payload: PreOrderAddressTriggerRequest):
    """
    수확 D-30 / D-7 사전예약 고객 주소 재확인 카카오톡 링크 발송
    - 수확 예정일과 현재일 차이가 지정 일수 이하인 주문 필터
    - 고객 전용 1-Click 주소 확인 URL 생성
    - 상태(stage) 'ADDRESS_CHECK_SENT'로 전이
    """
    triggered = await pre_order_service.trigger_address_verification(
        merchant_id=payload.merchant_id,
        days_before=payload.days_before_harvest,
        pre_orders=MOCK_PRE_ORDERS
    )

    return {
        "triggered_count": len(triggered),
        "items": triggered
    }

@router.post("/confirm/{pre_order_id}", status_code=status.HTTP_200_OK)
async def confirm_pre_order_address(pre_order_id: uuid.UUID, payload: PreOrderConfirmRequest):
    """
    고객이 수신한 모바일 웹 링크에서 최종 배송지 확정
    - 도로명 주소, 상세 주소, 우편번호 최종 갱신
    - 고객 메모 저장
    """
    return {
        "pre_order_id": pre_order_id,
        "status": "ADDRESS_CONFIRMED",
        "message": "수확 배송지 정보가 정상적으로 확인 및 갱신되었습니다.",
        "confirmed_address": f"{payload.refined_road_address} {payload.refined_detail_address} ({payload.zip_code})"
    }
