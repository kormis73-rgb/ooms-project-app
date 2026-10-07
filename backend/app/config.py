from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "OOMS - Unstructured Order Management System"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ooms_db"
    DATABASE_SYNC_URL: str = "postgresql://postgres:postgres@localhost:5432/ooms_db"
    
    # External APIs
    # 행정안전부 도로명주소 오픈 API
    JUSO_API_KEY: str = "devU01TX0FVVEgyMDI2MTAwNjA5MzAxNTExNTEzOTg="
    JUSO_API_URL: str = "https://business.juso.go.kr/addrlink/openApi/searchApi.do"
    
    # 우체국 계약소포 Direct API
    POST_OFFICE_API_KEY: str = "MOCK_POST_OFFICE_KEY_2026"
    POST_OFFICE_BASE_URL: str = "https://parcel.epost.go.kr/api"
    
    # 카카오 알림톡 (Aligo / Solapi Dealer Integration)
    ALIGO_API_KEY: str = "MOCK_ALIGO_API_KEY_2026"
    ALIGO_USER_ID: str = "ooms_master"
    ALIGO_SENDER_PHONE: str = "02-1588-0000"
    
    # App Domain for Pre-order verification
    APP_PUBLIC_DOMAIN: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
