// ??$$$ Sidebar navigation component
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard', exact: true },
  { to: '/drivers', icon: '🚗', label: 'Drivers' },
  { to: '/vehicles', icon: '🚛', label: 'Vehicles' },
  { to: '/routes', icon: '🗺️', label: 'Routes' },
  { to: '/alerts', icon: '🚨', label: 'Alerts' },
  { to: '/invoices', icon: '📄', label: 'Invoices' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🛡️</div>
        <div>
          <h1>LogiGuard</h1>
          <span>AI Logistics Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div style={{ marginBottom: '12px', padding: '10px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {user.firstName || 'Admin'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Administrator</div>
          </div>
        )}
        <button id="logout-btn" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
