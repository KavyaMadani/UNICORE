'use client';
import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {/* Topbar */}
        <Topbar title={title} subtitle={subtitle} actions={actions} />

        {/* Page content scrollable */}
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {/* Background glows */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
            <div className="blob" style={{ width: 600, height: 600, background: 'rgba(99,102,241,0.04)', top: -100, right: -100, filter: 'blur(120px)' }} />
            <div className="blob" style={{ width: 400, height: 400, background: 'rgba(59,130,246,0.04)', bottom: 0, left: '30%', filter: 'blur(100px)' }} />
          </div>
          {/* Content with generous padding */}
          <div style={{ position: 'relative', zIndex: 10, padding: '40px 44px', maxWidth: 1440, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
