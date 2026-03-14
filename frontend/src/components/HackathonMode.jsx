// ??$$$ HackathonMode - Complete judge experience component
import { useState, useEffect, createContext, useContext } from 'react';
import http from '../api/http';
import '../styles/hackathon.css';

// ??$$$ Context so any component can check if hackathon mode is on
export const HackathonContext = createContext({ isHackathon: false });
export const useHackathon = () => useContext(HackathonContext);

// ─────────────────────────────────────────────────────────────────────────────
// TOUR STEPS – what the judges will see, step by step
// ─────────────────────────────────────────────────────────────────────────────
const TOUR_STEPS = [
  {
    id: 'dashboard',
    title: '📊 Command Center Dashboard',
    desc: 'Real-time overview of your entire logistics operation. Live driver count, active routes, anomaly alerts, and flagged invoices — all updating via WebSockets in real-time.',
    target: '.topbar',
    position: 'bottom',
  },
  {
    id: 'map',
    title: '🗺️ Live Fleet Map — AI Geofencing',
    desc: 'Every truck\'s GPS position streams in real-time via Socket.io. The AI engine watches for route deviations, unauthorized stops, and geofence breaches continuously.',
    target: '.map-container',
    position: 'right',
  },
  {
    id: 'drivers',
    title: '🚗 Behavior Scoring Engine',
    desc: 'Every driver has a dynamic Behavior Score (0–100) that auto-decrements when anomalies are detected — route deviations cost 5 points, fraudulent invoices cost 10. Gamified accountability.',
    target: '.sidebar-nav',
    position: 'right',
  },
  {
    id: 'anomaly',
    title: '⛽ AI Fuel Anomaly Detection',
    desc: 'When Raju Kumar submitted 120L for a 346km route — the system expected ~31L. The Haversine-formula engine flagged it (288% over threshold), deducted behavior score, and fired a real-time alert.',
    target: '.topbar',
    position: 'bottom',
  },
  {
    id: 'realtime',
    title: '⚡ Real-Time Alerts via Socket.io',
    desc: 'Anomalies don\'t wait for batch processing. The moment a GPS deviation or suspicious invoice is detected, an alert fires directly to the dispatcher dashboard — < 200ms latency.',
    target: '.topbar-right',
    position: 'bottom-left',
  },
  {
    id: 'invoices',
    title: '📄 Smart Invoice Management',
    desc: 'Invoices are analyzed against actual telemetry data. Clean invoices ✅ pass automatically. Flagged ones 🚨 are isolated for human review with a detailed anomaly breakdown.',
    target: '.topbar',
    position: 'bottom',
  },
  {
    id: 'impact',
    title: '💰 Business Impact',
    desc: 'Industry data: 15–23% of logistics costs stem from route manipulation and fuel fraud. For a mid-size fleet of 200 trucks spending ₹50L/month on fuel — LogiGuard recovers ₹7–11L every month.',
    target: '.stats-grid',
    position: 'bottom',
  },
  {
    id: 'stack',
    title: '🏗️ Full MERN Tech Stack',
    desc: 'React + Vite frontend · Node.js + Express API · MongoDB Atlas · Socket.io for real-time · Leaflet for geospatial · JWT auth · Haversine-formula anomaly engine. All running locally, fully open-source.',
    target: '.sidebar-logo',
    position: 'right',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME MODAL
// ─────────────────────────────────────────────────────────────────────────────
const WelcomeModal = ({ onClose, onStartTour }) => (
  <div className="hk-welcome-overlay">
    <div className="hk-welcome-modal">
      {/* Header */}
      <div className="hk-welcome-header">
        <div className="hk-welcome-badge">🏆 Hackathon Presentation Mode</div>
        <div className="hk-welcome-title">
          Proactive AI<br /><span>Logistics Guardian</span>
        </div>
        <p className="hk-welcome-desc">
          An autonomous platform that <strong style={{ color: '#60a5fa' }}>detects, predicts, and prevents</strong> invoice fraud and route manipulation in real-time — using geospatial intelligence and behavioral analytics.
        </p>
      </div>

      {/* Body */}
      <div className="hk-welcome-body">

        {/* Problem / Solution */}
        <div className="hk-ps-grid">
          <div className="hk-ps-card problem">
            <div className="hk-ps-label">❌ The Problem</div>
            <div className="hk-ps-items">
              {[
                'Drivers choose longer routes to inflate fuel claims',
                'Falsified delivery timestamps hide idle time',
                'Invoice fraud costs fleets 15–23% of logistics spend',
                'Manual auditing is slow, expensive & error-prone',
              ].map((t, i) => (
                <div key={i} className="hk-ps-item">
                  <span style={{ color: 'var(--accent-red)', flexShrink: 0 }}>✗</span> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="hk-ps-card solution">
            <div className="hk-ps-label">✅ Our Solution</div>
            <div className="hk-ps-items">
              {[
                'Real-time GPS telemetry with route deviation scoring',
                'AI fuel anomaly detection using Haversine formula',
                'Behavioral scoring engine that auto-penalizes fraud',
                'Dispatcher dashboard with < 200ms anomaly alerts',
              ].map((t, i) => (
                <div key={i} className="hk-ps-item">
                  <span style={{ color: 'var(--accent-green)', flexShrink: 0 }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
          💰 Projected Impact (200-truck fleet)
        </div>
        <div className="hk-impact-grid">
          {[
            { value: '₹11L', label: 'Recovered monthly\nfrom fuel fraud' },
            { value: '23%', label: 'Reduction in\nlogistics costs' },
            { value: '<200ms', label: 'Alert latency\nvia WebSocket' },
            { value: '100%', label: 'Route coverage\nvia GPS telemetry' },
          ].map((m, i) => (
            <div key={i} className="hk-impact-card">
              <div className="hk-impact-value">{m.value}</div>
              <div className="hk-impact-label">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
          🏗️ Tech Stack
        </div>
        <div className="hk-tech-grid">
          {[
            { icon: '⚛️', label: 'React + Vite' },
            { icon: '🟩', label: 'Node.js + Express' },
            { icon: '🍃', label: 'MongoDB Atlas' },
            { icon: '⚡', label: 'Socket.io' },
            { icon: '🗺️', label: 'Leaflet Maps' },
            { icon: '📊', label: 'Recharts' },
            { icon: '🔐', label: 'JWT Auth' },
            { icon: '📐', label: 'Haversine Engine' },
          ].map((t, i) => (
            <div key={i} className="hk-tech-chip">
              <span>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            id="hk-start-tour"
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
            onClick={onStartTour}
          >
            🗺️ Start Guided Tour
          </button>
          <button
            id="hk-skip-welcome"
            className="btn btn-ghost"
            onClick={onClose}
          >
            Skip & Explore
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// GUIDED TOUR
// ─────────────────────────────────────────────────────────────────────────────
const GuidedTour = ({ onEnd }) => {
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step];

  const next = () => step < TOUR_STEPS.length - 1 ? setStep(step + 1) : onEnd();
  const prev = () => step > 0 && setStep(step - 1);

  return (
    <div className="hk-tour-overlay">
      {/* Tour tip — always centered at bottom of screen for reliability */}
      <div
        className="hk-tour-tip"
        style={{ bottom: '100px', left: '50%', transform: 'translateX(-50%)' }}
      >
        <div className="hk-tour-step-num">Step {step + 1} of {TOUR_STEPS.length}</div>
        <div className="hk-tour-title" style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          {current.title}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {current.desc}
        </div>
        <div className="hk-tour-nav">
          <div className="hk-tour-dots">
            {TOUR_STEPS.map((_, i) => (
              <div key={i} className={`hk-tour-dot ${i === step ? 'active' : ''}`} onClick={() => setStep(i)} style={{ cursor: 'pointer' }} />
            ))}
          </div>
          <div className="hk-tour-btns">
            {step > 0 && (
              <button id="tour-prev" className="btn btn-ghost btn-sm" onClick={prev}>← Back</button>
            )}
            <button
              id="tour-next"
              className="btn btn-sm"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: 'white' }}
              onClick={next}
            >
              {step === TOUR_STEPS.length - 1 ? '🎉 Finish Tour' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HACKATHON MODE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const HackathonMode = ({ isHackathon, onToggle }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  // Show welcome modal when first entering hackathon mode
  useEffect(() => {
    if (isHackathon) setShowWelcome(true);
  }, [isHackathon]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg('');
    try {
      await http.post('/demo/seed');
      setSeedMsg('✅ Demo data loaded! Refresh to see live data.');
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setSeedMsg('❌ Seed failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setSeeding(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    setSeedMsg('');
    try {
      await http.post('/demo/simulate');
      setSeedMsg('🚗 Live telemetry streaming! Watch the map & alerts.');
    } catch (e) {
      setSeedMsg('❌ Simulation failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setTimeout(() => setSimulating(false), 8000);
    }
  };

  return (
    <>
      {/* ─── Mode Toggle Button (always visible) ─── */}
      <div className="mode-toggle">
        <button
          id="mode-toggle-btn"
          className={`mode-toggle-btn ${isHackathon ? 'normal' : 'hackathon'}`}
          onClick={onToggle}
        >
          {isHackathon ? '👨‍💻 Exit Judge Mode' : '🏆 Judge Mode'}
        </button>
      </div>

      {/* ─── Hackathon Banner ─── */}
      {isHackathon && (
        <div className="hackathon-banner">
          <div className="hackathon-banner-left">
            <span className="hackathon-trophy">🏆</span>
            <div>
              <div className="hackathon-title">LogiGuard — Proactive AI Logistics Guardian</div>
              <div className="hackathon-subtitle">Autonomous fraud detection · Real-time telemetry · Behavioral scoring engine</div>
            </div>
          </div>
          <div className="hackathon-banner-actions">
            <button id="hk-welcome-btn" className="hk-btn hk-btn-tour" onClick={() => setShowWelcome(true)}>
              📋 Overview
            </button>
            <button id="hk-tour-btn" className="hk-btn hk-btn-tour" onClick={() => setShowTour(true)}>
              🗺️ Guided Tour
            </button>
            <button id="hk-seed-btn" className="hk-btn hk-btn-seed" onClick={handleSeed} disabled={seeding}>
              {seeding ? '⏳ Loading...' : '🌱 Load Demo Data'}
            </button>
            <button id="hk-sim-btn" className="hk-btn hk-btn-simulate" onClick={handleSimulate} disabled={simulating}>
              {simulating ? '🔴 Live...' : '🚨 Simulate Fraud'}
            </button>
          </div>
        </div>
      )}

      {/* ─── Seed Result Indicator ─── */}
      {seedMsg && isHackathon && (
        <div className="hk-seed-indicator">
          <span>{seedMsg}</span>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setSeedMsg('')}>✕</button>
        </div>
      )}

      {/* ─── Welcome Modal ─── */}
      {showWelcome && isHackathon && (
        <WelcomeModal
          onClose={() => setShowWelcome(false)}
          onStartTour={() => { setShowWelcome(false); setShowTour(true); }}
        />
      )}

      {/* ─── Guided Tour ─── */}
      {showTour && isHackathon && (
        <GuidedTour onEnd={() => setShowTour(false)} />
      )}
    </>
  );
};

export default HackathonMode;
