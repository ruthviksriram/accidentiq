import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Sidebar (Desktop fixed & Mobile drawer) */}
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: 'var(--sidebar-collapsed-width)'
        }}
        className="app-main-content"
      >
        <Header onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />
        <main style={{ flex: 1, padding: '1.75rem 2rem', overflowX: 'hidden' }} className="app-main-padding">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .app-main-content {
            margin-left: 0 !important;
          }
          .app-main-padding {
            padding: 1.25rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};
