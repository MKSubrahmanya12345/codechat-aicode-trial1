// ??$$$ Drivers page – full CRUD with behavior scores
import { useState, useEffect, useCallback } from 'react';
import DriverCard from '../components/DriverCard';
import http from '../api/http';
import { useToast } from '../App';

const statusOptions = ['active', 'inactive', 'on-duty', 'off-duty'];

const defaultForm = { firstName: '', lastName: '', email: '', password: '', phone: '', driverLicenseNumber: '', status: 'active' };

const Drivers = () => {
  const { addToast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchDrivers = useCallback(async () => {
    try {
      const { data } = await http.get('/drivers');
      setDrivers(data);
    } catch (err) {
      addToast('error', 'Failed to load drivers', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const openCreate = () => { setEditDriver(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (driver) => {
    setEditDriver(driver);
    setForm({ firstName: driver.firstName, lastName: driver.lastName, email: driver.email, phone: driver.phone || '', driverLicenseNumber: driver.driverLicenseNumber || '', status: driver.status, password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this driver?')) return;
    try {
      await http.delete(`/drivers/${id}`);
      setDrivers((prev) => prev.filter((d) => d._id !== id));
      addToast('success', 'Driver deleted');
    } catch (err) {
      addToast('error', 'Failed to delete', err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editDriver) {
        const { data } = await http.put(`/drivers/${editDriver._id}`, form);
        setDrivers((prev) => prev.map((d) => d._id === editDriver._id ? { ...d, ...data } : d));
        addToast('success', 'Driver updated');
      } else {
        const { data } = await http.post('/auth/register', form);
        addToast('success', 'Driver registered', `ID: ${data.userId}`);
        await fetchDrivers();
      }
      setShowModal(false);
    } catch (err) {
      addToast('error', 'Failed to save', err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = drivers.filter((d) =>
    `${d.firstName} ${d.lastName} ${d.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Driver Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{drivers.length} drivers registered</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            id="driver-search"
            className="form-input"
            placeholder="🔍 Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '220px' }}
          />
          <button id="btn-add-driver" className="btn btn-primary" onClick={openCreate}>
            ➕ Add Driver
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {statusOptions.map((s) => (
          <div key={s} className="stat-card blue">
            <div className="stat-value">{drivers.filter((d) => d.status === s).length}</div>
            <div className="stat-label" style={{ textTransform: 'capitalize' }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Driver Cards Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="icon">🚗</div><p>No drivers found</p></div>
      ) : (
        <div className="grid-auto">
          {filtered.map((d) => (
            <DriverCard key={d._id} driver={d} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editDriver ? '✏️ Edit Driver' : '➕ Add New Driver'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input id="m-firstName" className="form-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input id="m-lastName" className="form-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input id="m-email" className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              {!editDriver && (
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input id="m-password" className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input id="m-phone" className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">License Number</label>
                  <input id="m-license" className="form-input" value={form.driverLicenseNumber} onChange={(e) => setForm({ ...form, driverLicenseNumber: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select id="m-status" className="form-input form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button id="btn-save-driver" className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? '⏳ Saving...' : '💾 Save Driver'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
