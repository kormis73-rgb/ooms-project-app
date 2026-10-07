-- ============================================================================
-- OOMS (Unstructured Order Management System) Full PostgreSQL DDL Schema
-- Designed by: 20+ Years Principal Architect in E-Commerce, ERP & Logistics
-- Target: PostgreSQL 16+ with JSONB, Triggers & Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums Definition
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('PLATFORM_ADMIN', 'MERCHANT', 'CUSTOMER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM (
            'STAGING_PENDING', 
            'STAGING_APPROVED', 
            'PRE_ORDER_RESERVED', 
            'PAYMENT_CONFIRMED', 
            'INVOICE_ISSUED', 
            'SHIPPED', 
            'CANCELLED', 
            'CLAIMED'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pre_order_stage') THEN
        CREATE TYPE pre_order_stage AS ENUM (
            'RESERVATION_RECEIVED', 
            'HARVEST_PENDING', 
            'ADDRESS_CHECK_SENT', 
            'READY_FOR_SHIPMENT'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'claim_type') THEN
        CREATE TYPE claim_type AS ENUM (
            'DAMAGE_PRODUCT', 
            'DELIVERY_DELAY', 
            'ADDRESS_ERROR', 
            'REFUND_REQUEST'
        );
    END IF;
END $$;

-- 1. Merchants & Farms Table
CREATE TABLE IF NOT EXISTS merchants (
    merchant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_code VARCHAR(50) UNIQUE NOT NULL, -- Shortlink Identifier (e.g., cheongsong_apple)
    business_name VARCHAR(100) NOT NULL,
    representative_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    bank_name VARCHAR(50),
    bank_account_number VARCHAR(50),
    bank_account_holder VARCHAR(50),
    post_office_customer_num VARCHAR(10), -- 우체국 계약 10자리 고객번호
    post_office_approval_num VARCHAR(20), -- 우체국 승인번호
    kakao_sender_key VARCHAR(100), -- 카카오 알림톡 발신프로필 키
    profile_image_url TEXT,
    farm_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products & Crop Masters Table
CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(merchant_id) ON DELETE CASCADE,
    product_name VARCHAR(100) NOT NULL, -- 예: 청송 꿀사과, 하미과 노랑멜론
    variety_name VARCHAR(50), -- 품종: 부사, 시나노골드 등
    characteristics TEXT, -- 당도 15Brix 이상, 아삭한 과육 등
    specification VARCHAR(50) NOT NULL, -- 예: 3수-7.5kg, 5kg(14-16과)
    unit_price NUMERIC(12, 2) NOT NULL,
    box_quantity INT DEFAULT 1,
    max_harvest_capacity INT DEFAULT 0, -- 총 수확 가능 수량 (수주 제어용)
    current_reserved_qty INT DEFAULT 0,
    is_pre_order_enabled BOOLEAN DEFAULT FALSE,
    harvest_expected_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crop Story & Multimedia CRM Table
CREATE TABLE IF NOT EXISTS crop_stories (
    story_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(merchant_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    planting_date DATE,
    expected_harvest_date DATE,
    media_type VARCHAR(10) CHECK (media_type IN ('IMAGE', 'VIDEO')),
    media_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Main Orders & Raw Unstructured Ingest Table
CREATE TABLE IF NOT EXISTS orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(merchant_id),
    referrer_id VARCHAR(50), -- 추천인 파라미터 (수수료/포상금용)
    raw_text_content TEXT, -- 인입된 원문 (문자, 카톡, 손글씨 OCR 등)
    channel_source VARCHAR(20) DEFAULT 'WEB_LINK', -- WEB_LINK, SMS, KAKAO_TALK, OCR_IMAGE, EXCEL
    
    -- Parsed & Refined Fields
    orderer_name VARCHAR(50),
    orderer_phone VARCHAR(20),
    receiver_name VARCHAR(50),
    receiver_phone VARCHAR(20),
    
    -- Address Refinement (행안부 API)
    raw_address TEXT,
    refined_road_address TEXT, -- 표준 도로명주소
    refined_detail_address TEXT,
    zip_code VARCHAR(5) NOT NULL, -- 5자리 기초구역 우편번호
    building_management_num VARCHAR(25), -- bdMgtSn (건물관리번호)
    
    -- Product & Message
    product_id UUID REFERENCES products(product_id),
    order_quantity INT DEFAULT 1,
    greeting_card_message TEXT, -- 명절 선물 인사말 출력용 문구
    delivery_message TEXT,
    is_designated_date_requested BOOLEAN DEFAULT FALSE, -- 지정 배송일 인지 플래그
    requested_delivery_date DATE,
    
    -- Status & Safety
    status order_status DEFAULT 'STAGING_PENDING',
    confidence_score NUMERIC(3, 2), -- 0.00 ~ 1.00 AI 신뢰도 점수
    confidence_flags JSONB DEFAULT '{}'::jsonb, -- 세부 매칭 판정 사유
    payment_confirmed_by_merchant BOOLEAN DEFAULT FALSE,
    
    -- Logistics Tracking
    courier_code VARCHAR(20) DEFAULT 'POST_OFFICE', -- POST_OFFICE, CJ
    tracking_number VARCHAR(20), -- 우체국 13자리 등기 운송장 번호
    invoice_issued_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Pre-Orders (Seasonal Harvest Pipeline) Table
CREATE TABLE IF NOT EXISTS pre_orders (
    pre_order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    harvest_target_date DATE NOT NULL,
    stage pre_order_stage DEFAULT 'RESERVATION_RECEIVED',
    address_check_sent_at TIMESTAMP WITH TIME ZONE,
    is_address_confirmed_by_customer BOOLEAN DEFAULT FALSE,
    customer_notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Claims & Customer CS Table
CREATE TABLE IF NOT EXISTS claims (
    claim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(order_id),
    merchant_id UUID NOT NULL REFERENCES merchants(merchant_id),
    claim_type claim_type NOT NULL,
    proof_image_url TEXT,
    description TEXT,
    resolution_status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, RE_SHIPPED, REFUNDED, CLOSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 7. Settlement & Commission Table
CREATE TABLE IF NOT EXISTS settlements (
    settlement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(merchant_id),
    settlement_period_start DATE NOT NULL,
    settlement_period_end DATE NOT NULL,
    total_gross_sales NUMERIC(12, 2) DEFAULT 0,
    platform_fee_amount NUMERIC(12, 2) DEFAULT 0, -- 플랫폼 이용 수수료
    referral_incentive_amount NUMERIC(12, 2) DEFAULT 0, -- 추천 모객 포상금 차감
    net_payout_amount NUMERIC(12, 2) DEFAULT 0, -- 최종 지급액
    is_settled BOOLEAN DEFAULT FALSE,
    settled_at TIMESTAMP WITH TIME ZONE
);

-- Triggers for automatic inventory update on Pre-Order creation
CREATE OR REPLACE FUNCTION update_product_reserved_qty()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE products 
        SET current_reserved_qty = current_reserved_qty + NEW.order_quantity
        WHERE product_id = NEW.product_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE products 
        SET current_reserved_qty = current_reserved_qty - OLD.order_quantity
        WHERE product_id = OLD.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_reserved_qty ON orders;
CREATE TRIGGER trg_orders_reserved_qty
AFTER INSERT OR DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_product_reserved_qty();

-- Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status ON orders(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_confidence ON orders(confidence_score);
CREATE INDEX IF NOT EXISTS idx_orders_zipcode ON orders(zip_code);
CREATE INDEX IF NOT EXISTS idx_products_merchant ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_pre_orders_harvest_stage ON pre_orders(harvest_target_date, stage);
