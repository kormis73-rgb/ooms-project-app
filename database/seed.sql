-- ============================================================================
-- OOMS Seed Data for Testing and Verification
-- ============================================================================

-- 1. Insert Sample Merchants
INSERT INTO merchants (
    merchant_id, merchant_code, business_name, representative_name, phone_number,
    bank_name, bank_account_number, bank_account_holder,
    post_office_customer_num, post_office_approval_num, kakao_sender_key,
    farm_address
) VALUES 
(
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'cheongsong_apple',
    '청송 하늘아래 꿀사과 농원',
    '김만석',
    '010-3849-1234',
    '농협은행',
    '302-1234-5678-91',
    '김만석(청송농원)',
    '1092837465',
    'POST-APPR-2026-991',
    'KAKAO_SENDER_KEY_CHEONGSONG_001',
    '경상북도 청송군 주왕산면 당마루길 45'
),
(
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'naju_pear',
    '나주 금천 배사랑 과수원',
    '박순자',
    '010-9182-7364',
    '국민은행',
    '401202-04-123456',
    '박순자',
    '1084729104',
    'POST-APPR-2026-882',
    'KAKAO_SENDER_KEY_NAJU_002',
    '전라남도 나주시 금천면 영산포로 102'
) ON CONFLICT (merchant_code) DO NOTHING;

-- 2. Insert Products
INSERT INTO products (
    product_id, merchant_id, product_name, variety_name, characteristics,
    specification, unit_price, box_quantity, max_harvest_capacity, current_reserved_qty,
    is_pre_order_enabled, harvest_expected_date
) VALUES 
(
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    '2026 가을 햇 부사 꿀사과',
    '부사(후지)',
    '청송 해발 400m 일조량 풍부, 당도 15.5 Brix 보증, 특유의 밀(꿀) 형성',
    '5kg(14~16과 특품)',
    42000,
    1,
    500,
    14,
    TRUE,
    '2026-11-10'
),
(
    'd4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    '청송 껍질째 먹는 시나노골드 황금사과',
    '시나노골드',
    '상큼 달콤한 황금빛 프리미엄 사과, 아삭한 식감 극대화',
    '3kg(9~11과)',
    35000,
    1,
    300,
    8,
    TRUE,
    '2026-10-25'
),
(
    'e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    '나주 명품 신고배 선물세트',
    '신고',
    '풍부한 과즙과 시원한 단맛, 제수용/명절 최고급 정과',
    '7.5kg(7~9과 대과)',
    58000,
    1,
    400,
    32,
    TRUE,
    '2026-10-30'
) ON CONFLICT DO NOTHING;

-- 3. Insert Crop Story
INSERT INTO crop_stories (
    story_id, merchant_id, title, planting_date, expected_harvest_date,
    media_type, media_url, description
) VALUES
(
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    '청송 햇사과 과수원에 가을 꿀이 차오르고 있습니다',
    '2026-04-15',
    '2026-11-10',
    'IMAGE',
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800',
    '청송 주왕산 자락의 큰 일교차 덕분에 올해 사과 때깔과 당도가 역대급입니다. 11월 상순 정식 수확 전 사전예약 고객님들께 산지 직송 약속드립니다.'
);

-- 4. Insert Sample Orders (With Traffic Light Confidence Cases)
-- Case 1: High Confidence (GREEN 0.96) - Address & Product Perfect Match
INSERT INTO orders (
    order_id, merchant_id, referrer_id, raw_text_content, channel_source,
    orderer_name, orderer_phone, receiver_name, receiver_phone,
    raw_address, refined_road_address, refined_detail_address, zip_code, building_management_num,
    product_id, order_quantity, greeting_card_message, delivery_message,
    status, confidence_score, payment_confirmed_by_merchant, courier_code
) VALUES (
    'f6a7b89c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'REF_INSTA_01',
    '주문자 이진우 010-8821-9942 받는분 최은경 010-7733-1122 서울시 강남구 테헤란로 152 강남파이낸스센터 18층 부사 꿀사과 2박스 보내주세요. 부모님 선물입니다.',
    'SMS',
    '이진우', '010-8821-9942', '최은경', '010-7733-1122',
    '서울시 강남구 테헤란로 152 강남파이낸스센터 18층',
    '서울특별시 강남구 테헤란로 152 (역삼동)', '강남파이낸스센터 18층', '06236', '1168010100107370000000001',
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 2, '늘 건강하시고 행복 가득한 명절 되세요.', '부재 시 문 앞에 놓아주세요.',
    'STAGING_PENDING', 0.96, TRUE, 'POST_OFFICE'
);

-- Case 2: Medium Confidence (YELLOW 0.75) - Detail Address Missing
INSERT INTO orders (
    order_id, merchant_id, referrer_id, raw_text_content, channel_source,
    orderer_name, orderer_phone, receiver_name, receiver_phone,
    raw_address, refined_road_address, refined_detail_address, zip_code, building_management_num,
    product_id, order_quantity, delivery_message,
    status, confidence_score, payment_confirmed_by_merchant, courier_code
) VALUES (
    'a7b89c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'REF_YOUTUBE_02',
    '황금사과 1개 박스 부탁드려요 박민호 010-4491-0021 경기도 성남시 분당구 판교역로 166',
    'KAKAO_TALK',
    '박민호', '010-4491-0021', '박민호', '010-4491-0021',
    '경기도 성남시 분당구 판교역로 166',
    '경기도 성남시 분당구 판교역로 166 (백현동)', '상세 동/호수 미기재', '13529', '4113510900105320000000001',
    'd4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a', 1, '배송 전 연락 부탁드립니다.',
    'STAGING_PENDING', 0.72, FALSE, 'POST_OFFICE'
);

-- Case 3: Low Confidence (RED 0.45) - Product Ambiguous & Phone Typo
INSERT INTO orders (
    order_id, merchant_id, referrer_id, raw_text_content, channel_source,
    orderer_name, orderer_phone, receiver_name, receiver_phone,
    raw_address, refined_road_address, refined_detail_address, zip_code, building_management_num,
    product_id, order_quantity,
    status, confidence_score, payment_confirmed_by_merchant, courier_code
) VALUES (
    'b89c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    NULL,
    '사과 몇개보내줘 주소는 대전 서구 둔산로 100 홍길동 전화 010-999-XXXX',
    'OCR_IMAGE',
    '홍길동', '010-9999-0000', '홍길동', '010-9999-0000',
    '대전 서구 둔산로 100',
    '대전광역시 서구 둔산로 100 (둔산동)', '상세 미입력', '35238', '3017011200114200000000001',
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 1,
    'STAGING_PENDING', 0.45, FALSE, 'POST_OFFICE'
);

-- 5. Insert Sample Pre-Orders
INSERT INTO pre_orders (
    pre_order_id, order_id, harvest_target_date, stage, address_check_sent_at, is_address_confirmed_by_customer
) VALUES (
    gen_random_uuid(),
    'f6a7b89c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    '2026-11-10',
    'RESERVATION_RECEIVED',
    NULL,
    FALSE
);
