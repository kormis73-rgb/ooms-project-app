import React, { useState } from 'react';

export default function StagingApprovalDashboard() {
  const [stagingOrders, setStagingOrders] = useState([
    {
      id: 'f6a7b89c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
      source: 'SMS',
      rawText: '주문자 이진우 010-8821-9942 받는분 최은경 010-7733-1122 서울시 강남구 테헤란로 152 강남파이낸스센터 18층 부사 꿀사과 2박스 보내주세요. 부모님 선물입니다.',
      orderer: '이진우',
      ordererPhone: '010-8821-9942',
      receiver: '최은경',
      receiverPhone: '010-7733-1122',
      roadAddress: '서울특별시 강남구 테헤란로 152 (역삼동)',
      detailAddress: '강남파이낸스센터 18층',
      zipCode: '06236',
      productName: '2026 가을 햇 부사 꿀사과 (특품 5kg)',
      quantity: 2,
      greetingMessage: '늘 건강하시고 행복 가득한 명절 되세요.',
      confidenceScore: 0.96,
      confidenceLevel: 'GREEN',
      status: 'STAGING_PENDING',
      trackingNumber: null
    },
    {
      id: 'a7b89c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
      source: 'KAKAO_TALK',
      rawText: '황금사과 1개 박스 부탁드려요 박민호 010-4491-0021 경기도 성남시 분당구 판교역로 166',
      orderer: '박민호',
      ordererPhone: '010-4491-0021',
      receiver: '박민호',
      receiverPhone: '010-4491-0021',
      roadAddress: '경기도 성남시 분당구 판교역로 166 (백현동)',
      detailAddress: '상세 동/호수 미기재 (확인 요망)',
      zipCode: '13529',
      productName: '청송 시나노골드 황금사과 3kg',
      quantity: 1,
      greetingMessage: null,
      confidenceScore: 0.72,
      confidenceLevel: 'YELLOW',
      status: 'STAGING_PENDING',
      trackingNumber: null
    },
    {
      id: 'b89c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
      source: 'OCR_IMAGE',
      rawText: '사과 몇개보내줘 주소는 대전 서구 둔산로 100 홍길동 전화 010-999-XXXX',
      orderer: '홍길동',
      ordererPhone: '010-9999-0000',
      receiver: '홍길동',
      receiverPhone: '010-9999-0000',
      roadAddress: '대전광역시 서구 둔산로 100 (둔산동)',
      detailAddress: '상세 주소 미입력',
      zipCode: '35238',
      productName: '기본 사과 (품종 재확인 필요)',
      quantity: 1,
      greetingMessage: null,
      confidenceScore: 0.45,
      confidenceLevel: 'RED',
      status: 'STAGING_PENDING',
      trackingNumber: null
    }
  ]);

  const [selectedIds, setSelectedIds] = useState(['f6a7b89c-0d1e-2f3a-4b5c-6d7e8f9a0b1c']);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, GREEN, YELLOW, RED
  const [batchModal, setBatchModal] = useState(false);
  const [invoiceResults, setInvoiceResults] = useState([]);

  // 단일 승인 처리
  const handleApprove = (id) => {
    setStagingOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'STAGING_APPROVED' } : o));
  };

  // GREEN 일괄 1-클릭 승인
  const handleApproveAllGreen = () => {
    setStagingOrders(prev => prev.map(o => o.confidenceLevel === 'GREEN' ? { ...o, status: 'STAGING_APPROVED' } : o));
    alert('모든 고신뢰도(GREEN) 주문이 1-클릭 일괄 승인되었습니다.');
  };

  // 우체국 계약소포 Direct API 일괄 송장 발급
  const handleBatchIssueInvoices = () => {
    const issued = stagingOrders
      .filter(o => selectedIds.includes(o.id) && o.status === 'STAGING_APPROVED')
      .map(o => ({
        id: o.id,
        receiver: o.receiver,
        product: o.productName,
        tracking: `689${Math.floor(1000000000 + Math.random() * 9000000000)}`
      }));

    if (issued.length === 0) {
      alert('승인완료(STAGING_APPROVED) 상태인 선택 주문이 없습니다. 먼저 주문을 승인해주세요.');
      return;
    }

    setInvoiceResults(issued);
    setStagingOrders(prev => prev.map(o => {
      const match = issued.find(i => i.id === o.id);
      return match ? { ...o, status: 'INVOICE_ISSUED', trackingNumber: match.tracking } : o;
    }));
    setBatchModal(true);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = stagingOrders.filter(o => {
    if (activeTab === 'GREEN') return o.confidenceLevel === 'GREEN';
    if (activeTab === 'YELLOW') return o.confidenceLevel === 'YELLOW';
    if (activeTab === 'RED') return o.confidenceLevel === 'RED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* 대시보드 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-farm-600 text-white font-extrabold text-xs px-2.5 py-1 rounded">
              Platform Admin
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              OOMS 스테이징 승인 컨트롤 센터
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            비정형 주문 AI 파싱 및 행안부 도로명주소 정제 검증 • Human-in-the-Loop 1-Click 승인
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleApproveAllGreen}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            ⚡ 고신뢰도(GREEN) 1-클릭 일괄 승인
          </button>
          <button
            onClick={handleBatchIssueInvoices}
            className="bg-harvest-500 hover:bg-harvest-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            🚚 우체국 계약소포 송장 일괄 발급
          </button>
        </div>
      </div>

      {/* 신호등 필터 탭 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'ALL', label: '전체 주문', count: stagingOrders.length },
          { key: 'GREEN', label: '🟢 고신뢰도 (1-클릭 승인)', count: stagingOrders.filter(o => o.confidenceLevel === 'GREEN').length },
          { key: 'YELLOW', label: '🟡 주소보완 필요', count: stagingOrders.filter(o => o.confidenceLevel === 'YELLOW').length },
          { key: 'RED', label: '🔴 수동 검토 필요', count: stagingOrders.filter(o => o.confidenceLevel === 'RED').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${activeTab === tab.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Split-View 주문 목록 */}
      <div className="space-y-4">
        {filtered.map(order => (
          <div
            key={order.id}
            className={`bg-white rounded-2xl border-2 shadow-sm transition-all overflow-hidden ${order.confidenceLevel === 'GREEN' ? 'border-emerald-200' : order.confidenceLevel === 'YELLOW' ? 'border-amber-200' : 'border-rose-200'}`}
          >
            {/* 카드 상단 바 */}
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(order.id)}
                  onChange={() => toggleSelect(order.id)}
                  className="w-4 h-4 accent-farm-600 rounded cursor-pointer"
                />
                <span className="font-mono text-slate-400">ID: {order.id.slice(0, 8)}...</span>
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                  유입: {order.source}
                </span>
                <span className={`px-2 py-0.5 rounded font-black ${order.status === 'INVOICE_ISSUED' ? 'bg-purple-100 text-purple-700' : order.status === 'STAGING_APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                  {order.status === 'INVOICE_ISSUED' ? '송장발급완료' : order.status === 'STAGING_APPROVED' ? '승인완료' : '검토대기'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${order.confidenceLevel === 'GREEN' ? 'bg-emerald-500' : order.confidenceLevel === 'YELLOW' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                  <span className="font-extrabold text-slate-800">
                    AI 신뢰도 {Math.round(order.confidenceScore * 100)}%
                  </span>
                </div>

                {order.status === 'STAGING_PENDING' ? (
                  <button
                    onClick={() => handleApprove(order.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs"
                  >
                    1-클릭 승인
                  </button>
                ) : (
                  <span className="text-emerald-600 font-bold text-xs">✓ 승인됨</span>
                )}
              </div>
            </div>

            {/* Split-View 본문: 좌측 원문 vs 우측 정제 결과 */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-4 gap-4">
              {/* 좌측: 비정형 원문 */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  📥 인입 비정형 원문 (Raw Input)
                </h4>
                <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-700 border border-slate-100 leading-relaxed min-h-[90px]">
                  {order.rawText}
                </div>
              </div>

              {/* 우측: 행안부 도로명 & 상품 매칭 정제 필드 */}
              <div>
                <h4 className="text-xs font-bold text-farm-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>🏛 정제 완료 필드 (Refined Schema)</span>
                  <span className="font-mono bg-farm-50 text-farm-700 px-1.5 py-0.5 rounded text-[11px]">
                    우편번호: {order.zipCode}
                  </span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">주문자/수령인:</span>
                    <span className="font-bold text-slate-800">
                      {order.orderer} ({order.ordererPhone}) ➔ {order.receiver} ({order.receiverPhone})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">도로명주소:</span>
                    <span className="font-bold text-slate-800 text-right">{order.roadAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">상세주소:</span>
                    <span className={`font-semibold ${order.detailAddress.includes('미기재') || order.detailAddress.includes('미입력') ? 'text-amber-600 bg-amber-50 px-1 rounded' : 'text-slate-700'}`}>
                      {order.detailAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">매칭 상품:</span>
                    <span className="font-extrabold text-harvest-600">
                      {order.productName} ({order.quantity}박스)
                    </span>
                  </div>
                  {order.greetingMessage && (
                    <div className="flex justify-between bg-yellow-50/60 p-1.5 rounded border border-yellow-200/50">
                      <span className="text-yellow-700 font-semibold">💌 선물 문구:</span>
                      <span className="text-slate-700 italic">{order.greetingMessage}</span>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div className="flex justify-between bg-purple-50 p-1.5 rounded border border-purple-200">
                      <span className="text-purple-700 font-bold">우체국 등기송장:</span>
                      <span className="font-mono font-extrabold text-purple-900">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 우체국 송장 발급 결과 모달 */}
      {batchModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-harvest-100 text-harvest-600 rounded-full flex items-center justify-center text-xl">
                🚚
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  우체국 계약소포 송장 일괄 발급 완료
                </h3>
                <p className="text-xs text-slate-500">
                  우체국 계약 고객번호(1092837465) Direct API 연동 완료 • 카카오 알림톡 자동 발송
                </p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl mb-4">
              {invoiceResults.map((inv, idx) => (
                <div key={idx} className="p-3 text-xs flex justify-between items-center bg-slate-50/50">
                  <div>
                    <p className="font-bold text-slate-800">{inv.receiver}님 ({inv.product})</p>
                    <p className="font-mono text-purple-700 font-black mt-0.5">등기송장: {inv.tracking}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded">
                    알림톡 전송완료
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setBatchModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
