from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.routers import orders, logistics, notifications, pre_orders

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="20년 차 전자상거래·ERP 아키텍트가 설계한 B2B2C 농산물 산지직송 비정형 주문 관리 시스템 (OOMS) API"
)

# CORS Middleware (프론트엔드 연동)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(orders.router, prefix=settings.API_V1_PREFIX)
app.include_router(logistics.router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications.router, prefix=settings.API_V1_PREFIX)
app.include_router(pre_orders.router, prefix=settings.API_V1_PREFIX)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
