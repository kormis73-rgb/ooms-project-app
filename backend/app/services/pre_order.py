import datetime
from typing import List, Dict, Any
from uuid import UUID
from backend.app.config import settings

class PreOrderService:
    """
    사전 예약(Pre-Order) 수확 파이프라인 엔진
    - 수확 30일/7일 전 주소 재확인 자동 알림 발송
    - 1-Click 주소 확인 URL 발급
    - 상태(Stage) 전이 관리
    """

    async def trigger_address_verification(
        self,
        merchant_id: UUID,
        days_before: int,
        pre_orders: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        triggered_list = []
        now = datetime.datetime.now(datetime.timezone.utc)

        for po in pre_orders:
            po_id = po.get("pre_order_id")
            order = po.get("order", {})
            confirm_link = f"{settings.APP_PUBLIC_DOMAIN}/pre-order/confirm/{po_id}"

            triggered_list.append({
                "pre_order_id": po_id,
                "order_id": order.get("order_id"),
                "receiver_name": order.get("receiver_name", "고객님"),
                "receiver_phone": order.get("receiver_phone", ""),
                "harvest_target_date": po.get("harvest_target_date"),
                "confirmation_link": confirm_link,
                "triggered_at": now.isoformat(),
                "stage": "ADDRESS_CHECK_SENT"
            })

        return triggered_list

pre_order_service = PreOrderService()
