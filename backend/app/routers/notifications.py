import uuid
from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.order_schemas import (
    AlimtalkSendRequest, AlimtalkSendResponse
)
from backend.app.services.notification import notification_service
from backend.app.routers.orders import IN_MEMORY_ORDERS

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/alimtalk", response_model=AlimtalkSendResponse, status_code=status.HTTP_200_OK)
async def send_order_alimtalk(payload: AlimtalkSendRequest):
    """
    카카오 알림톡 발송 (Aligo/Solapi 딜러 API)
    - 템플릿 코드 매핑 및 변수 치환
    - 전송 실패 시 SMS/LMS 자동 대체 (Failover)
    """
    str_id = str(payload.order_id)
    order_data = IN_MEMORY_ORDERS.get(str_id, {
        "orderer_name": "홍길동",
        "receiver_name": "홍길동",
        "product_name": "청송 햇 부사 꿀사과",
        "tracking_number": "6891029384712",
        "receiver_phone": "010-1234-5678"
    })

    mock_merchant = {
        "kakao_sender_key": "KAKAO_SENDER_KEY_CHEONGSONG_001"
    }

    result = await notification_service.send_alimtalk_notification(
        order_info=order_data,
        merchant_info=mock_merchant,
        template_code=payload.template_code
    )

    return result
