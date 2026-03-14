// ??$$$ Driver Card component with behavior score visualization
const getBadgeClass = (status) => {
  switch (status) {
    case 'active': case 'on-duty': return 'badge-green';
    case 'inactive': case 'off-duty': return 'badge-gray';
    default: return 'badge-blue';
  }
};

const getScoreClass = (score) => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

const DriverCard = ({ driver, onEdit, onDelete }) => {
  const scoreClass = getScoreClass(driver.behaviorScore);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px',
          background: 'var(--gradient-blue)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: '700', color: 'white', flexShrink: 0,
        }}>
          {driver.firstName?.[0]}{driver.lastName?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', fontSize: '15px' }}>
            {driver.firstName} {driver.lastName}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{driver.email}</div>
        </div>
        <span className={`badge ${getBadgeClass(driver.status)}`}>{driver.status}</span>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          <span>Behavior Score</span>
          <span style={{ fontWeight: '700', color: scoreClass === 'high' ? 'var(--accent-green)' : scoreClass === 'medium' ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>
            {driver.behaviorScore ?? 100}/100
          </span>
        </div>
        <div className="score-bar">
          <div className={`score-fill ${scoreClass}`} style={{ width: `${driver.behaviorScore ?? 100}%` }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <div>📱 {driver.phone || 'N/A'}</div>
        <div>🪪 {driver.driverLicenseNumber || 'N/A'}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button id={`edit-driver-${driver._id}`} className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onEdit?.(driver)}>
          ✏️ Edit
        </button>
        <button id={`del-driver-${driver._id}`} className="btn btn-danger btn-sm" onClick={() => onDelete?.(driver._id)}>
          🗑️
        </button>
      </div>
    </div>
  );
};

export default DriverCard;
