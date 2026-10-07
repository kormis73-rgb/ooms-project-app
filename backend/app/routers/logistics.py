import uuid
from typing import List
from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.order_schemas import (
    PostOfficeInvoiceRequest, PostOfficeInvoiceResponse
)
from backend.app.services.logistics import logistics_service
from backend.app.services.notification import notification_service
from backend.app.routers.orders import IN_MEMORY_ORDERS

router = APIRouter(prefix="/logistics", tags=["Logistics"])

@router.post("/post-office/invoice", response_model=PostOfficeInvoiceResponse, status_code=status.HTTP_200_OK)
async def generate_post_office_invoices(payload: PostOfficeInvoiceRequest):
    """
    우체국 계약소포 Direct API 대량 송장 발급
    1. 승인된 주문(STAGING_APPROVED 등) 조회
    2. 우체국 계약 고객번호 + 승인번호를 통한 13자리 등기 운송장 발급
    3. 주문 상태 'INVOICE_ISSUED' 업데이트 및 송장번호 저장
    4. 카카오 알림톡 자동 연계 발송
    """
    valid_orders = []
    for oid in payload.order_ids:
        str_id = str(oid)
        if str_id in IN_MEMORY_ORDERS:
            valid_orders.append(IN_MEMORY_ORDERS[str_id])
        else:
            # 테스트를 위한 가상 객체 생성
            valid_orders.append({
                "order_id": oid,
                "receiver_name": "고객님",
                "receiver_phone": "010-1234-5678",
                "product_name": "청송 꿀사과 5kg",
                "status": "STAGING_APPROVED"
            })

    mock_merchant = {
        "post_office_customer_num": "1092837465",
        "post_office_approval_num": "POST-APPR-2026-991",
        "kakao_sender_key": "KAKAO_SENDER_KEY_CHEONGSONG_001"
    }

    issued_items = await logistics_service.issue_invoices_batch(valid_orders, mock_merchant)

    # 상태 업데이트 및 알림톡 트리거
    for item in issued_items:
        str_id = str(item["order_id"])
        if str_id in IN_MEMORY_ORDERS:
            IN_MEMORY_ORDERS[str_id]["tracking_number"] = item["tracking_number"]
            IN_MEMORY_ORDERS[str_id]["status"] = "INVOICE_ISSUED"
            IN_MEMORY_ORDERS[str_id]["invoice_issued_at"] = item["invoice_issued_at"]
        
        # 카카오 알림톡 비동기 발송
        await notification_service.send_alimtalk_notification(
            order_info={
                "orderer_name": item.get("receiver_name"),
                "receiver_name": item.get("receiver_name"),
                "product_name": "청송 햇 부사 꿀사과",
                "tracking_number": item["tracking_number"],
                "receiver_phone": "010-1234-5678"
            },
            merchant_info=mock_merchant
        )

    return {
        "success_count": len(issued_items),
        "failed_count": 0,
        "issued_tracking_numbers": issued_items
    }
