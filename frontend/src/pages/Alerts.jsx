// ??$$$ Alerts page – view, filter, and manage all alerts
import { useState, useEffect, useCallback } from 'react';
import AlertPanel from '../components/AlertPanel';
import http from '../api/http';
import useSocket from '../hooks/useSocket';
import { useToast } from '../App';

const typeOptions = ['all', 'route_deviation', 'fuel_anomaly', 'timestamp_mismatch', 'geofence_breach'];
const severityOptions = ['all', 'critical', 'high', 'medium', 'low'];
const statusOptions = ['all', 'new', 'acknowledged', 'resolved', 'false_positive'];

const severityBadge = { critical: 'badge-red', high: 'badge-orange', medium: 'badge-yellow', low: 'badge-blue' };
const statusBadge = { new: 'badge-red', acknowledged: 'badge-yellow', resolved: 'badge-green', false_positive: 'badge-gray' };

const typeLabel = {
  route_deviation: '🗺️ Route Deviation',
  fuel_anomaly: '⛽ Fuel Anomaly',
  timestamp_mismatch: '⏱️ Timestamp Mismatch',
  geofence_breach: '📍 Geofence Breach',
};

const Alerts = () => {
  const { addToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('table'); // 'table' | 'panel'

  const fetchAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const { data } = await http.get(`/alerts?${params}`);
      setAlerts(data);
    } catch (err) {
      addToast('error', 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, severityFilter, statusFilter]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // Real-time new alerts
  useSocket({
    anomalyDetected: (data) => {
      setAlerts((prev) => [data, ...prev]);
      addToast('warning', '🚨 New Alert', data.message);
    },
  });

  const handleStatusChange = async (id, status) => {
    try {
      await http.put(`/alerts/${id}/status`, { status });
      setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, status } : a));
      addToast('success', `Alert marked as ${status}`);
    } catch {
      addToast('error', 'Failed to update alert');
    }
  };

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const newCount = alerts.filter((a) => a.status === 'new').length;

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Alerts & Anomalies</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {alerts.length} total · <span style={{ color: 'var(--accent-red)' }}>{criticalCount} critical</span> · {newCount} unacknowledged
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button id="view-table" className={`btn ${view === 'table' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setView('table')}>📋 Table</button>
          <button id="view-panel" className={`btn ${view === 'panel' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setView('panel')}>📌 Panel</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card red"><div className="stat-value">{alerts.filter(a => a.severity === 'critical').length}</div><div className="stat-label">Critical</div></div>
        <div className="stat-card yellow"><div className="stat-value">{alerts.filter(a => a.severity === 'high').length}</div><div className="stat-label">High</div></div>
        <div className="stat-card blue"><div className="stat-value">{alerts.filter(a => a.type === 'route_deviation').length}</div><div className="stat-label">Route Deviations</div></div>
        <div className="stat-card purple"><div className="stat-value">{alerts.filter(a => a.type === 'fuel_anomaly').length}</div><div className="stat-label">Fuel Anomalies</div></div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select id="filter-type" className="form-input form-select" style={{ width: 'auto', minWidth: '180px' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {typeOptions.map((t) => <option key={t} value={t}>{t === 'all' ? '🔍 All Types' : typeLabel[t]}</option>)}
        </select>
        <select id="filter-severity" className="form-input form-select" style={{ width: 'auto', minWidth: '160px' }} value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          {severityOptions.map((s) => <option key={s} value={s}>{s === 'all' ? '⚡ All Severities' : s}</option>)}
        </select>
        <select id="filter-status" className="form-input form-select" style={{ width: 'auto', minWidth: '160px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {statusOptions.map((s) => <option key={s} value={s}>{s === 'all' ? '📌 All Statuses' : s}</option>)}
        </select>
      </div>

      {view === 'table' ? (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Message</th>
                  <th>Driver</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>✅ No alerts matching filters</td></tr>
                  : alerts.map((a) => (
                    <tr key={a._id || a.alertId}>
                      <td><span style={{ fontSize: '12px', fontWeight: '600' }}>{typeLabel[a.type] || a.type}</span></td>
                      <td><span className={`badge ${severityBadge[a.severity] || 'badge-gray'}`}>{a.severity}</span></td>
                      <td style={{ maxWidth: '250px', fontSize: '13px' }}>{a.message}</td>
                      <td style={{ fontSize: '13px' }}>{a.driverId ? `${a.driverId.firstName} ${a.driverId.lastName}` : '—'}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(a.timestamp).toLocaleString()}</td>
                      <td><span className={`badge ${statusBadge[a.status] || 'badge-gray'}`}>{a.status}</span></td>
                      <td>
                        {a._id && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {a.status === 'new' && (
                              <button id={`ack-${a._id}`} className="btn btn-warning btn-sm" onClick={() => handleStatusChange(a._id, 'acknowledged')}>✓ Ack</button>
                            )}
                            {a.status !== 'resolved' && (
                              <button id={`res-${a._id}`} className="btn btn-success btn-sm" onClick={() => handleStatusChange(a._id, 'resolved')}>✅</button>
                            )}
                            <button id={`fp-${a._id}`} className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(a._id, 'false_positive')}>FP</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <AlertPanel alerts={alerts} onAcknowledge={(id) => handleStatusChange(id, 'acknowledged')} />
      )}
    </div>
  );
};

export default Alerts;
