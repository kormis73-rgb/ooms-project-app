# OOMS (Unstructured Order Management System)
> **산지직송 농산물 직거래 비정형 주문 관리 & 우체국 계약 물류 자동화 통합 플랫폼**  
> *Designed by 20+ Years Principal Architect in E-Commerce, ERP & Logistics*

![Architecture](https://img.shields.io/badge/Architecture-Enterprise%20Clean%20Arch-emerald)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20Async-009688)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016+-336791)
![PWA](https://img.shields.io/badge/Frontend-React%2018%20%2B%20PWA-61DAFB)

---

## 📌 주요 3대 독립 웹 화면 구성 (서버 없이 더블클릭 즉시 구동)

본 프로젝트는 설치나 백엔드 기동 없이도 브라우저에서 직접 더블클릭하여 테스트할 수 있는 **3대 독립형 HTML 화면**으로 완벽 분리되어 있습니다:

| 파일명 | 역할 | 주요 기능 |
|---|---|---|
| **`index.html`** | **메인 플랫폼 매니저** | 농가 로그인/로그아웃, 회원가입 & 상품등록, 관리자 농가 명부 및 스테이징 제어 |
| **`farm.html`** | **농가 한손 모바일 포털 (새 창)** | 과수원 현장 조작 특화: 오늘 출하/수주 요약, 원터치 입금확인 토글, 하단 플로팅 액션바(FAB), 로그아웃 |
| **`order.html`** | **고객 직거래 주문 폼 (새 창)** | 비정형 문자/카톡 직접 붙여넣기 AI 정제, 어르신 큰글씨 모드, **엑셀/CSV 표준 서식 대량 단체 주문 파일 업로드** |

---

## 🔑 이번 업데이트 세부 반영 내역

1. **농가 로그인 & 로그아웃 기능 추가**:
   - `index.html` 및 `farm.html` 모두에서 **로그인 세션(`localStorage`)**을 연동
   - 로그인 시 상단에 `[🏡 농장명 (대표자명)]` 정보 배지와 함께 **`[🚪 로그아웃]`** 버튼 제공
   - 농가코드, 성명, 또는 휴대전화번호 검색 로그인 & 원클릭 데모 빠른 로그인 지원
2. **메뉴 라벨 간소화**:
   - 기존 "이미 가입한 농가 로그인" ➔ **`로그인`**
   - 기존 "신규 농가 회원가입 & 상품등록" ➔ **`회원가입`**
3. **농가 한손 모바일 포털 분리 (`farm.html`)**:
   - `index.html` 상단의 **`[🚜 농가 포털 (새 창 ↗)]`** 버튼 클릭 시 독립된 `farm.html`이 새 창/새 탭에서 열리도록 분리

---

## 📂 파일 구조

```text
ooms-project-app/
│
├── index.html                      # [메인 플랫폼] 농가 로그인/회원가입, 관리자 제어 센터
├── farm.html                       # [★신규 분리] 농가 한손 모바일 포털 (새 창 구동)
├── order.html                      # [고객 전용 PWA] 직접 복사입력 + 엑셀 대량주문 (새 창 구동)
├── README.md                       # 프로젝트 종합 가이드
├── docs/
│   └── ARCHITECTURE_SPEC.md       # 총괄 아키텍트 상세 설계 사양서
│
├── database/
│   ├── schema.sql                  # PostgreSQL 16+ DDL
│   └── seed.sql                    # 시드 데이터
│
├── backend/                        # FastAPI 비동기 백엔드
│   ├── app/
│   │   ├── main.py
│   │   ├── services/               # ai_parser, logistics, notification, pre_order
│   │   └── routers/                # orders, logistics, notifications, pre_orders
│   └── requirements.txt
│
└── frontend/                       # React 18 + Vite 개발 프로젝트
```

---

## 🚀 빠른 테스트 방법 (서버 설치 불필요)

1. **메인 플랫폼 ([index.html](file:///c:/Users/USER/.gemini/antigravity/scratch/ooms-project-app/index.html)) 열기**:
   - **[로그인]** 탭에서 데모 계정 클릭 시 로그인 후 농가 포털(`farm.html`)이 새 창에서 즉시 열립니다.
   - 상단에서 로그인된 농가 확인 및 **[로그아웃]**을 테스트할 수 있습니다.
   - **[회원가입]** 탭에서 신규 농가를 가입하면 `localStorage`에 영구 보존되며 관리자 명부에 즉시 반영됩니다.
2. **농가 포털 ([farm.html](file:///c:/Users/USER/.gemini/antigravity/scratch/ooms-project-app/farm.html))**:
   - 현장 농가 스마트폰 규격(375~430px 모바일 레이아웃)으로 원터치 입금확인 및 우체국 송장 출력을 조작할 수 있습니다.
3. **고객 주문 PWA ([order.html](file:///c:/Users/USER/.gemini/antigravity/scratch/ooms-project-app/order.html))**:
   - 비정형 카톡 주문 AI 인식 및 대량 엑셀 템플릿 다운로드/업로드를 테스트할 수 있습니다.
