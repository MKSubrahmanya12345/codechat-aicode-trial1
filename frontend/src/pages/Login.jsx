// ??$$$ Login / Register page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../api/http';
import { useAuth } from '../App';

const Login = () => {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', driverLicenseNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await http.post(endpoint, form);
      login(data.token, { firstName: data.firstName, userId: data.userId });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <div className="icon">🛡️</div>
          <h1>LogiGuard</h1>
          <p>Proactive AI Logistics Guardian</p>
        </div>

        <div className="login-tabs">
          <button id="tab-login" className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
            Sign In
          </button>
          <button id="tab-register" className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input id="inp-firstName" className="form-input" name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input id="inp-lastName" className="form-input" name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input id="inp-phone" className="form-input" name="phone" placeholder="+91..." value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input id="inp-license" className="form-input" name="driverLicenseNumber" placeholder="DL-XXXXXXXXXX" value={form.driverLicenseNumber} onChange={handleChange} />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="inp-email" className="form-input" name="email" type="email" placeholder="admin@logiguard.io" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="inp-password" className="form-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--accent-red)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '16px' }}>
              ❌ {error}
            </div>
          )}

          <button id="btn-submit-login" className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? '⏳ Processing...' : tab === 'login' ? '🚀 Sign In' : '✨ Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--accent-blue)' }}>Demo:</strong> Register with any email/password to get started.
        </div>
      </div>
    </div>
  );
};

export default Login;
