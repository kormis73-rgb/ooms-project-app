import React, { useState } from 'react';

export default function MerchantDashboard() {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-101',
      orderer: '이진우',
      phone: '010-8821-9942',
      receiver: '최은경',
      product: '햇 부사 5kg (2박스)',
      amount: 84000,
      bankInfo: '농협 302-***',
      paid: true,
      status: 'PRE_ORDER_RESERVED',
      address: '서울시 강남구 테헤란로 152 18층',
      zip: '06236',
      tracking: '6891238475821'
    },
    {
      id: 'ORD-102',
      orderer: '박민호',
      phone: '010-4491-0021',
      receiver: '박민호',
      product: '시나노골드 3kg (1박스)',
      amount: 35000,
      bankInfo: '국민 401202-***',
      paid: false,
      status: 'STAGING_PENDING',
      address: '경기도 성남시 분당구 판교역로 166',
      zip: '13529',
      tracking: null
    },
    {
      id: 'ORD-103',
      orderer: '정미선',
      phone: '010-5521-8841',
      receiver: '김철수',
      product: '햇 부사 5kg (3박스)',
      amount: 126000,
      bankInfo: '농협 302-***',
      paid: false,
      status: 'STAGING_PENDING',
      address: '부산시 해운대구 센텀중앙로 48',
      zip: '48058',
      tracking: null
    }
  ]);

  const [filterPaid, setFilterPaid] = useState('ALL'); // ALL, UNPAID, PAID
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const togglePayment = (id) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const nextPaid = !o.paid;
        showToast(`${o.orderer}님 주문 [${nextPaid ? '입금 확인 완료' : '미입금 처리'}]`);
        return { ...o, paid: nextPaid };
      }
      return o;
    }));
  };

  const filteredOrders = orders.filter(o => {
    if (filterPaid === 'UNPAID') return !o.paid;
    if (filterPaid === 'PAID') return o.paid;
    return true;
  });

  const totalSales = orders.reduce((sum, o) => sum + (o.paid ? o.amount : 0), 0);
  const unpaidCount = orders.filter(o => !o.paid).length;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-100 pb-28 text-slate-800">
      
      {/* 상단 농가 헤더 */}
      <div className="bg-slate-900 text-white p-5 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-extrabold text-sm tracking-wide text-emerald-400">
              청송 꿀사과 농원 • 김만석 대표님
            </span>
          </div>
          <span className="text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
            우체국 계약 1092837465
          </span>
        </div>
        <h1 className="text-xl font-black mt-2">농가 한손 모바일 포털</h1>
      </div>

      {/* 실시간 출하 및 수확 현황 카드 */}
      <div className="p-4 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xs font-bold text-slate-500 mb-3 flex items-center justify-between">
            <span>📦 오늘 출하 & 예약 현황 요약</span>
            <span className="text-farm-600 font-semibold text-[11px]">수확 D-35</span>
          </h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[11px] text-slate-500">총 예약 접수</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">500박스</p>
              <span className="text-[10px] text-farm-600 font-bold">달성률 68%</span>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <p className="text-[11px] text-emerald-700">입금 확인 완료</p>
              <p className="text-lg font-black text-emerald-800 mt-0.5">342박스</p>
              <span className="text-[10px] text-emerald-600 font-bold">{totalSales.toLocaleString()}원</span>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              <p className="text-[11px] text-amber-700">입금 대기</p>
              <p className="text-lg font-black text-amber-800 mt-0.5">{unpaidCount}건</p>
              <span className="text-[10px] text-amber-600 font-bold">확인 필요</span>
            </div>
          </div>
        </div>

        {/* 미확인 입금자 / 주문 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              입금 확인 및 수주 관리
            </h3>
            <div className="flex gap-1 text-xs">
              <button
                onClick={() => setFilterPaid('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${filterPaid === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterPaid('UNPAID')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${filterPaid === 'UNPAID' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                미입금 ({unpaidCount})
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredOrders.map(order => (
              <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{order.orderer}</span>
                      <span className="text-xs text-slate-500">{order.phone}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${order.paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {order.paid ? '입금완료' : '입금확인요망'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1">
                      {order.product} • <span className="font-bold text-harvest-600">{order.amount.toLocaleString()}원</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[240px]">
                      {order.address} ({order.zip})
                    </p>
                  </div>

                  {/* 원터치 입금확인 토글 버튼 */}
                  <button
                    onClick={() => togglePayment(order.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 ${order.paid ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-farm-600 hover:bg-farm-700 text-white shadow-farm-600/30'}`}
                  >
                    {order.paid ? '취소' : '✓ 입금확인'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 고정 Floating Action Bar (FAB) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 flex items-center justify-around gap-2 z-40 shadow-2xl">
        <button 
          onClick={() => showToast('농장 사진 업로드 창이 열립니다.')}
          className="flex-1 flex flex-col items-center py-2 px-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all"
        >
          <span className="text-lg">📸</span>
          <span className="text-[11px] font-bold mt-0.5">과수원 소식</span>
        </button>

        <button 
          onClick={() => showToast('미입금자 전원에게 입금안내 알림톡을 재발송합니다.')}
          className="flex-1 flex flex-col items-center py-2 px-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all"
        >
          <span className="text-lg">📋</span>
          <span className="text-[11px] font-bold mt-0.5">입금 독려톡</span>
        </button>

        <button 
          onClick={() => showToast('우체국 계약소포 Direct API로 등기 송장을 일괄 출력합니다.')}
          className="flex-1 flex flex-col items-center py-2 px-1 bg-harvest-500 hover:bg-harvest-600 text-white rounded-xl shadow-md shadow-harvest-500/30 transition-all"
        >
          <span className="text-lg">🚚</span>
          <span className="text-[11px] font-black mt-0.5">우체국 송장</span>
        </button>
      </div>

      {/* 토스트 피드백 */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs px-4 py-2.5 rounded-full shadow-lg z-50 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
