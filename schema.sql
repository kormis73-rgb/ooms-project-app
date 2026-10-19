-- ======================================================================
-- OOMS (Order & Operations Management System) Schema
-- Supabase / PostgreSQL Normalized Single Source of Truth
-- ======================================================================

-- 1. UUID 확장 모듈 활성화
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. 사용자 테이블 (users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    role TEXT NOT NULL DEFAULT 'FARMER' CHECK (role IN ('ADMIN', 'FARMER', 'CUSTOMER')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 농가 정보 테이블 (farms)
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    farm_code TEXT UNIQUE NOT NULL,
    farm_name TEXT NOT NULL,
    representative_name TEXT,
    rep_name TEXT,
    owner_name TEXT,
    business_number TEXT,
    tel TEXT,
    phone TEXT,
    email TEXT,
    postal_code TEXT,
    road_address TEXT,
    detail_address TEXT,
    address TEXT,
    main_crop TEXT,
    bank_name TEXT,
    account_number TEXT,
    account_holder TEXT,
    status TEXT DEFAULT 'ACTIVE',
    courier_account_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 상품 테이블 (products)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit TEXT DEFAULT '5kg 1박스',
    price INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SOLDOUT')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 주문 테이블 (orders)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no TEXT UNIQUE NOT NULL,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    orderer_name TEXT NOT NULL,
    orderer_phone TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    postal_code TEXT,
    road_address TEXT NOT NULL,
    detail_address TEXT,
    memo TEXT,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price INTEGER NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED')),
    delivery_status TEXT NOT NULL DEFAULT 'STAGING' CHECK (delivery_status IN ('STAGING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'READY')),
    courier_name TEXT DEFAULT 'CJ대한통운',
    tracking_number TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 주문 변경 이력 테이블 (order_logs)
CREATE TABLE IF NOT EXISTS order_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT DEFAULT 'SYSTEM',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 생산자 콘텐츠 및 영농일지/현장사진 테이블 (farm_stories)
CREATE TABLE IF NOT EXISTS farm_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    work_category TEXT,
    weather TEXT,
    sugar_content NUMERIC(4, 1), /* 당도 (Brix) */
    image_urls TEXT[], /* Supabase Storage 버킷('farm-media')의 이미지 Public URL 배열 */
    is_public BOOLEAN DEFAULT TRUE, /* 고객 주문창 노출 여부 */
    status TEXT DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 설정
CREATE INDEX IF NOT EXISTS idx_orders_farm_id ON orders(farm_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_farm_stories_farm_id ON farm_stories(farm_id);
