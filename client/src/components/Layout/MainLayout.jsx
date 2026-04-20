import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout({ user, trustScore, alertCount, isConnected, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} alertCount={alertCount} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header trustScore={trustScore} isConnected={isConnected} alertCount={alertCount || 0} onLogout={onLogout} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="max-w-7xl mx-auto pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
