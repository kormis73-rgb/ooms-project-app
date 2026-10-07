import React, { useState } from 'react';
import CustomerOrderForm from './components/CustomerOrderForm';
import MerchantDashboard from './components/MerchantDashboard';
import StagingApprovalDashboard from './components/StagingApprovalDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('CUSTOMER'); // CUSTOMER, MERCHANT, ADMIN

  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased text-slate-800">
      {/* 최상단 글로벌 뷰 스위처 (개발 및 시연용 네비게이션) */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍏</span>
            <div>
              <span className="font-black text-sm tracking-wide text-farm-500">OOMS</span>
              <span className="text-xs text-slate-400 ml-1.5 font-medium hidden sm:inline">
                농산물 직거래 비정형 주문 관리 시스템
              </span>
            </div>
          </div>

          {/* 역할별 화면 전환 탭 */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setCurrentView('CUSTOMER')}
              className={`px-3 py-1.5 rounded-lg transition-all ${currentView === 'CUSTOMER' ? 'bg-farm-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              1. 고객 주문 폼 (PWA)
            </button>
            <button
              onClick={() => setCurrentView('MERCHANT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${currentView === 'MERCHANT' ? 'bg-farm-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              2. 농가 한손 포털
            </button>
            <button
              onClick={() => setCurrentView('ADMIN')}
              className={`px-3 py-1.5 rounded-lg transition-all ${currentView === 'ADMIN' ? 'bg-farm-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              3. 관리자 스테이징 센터
            </button>
          </div>
        </div>
      </header>

      {/* 메인 뷰 렌더링 */}
      <main className="py-4">
        {currentView === 'CUSTOMER' && <CustomerOrderForm />}
        {currentView === 'MERCHANT' && <MerchantDashboard />}
        {currentView === 'ADMIN' && <StagingApprovalDashboard />}
      </main>
    </div>
  );
}
