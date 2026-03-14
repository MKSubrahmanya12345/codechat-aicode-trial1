// ??$$$ Dashboard – main overview with stats, map, and real-time alerts
import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import MapView from '../components/MapView';
import AlertPanel from '../components/AlertPanel';
import http from '../api/http';
import useSocket from '../hooks/useSocket';
import { useToast } from '../App';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6'];

const Dashboard = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState({ drivers: 0, vehicles: 0, routes: 0, alerts: 0, flaggedInvoices: 0 });
  const [alerts, setAlerts] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [liveLocations, setLiveLocations] = useState({});
  const [alertsByType, setAlertsByType] = useState([]);
  const [scoreData, setScoreData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [drv, veh, rts, alts, inv] = await Promise.all([
        http.get('/drivers'),
        http.get('/vehicles'),
        http.get('/routes'),
        http.get('/alerts?status=new'),
        http.get('/invoices'),
      ]);

      setDrivers(drv.data);
      setRoutes(rts.data);
      setAlerts(alts.data.slice(0, 5));

      const flagged = inv.data.filter((i) => i.anomalyFlag).length;

      setStats({
        drivers: drv.data.length,
        vehicles: veh.data.length,
        routes: rts.data.length,
        alerts: alts.data.length,
        flaggedInvoices: flagged,
      });

      // Chart data – alerts by type
      const typeCounts = {};
      alts.data.forEach((a) => {
        const label = a.type.replace(/_/g, ' ');
        typeCounts[label] = (typeCounts[label] || 0) + 1;
      });
      setAlertsByType(Object.entries(typeCounts).map(([name, value]) => ({ name, value })));

      // Driver behavior scores
      setScoreData(drv.data.slice(0, 8).map((d) => ({
        name: `${d.firstName?.[0]}. ${d.lastName}`,
        score: d.behaviorScore ?? 100,
      })));
    } catch (err) {
      addToast('error', 'Failed to load dashboard', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ??$$$ Real-time socket listeners
  useSocket({
    driverLocationStream: (data) => {
      setLiveLocations((prev) => ({ ...prev, [data.driverId]: data }));
    },
    anomalyDetected: (data) => {
      addToast('warning', '🚨 Anomaly Detected', data.message);
      setStats((prev) => ({ ...prev, alerts: prev.alerts + 1 }));
      setAlerts((prev) => [data, ...prev].slice(0, 5));
    },
  });

  const handleAcknowledge = async (id) => {
    try {
      await http.put(`/alerts/${id}/status`, { status: 'acknowledged' });
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      setStats((prev) => ({ ...prev, alerts: Math.max(0, prev.alerts - 1) }));
      addToast('success', 'Alert Acknowledged');
    } catch {
      addToast('error', 'Failed to acknowledge alert');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue">🚗</div>
          <div className="stat-value">{stats.drivers}</div>
          <div className="stat-label">Active Drivers</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">🚛</div>
          <div className="stat-value">{stats.vehicles}</div>
          <div className="stat-label">Fleet Vehicles</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple">🗺️</div>
          <div className="stat-value">{stats.routes}</div>
          <div className="stat-label">Active Routes</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red">🚨</div>
          <div className="stat-value">{stats.alerts}</div>
          <div className="stat-label">New Alerts</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon yellow">⚠️</div>
          <div className="stat-value">{stats.flaggedInvoices}</div>
          <div className="stat-label">Flagged Invoices</div>
        </div>
      </div>

      {/* Map + Alert Panel */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700' }}>🗺️ Live Fleet Map</h2>
            <div className="live-indicator">
              <div className="live-dot" />
              Real-time
            </div>
          </div>
          <MapView drivers={drivers} routes={routes} liveLocations={liveLocations} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700' }}>🚨 Active Alerts</h2>
            <span className="badge badge-red">{stats.alerts} new</span>
          </div>
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <AlertPanel alerts={alerts} onAcknowledge={handleAcknowledge} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Driver Behavior Scores</span>
          </div>
          {scoreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9' }} />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="icon">📊</div><p>No driver data</p></div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">🚨 Alert Distribution</span>
          </div>
          {alertsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={alertsByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {alertsByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="icon">✅</div><p>No alerts to display</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
