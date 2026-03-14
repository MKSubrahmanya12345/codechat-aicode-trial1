// ??$$$ Alert Panel component for sidebar alerts list
const severityIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵' };
const typeLabel = {
  route_deviation: '🗺️ Route Deviation',
  fuel_anomaly: '⛽ Fuel Anomaly',
  timestamp_mismatch: '⏱️ Timestamp Mismatch',
  geofence_breach: '📍 Geofence Breach',
};

const AlertPanel = ({ alerts, onAcknowledge }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">✅</div>
        <p>No active alerts</p>
      </div>
    );
  }

  return (
    <div>
      {alerts.map((alert) => (
        <div key={alert._id} className={`alert-item ${alert.severity}`}>
          <div className={`alert-dot ${alert.severity}`} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {typeLabel[alert.type] || alert.type}
              </div>
              <span className={`badge badge-${alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'orange' : alert.severity === 'medium' ? 'yellow' : 'blue'}`}>
                {alert.severity}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {alert.message}
            </div>
            {alert.driverId && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Driver: {alert.driverId.firstName} {alert.driverId.lastName}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {new Date(alert.timestamp).toLocaleString()}
              </div>
              {alert.status === 'new' && (
                <button
                  id={`ack-alert-${alert._id}`}
                  className="btn btn-ghost btn-sm"
                  onClick={() => onAcknowledge?.(alert._id)}
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertPanel;
