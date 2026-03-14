// ??$$$ Vehicles page – fleet management with CRUD
import { useState, useEffect, useCallback } from 'react';
import http from '../api/http';
import { useToast } from '../App';

const fuelTypes = ['diesel', 'petrol', 'electric'];
const statusOptions = ['available', 'in-use', 'maintenance'];

const defaultForm = {
  plateNumber: '', make: '', model: '', year: new Date().getFullYear(),
  fuelType: 'diesel', fuelEfficiencyLitersPerKm: 0.1, capacityKg: 1000, status: 'available', currentOdometerKm: 0,
};

const statusBadge = { available: 'badge-green', 'in-use': 'badge-blue', maintenance: 'badge-yellow' };

const Vehicles = () => {
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [veh, drv] = await Promise.all([http.get('/vehicles'), http.get('/drivers')]);
      setVehicles(veh.data);
      setDrivers(drv.data);
    } catch (err) {
      addToast('error', 'Failed to load vehicles', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEditVehicle(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (v) => {
    setEditVehicle(v);
    setForm({ plateNumber: v.plateNumber, make: v.make, model: v.model, year: v.year, fuelType: v.fuelType, fuelEfficiencyLitersPerKm: v.fuelEfficiencyLitersPerKm, capacityKg: v.capacityKg, status: v.status, currentOdometerKm: v.currentOdometerKm, driverId: v.driverId?._id || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await http.delete(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v._id !== id));
      addToast('success', 'Vehicle removed');
    } catch (err) {
      addToast('error', 'Failed to delete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editVehicle) {
        const { data } = await http.put(`/vehicles/${editVehicle._id}`, form);
        setVehicles((prev) => prev.map((v) => v._id === editVehicle._id ? data : v));
        addToast('success', 'Vehicle updated');
      } else {
        const { data } = await http.post('/vehicles', form);
        setVehicles((prev) => [...prev, data]);
        addToast('success', 'Vehicle added');
      }
      setShowModal(false);
    } catch (err) {
      addToast('error', 'Failed to save', err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Fleet Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{vehicles.length} vehicles</p>
        </div>
        <button id="btn-add-vehicle" className="btn btn-primary" onClick={openCreate}>➕ Add Vehicle</button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {statusOptions.map((s) => (
          <div key={s} className="stat-card blue">
            <div className="stat-value">{vehicles.filter((v) => v.status === s).length}</div>
            <div className="stat-label" style={{ textTransform: 'capitalize' }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Plate</th>
                <th>Fuel Type</th>
                <th>Capacity</th>
                <th>Odometer</th>
                <th>Assigned Driver</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No vehicles found. Add one!</td></tr>
              ) : vehicles.map((v) => (
                <tr key={v._id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{v.make} {v.model}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{v.year}</div>
                  </td>
                  <td><code style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>{v.plateNumber}</code></td>
                  <td><span className={`badge ${v.fuelType === 'electric' ? 'badge-green' : v.fuelType === 'petrol' ? 'badge-blue' : 'badge-yellow'}`}>{v.fuelType}</span></td>
                  <td>{v.capacityKg.toLocaleString()} kg</td>
                  <td>{v.currentOdometerKm.toLocaleString()} km</td>
                  <td>{v.driverId ? `${v.driverId.firstName} ${v.driverId.lastName}` : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                  <td><span className={`badge ${statusBadge[v.status]}`}>{v.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button id={`edit-v-${v._id}`} className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>✏️</button>
                      <button id={`del-v-${v._id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editVehicle ? '✏️ Edit Vehicle' : '➕ Add Vehicle'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Make</label>
                  <input id="m-make" className="form-input" placeholder="Tata" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input id="m-model" className="form-input" placeholder="Ace" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Plate Number</label>
                  <input id="m-plate" className="form-input" placeholder="MH12AB1234" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input id="m-year" className="form-input" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fuel Type</label>
                  <select id="m-fuelType" className="form-input form-select" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
                    {fuelTypes.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select id="m-vstatus" className="form-input form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Capacity (kg)</label>
                  <input id="m-capacity" className="form-input" type="number" value={form.capacityKg} onChange={(e) => setForm({ ...form, capacityKg: parseFloat(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fuel Efficiency (L/km)</label>
                  <input id="m-efficiency" className="form-input" type="number" step="0.01" value={form.fuelEfficiencyLitersPerKm} onChange={(e) => setForm({ ...form, fuelEfficiencyLitersPerKm: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign Driver</label>
                <select id="m-driver" className="form-input form-select" value={form.driverId || ''} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                  <option value="">— None —</option>
                  {drivers.map((d) => <option key={d._id} value={d._id}>{d.firstName} {d.lastName}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button id="btn-save-vehicle" className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? '⏳ Saving...' : '💾 Save'}
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

export default Vehicles;
