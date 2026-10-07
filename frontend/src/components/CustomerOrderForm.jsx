import React, { useState } from 'react';

export default function CustomerOrderForm({ onOrderSubmitted }) {
  const [seniorMode, setSeniorMode] = useState(false);
  const [rawText, setRawText] = useState(
    '주문자 이진우 010-8821-9942 받는분 최은경 010-7733-1122 서울시 강남구 테헤란로 152 강남파이낸스센터 18층 부사 꿀사과 2박스 부탁드려요. 부모님 선물입니다.'
  );
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState({
    orderer_name: '이진우',
    orderer_phone: '010-8821-9942',
    receiver_name: '최은경',
    receiver_phone: '010-7733-1122',
    refined_road_address: '서울특별시 강남구 테헤란로 152 (역삼동)',
    refined_detail_address: '강남파이낸스센터 18층',
    zip_code: '06236',
    product_name: '2026 가을 햇 부사 꿀사과 5kg',
    order_quantity: 2,
    unit_price: 42000,
    total_amount: 84000,
    confidence_score: 0.96,
    confidence_level: 'GREEN'
  });
  const [orderComplete, setOrderComplete] = useState(false);

  // AI 즉시 인식 시뮬레이션
  const handleAIParse = async () => {
    setIsParsing(true);
    setTimeout(() => {
      // 텍스트 분석 로직
      const phoneMatch = rawText.match(/01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}/g) || ['010-1234-5678'];
      const qtyMatch = rawText.match(/(\d+)\s*(박스|상자|개)/);
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

      setParsedData({
        orderer_name: rawText.includes('이진우') ? '이진우' : '고객님',
        orderer_phone: phoneMatch[0] || '010-0000-0000',
        receiver_name: rawText.includes('최은경') ? '최은경' : '수령인',
        receiver_phone: phoneMatch[1] || phoneMatch[0],
        refined_road_address: rawText.includes('테헤란로') ? '서울특별시 강남구 테헤란로 152 (역삼동)' : '경기도 성남시 분당구 판교역로 166 (백현동)',
        refined_detail_address: rawText.includes('18층') ? '강남파이낸스센터 18층' : '상세 주소 확인 요망',
        zip_code: rawText.includes('테헤란로') ? '06236' : '13529',
        product_name: rawText.includes('시나노') ? '청송 시나노골드 황금사과 3kg' : '2026 가을 햇 부사 꿀사과 5kg',
        order_quantity: qty,
        unit_price: 42000,
        total_amount: 42000 * qty,
        confidence_score: 0.95,
        confidence_level: 'GREEN'
      });
      setIsParsing(false);
    }, 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('개인정보 수집 및 주문 정보 처리에 동의해주세요.');
      return;
    }
    setOrderComplete(true);
    if (onOrderSubmitted) {
      onOrderSubmitted(parsedData);
    }
  };

  return (
    <div className={`max-w-md mx-auto min-h-screen bg-slate-50 shadow-xl border-x border-slate-200 pb-20 ${seniorMode ? 'text-lg' : 'text-sm'}`}>
      
      {/* 1. 상단 농가 프로필 배지 */}
      <div className="bg-gradient-to-r from-farm-600 to-farm-700 text-white p-5 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium tracking-wide">
            🌱 산지직송 직거래 공식 링크
          </span>
          {/* 시니어 큰글씨 모드 스위치 */}
          <button 
            type="button"
            onClick={() => setSeniorMode(!seniorMode)}
            className="flex items-center gap-1.5 text-xs bg-harvest-500 hover:bg-harvest-600 px-3 py-1.5 rounded-full font-bold shadow-sm transition-all"
          >
            👓 {seniorMode ? '일반 글씨' : '어르신 큰글씨'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-inner bg-farm-100 flex-shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=200" 
              alt="농부 프로필" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className={`${seniorMode ? 'text-2xl' : 'text-xl'} font-extrabold tracking-tight`}>
              청송 하늘아래 꿀사과
            </h1>
            <p className="text-farm-100 text-xs mt-0.5 font-medium">
              대표 농부 김만석 • 경북 청송군 주왕산면
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded">
                당도 15.5 Brix 보증
              </span>
              <span className="text-xs text-farm-100 underline cursor-pointer">
                농장 스토리 보기 &gt;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 수확 타임라인 비주얼라이저 (Pre-Order Timeline) */}
      <div className="mx-4 mt-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          🌾 2026 햇사과 수확 파이프라인
        </h3>
        <div className="grid grid-cols-4 gap-1 text-center relative">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-farm-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-farm-100">
              ✓
            </div>
            <span className="text-[11px] font-bold text-slate-800 mt-1.5">예약접수</span>
            <span className="text-[9px] text-farm-600 font-semibold">오늘</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <span className="text-[11px] font-medium text-slate-600 mt-1.5">스토리소식</span>
            <span className="text-[9px] text-slate-400">D-30</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <span className="text-[11px] font-medium text-slate-600 mt-1.5">주소재확인</span>
            <span className="text-[9px] text-slate-400">D-7</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-harvest-500 text-white flex items-center justify-center font-bold text-xs">
              🚚
            </div>
            <span className="text-[11px] font-bold text-harvest-600 mt-1.5">우체국발송</span>
            <span className="text-[9px] text-harvest-600 font-semibold">11/10</span>
          </div>
        </div>
      </div>

      {/* 3. 비정형 원문 복사/붙여넣기 입력창 */}
      <div className="mx-4 mt-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <label className={`font-bold text-slate-800 ${seniorMode ? 'text-lg' : 'text-sm'}`}>
            💬 문자 / 카톡 주문내용 복사·붙여넣기
          </label>
          <span className="text-xs text-farm-600 bg-farm-50 px-2 py-0.5 rounded font-semibold">
            AI 자동 인식
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-2 leading-relaxed">
          지인에게 받은 카톡이나 문자 메시지를 그대로 복사해 넣으면 AI가 도로명 주소와 우편번호까지 자동으로 찾아냅니다.
        </p>
        <textarea
          rows={seniorMode ? 5 : 4}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="예: 홍길동 010-1234-5678 서울시 강남구 테헤란로 152 18층 사과 2박스 보내주세요"
          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-farm-500 focus:outline-none text-slate-700 bg-slate-50/50 resize-none font-medium"
        />

        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={handleAIParse}
            disabled={isParsing}
            className="flex-1 bg-farm-600 hover:bg-farm-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {isParsing ? (
              <span className="animate-spin text-sm">🔄 AI 분석 중...</span>
            ) : (
              <span>⚡ AI 즉시 주소·주문 정제</span>
            )}
          </button>
          
          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all">
            📸 OCR 사진
            <input type="file" accept="image/*" className="hidden" onChange={() => alert('손글씨 OCR 이미지 인식 모듈이 작동합니다.')} />
          </label>
        </div>
      </div>

      {/* 4. AI Instant Recognition Card (실시간 인식 카드) */}
      <div className="mx-4 mt-4 p-5 bg-gradient-to-b from-white to-farm-50/30 rounded-2xl shadow-md border-2 border-farm-200">
        <div className="flex items-center justify-between pb-3 border-b border-farm-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-farm-500 animate-ping"></span>
            <h2 className="font-black text-slate-800 text-base">
              AI 스마트 주문서 인식 결과
            </h2>
          </div>
          <span className="text-xs bg-farm-100 text-farm-700 font-extrabold px-2.5 py-1 rounded-full">
            신뢰도 {Math.round(parsedData.confidence_score * 100)}% ({parsedData.confidence_level})
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 text-xs">주문자 / 연락처</span>
            <span className="font-bold text-slate-800">
              {parsedData.orderer_name} ({parsedData.orderer_phone})
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 text-xs">받는 분 / 연락처</span>
            <span className="font-bold text-slate-800">
              {parsedData.receiver_name} ({parsedData.receiver_phone})
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-farm-200">
            <div className="flex items-center justify-between text-xs text-farm-700 font-semibold mb-1">
              <span>🏛 행안부 표준 도로명주소 & 5자리 우편번호</span>
              <span className="bg-farm-600 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                {parsedData.zip_code}
              </span>
            </div>
            <p className="font-bold text-slate-800 text-sm">
              {parsedData.refined_road_address}
            </p>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              상세: {parsedData.refined_detail_address}
            </p>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 text-xs">선택 상품 & 수량</span>
            <div className="text-right">
              <p className="font-bold text-slate-800">{parsedData.product_name}</p>
              <p className="text-xs text-harvest-600 font-bold">{parsedData.order_quantity} 박스 ({parsedData.total_amount.toLocaleString()}원)</p>
            </div>
          </div>
        </div>

        {/* 약관 동의 및 제출 */}
        <div className="mt-5 pt-4 border-t border-farm-100">
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input 
              type="checkbox" 
              checked={agreeTerms} 
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-5 h-5 accent-farm-600 rounded cursor-pointer"
            />
            <span className="text-xs text-slate-600 font-medium">
              개인정보 수집 및 우체국 택배 발송 알림톡 수신에 동의합니다.
            </span>
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-harvest-500 hover:bg-harvest-600 active:scale-[0.99] text-white font-extrabold py-4 px-6 rounded-2xl text-base shadow-lg shadow-harvest-500/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>🎁 산지직송 직거래 주문 확정하기</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">1-클릭</span>
          </button>
        </div>
      </div>

      {/* 완료 모달 */}
      {orderComplete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-farm-100 text-farm-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-black">
              ✓
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              주문 접수가 완료되었습니다!
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              농가에 실시간 주문이 전달되었으며, 카카오 알림톡으로 입금 계좌 및 배송 안내가 발송됩니다.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl text-left text-xs space-y-1 mb-5 border border-slate-200">
              <p><span className="text-slate-400">받는 분:</span> <b>{parsedData.receiver_name}</b></p>
              <p><span className="text-slate-400">주소:</span> {parsedData.refined_road_address}</p>
              <p><span className="text-slate-400">상품:</span> {parsedData.product_name} ({parsedData.order_quantity}박스)</p>
              <p><span className="text-slate-400">결제금액:</span> <b className="text-harvest-600">{parsedData.total_amount.toLocaleString()}원</b></p>
            </div>
            <button
              type="button"
              onClick={() => setOrderComplete(false)}
              className="w-full bg-farm-600 hover:bg-farm-700 text-white font-bold py-3 rounded-xl text-sm"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
