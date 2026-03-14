// ??$$$ Topbar component with live indicator
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';

const pageTitles = {
  '/': '📊 Dashboard Overview',
  '/drivers': '🚗 Driver Management',
  '/vehicles': '🚛 Fleet Management',
  '/routes': '🗺️ Route Management',
  '/alerts': '🚨 Alerts & Anomalies',
  '/invoices': '📄 Invoice Management',
};

const Topbar = () => {
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  useSocket({
    connect: () => setConnected(true),
    disconnect: () => setConnected(false),
    anomalyDetected: () => setAlertCount((c) => c + 1),
  });

  return (
    <header className="topbar">
      <div className="topbar-title">
        {pageTitles[location.pathname] || 'LogiGuard'}
      </div>
      <div className="topbar-right">
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{now}</span>
        <div className="live-indicator">
          <div className="live-dot" style={{ background: connected ? 'var(--accent-green)' : 'var(--accent-red)' }} />
          {connected ? 'Live' : 'Offline'}
        </div>
        {alertCount > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--accent-red)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
            🚨 {alertCount} new
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
