// ??$$$ Routes page – create, view, and assign routes to drivers; interactive map
import { useState, useEffect, useCallback } from 'react';
import RouteMap from '../components/RouteMap';
import http from '../api/http';
import { useToast } from '../App';

const defaultRouteForm = {
  name: '', origin: { lat: '', lon: '', address: '' }, destination: { lat: '', lon: '', address: '' },
  distanceKm: '', durationMinutes: '', estimatedFuelLiters: '',
};

const defaultAssignForm = { driverId: '', vehicleId: '', routeId: '', plannedStartTime: '', plannedEndTime: '' };

const Routes_ = () => {
  const { addToast } = useToast();
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeForm, setRouteForm] = useState(defaultRouteForm);
  const [assignForm, setAssignForm] = useState(defaultAssignForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('routes'); // 'routes' | 'assignments'

  const fetchAll = useCallback(async () => {
    try {
      const [rts, drv, veh, asn] = await Promise.all([
        http.get('/routes'),
        http.get('/drivers'),
        http.get('/vehicles'),
        http.get('/routes/assignments'),
      ]);
      setRoutes(rts.data);
      setDrivers(drv.data);
      setVehicles(veh.data);
      setAssignments(asn.data);
    } catch (err) {
      addToast('error', 'Failed to load routes', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: routeForm.name,
        origin: { lat: parseFloat(routeForm.origin.lat), lon: parseFloat(routeForm.origin.lon), address: routeForm.origin.address },
        destination: { lat: parseFloat(routeForm.destination.lat), lon: parseFloat(routeForm.destination.lon), address: routeForm.destination.address },
        distanceKm: routeForm.distanceKm ? parseFloat(routeForm.distanceKm) : undefined,
        durationMinutes: routeForm.durationMinutes ? parseInt(routeForm.durationMinutes) : undefined,
        estimatedFuelLiters: routeForm.estimatedFuelLiters ? parseFloat(routeForm.estimatedFuelLiters) : undefined,
      };
      const { data } = await http.post('/routes', payload);
      setRoutes((prev) => [data, ...prev]);
      addToast('success', 'Route created', data.name);
      setShowCreateModal(false);
      setRouteForm(defaultRouteForm);
    } catch (err) {
      addToast('error', 'Failed to create route', err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await http.post('/routes/assign', assignForm);
      setAssignments((prev) => [data, ...prev]);
      addToast('success', 'Route assigned successfully!');
      setShowAssignModal(false);
      setAssignForm(defaultAssignForm);
    } catch (err) {
      addToast('error', 'Failed to assign route', err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const statusColor = { assigned: 'badge-blue', started: 'badge-yellow', in_progress: 'badge-orange', completed: 'badge-green' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Route Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{routes.length} routes · {assignments.length} assignments</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button id="btn-assign-route" className="btn btn-success" onClick={() => setShowAssignModal(true)}>🚗 Assign Route</button>
          <button id="btn-create-route" className="btn btn-primary" onClick={() => setShowCreateModal(true)}>➕ Create Route</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="login-tabs" style={{ maxWidth: '300px', marginBottom: '20px' }}>
        <button id="tab-routes" className={`login-tab ${activeTab === 'routes' ? 'active' : ''}`} onClick={() => setActiveTab('routes')}>Routes</button>
        <button id="tab-assignments" className={`login-tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>Assignments</button>
      </div>

      {activeTab === 'routes' && (
        <div className="grid-2">
          {/* Route List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {routes.length === 0 && <div className="empty-state"><div className="icon">🗺️</div><p>No routes yet</p></div>}
            {routes.map((r) => (
              <div
                key={r._id}
                className="card"
                style={{ cursor: 'pointer', borderColor: selectedRoute?._id === r._id ? 'var(--accent-blue)' : undefined }}
                onClick={() => setSelectedRoute(r)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{r.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      📍 {r.origin.address || `${r.origin.lat}, ${r.origin.lon}`} → {r.destination.address || `${r.destination.lat}, ${r.destination.lon}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
                  <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-blue)' }}>{r.distanceKm?.toFixed(1)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>km</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-green)' }}>{r.durationMinutes}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>min</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-yellow)' }}>{r.estimatedFuelLiters?.toFixed(1)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>liters</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map Preview */}
          <div>
            {selectedRoute
              ? <RouteMap route={selectedRoute} />
              : (
                <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '40px' }}>🗺️</div>
                  <div style={{ color: 'var(--text-muted)' }}>Select a route to preview on map</div>
                </div>
              )
            }
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Route</th>
                  <th>Planned Start</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0
                  ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No assignments yet</td></tr>
                  : assignments.map((a) => (
                    <tr key={a._id}>
                      <td>{a.driverId ? `${a.driverId.firstName} ${a.driverId.lastName}` : 'N/A'}</td>
                      <td>{a.vehicleId ? `${a.vehicleId.make} ${a.vehicleId.plateNumber}` : 'N/A'}</td>
                      <td>{a.routeId?.name || 'N/A'}</td>
                      <td style={{ fontSize: '12px' }}>{a.plannedStartTime ? new Date(a.plannedStartTime).toLocaleString() : '—'}</td>
                      <td><span className={`badge ${statusColor[a.status] || 'badge-gray'}`}>{a.status}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Route Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <span className="modal-title">➕ Create Route</span>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateRoute}>
              <div className="form-group">
                <label className="form-label">Route Name</label>
                <input id="r-name" className="form-input" placeholder="Delhi → Mumbai Corridor" value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} required />
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-green)', marginBottom: '10px' }}>🟢 Origin</div>
                <div className="form-row">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Latitude</label>
                    <input id="r-olat" className="form-input" type="number" step="any" placeholder="28.6139" value={routeForm.origin.lat} onChange={(e) => setRouteForm({ ...routeForm, origin: { ...routeForm.origin, lat: e.target.value } })} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Longitude</label>
                    <input id="r-olon" className="form-input" type="number" step="any" placeholder="77.2090" value={routeForm.origin.lon} onChange={(e) => setRouteForm({ ...routeForm, origin: { ...routeForm.origin, lon: e.target.value } })} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '10px', marginBottom: 0 }}>
                  <label className="form-label">Address (optional)</label>
                  <input id="r-oaddr" className="form-input" placeholder="Connaught Place, New Delhi" value={routeForm.origin.address} onChange={(e) => setRouteForm({ ...routeForm, origin: { ...routeForm.origin, address: e.target.value } })} />
                </div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-red)', marginBottom: '10px' }}>🔴 Destination</div>
                <div className="form-row">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Latitude</label>
                    <input id="r-dlat" className="form-input" type="number" step="any" placeholder="19.0760" value={routeForm.destination.lat} onChange={(e) => setRouteForm({ ...routeForm, destination: { ...routeForm.destination, lat: e.target.value } })} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Longitude</label>
                    <input id="r-dlon" className="form-input" type="number" step="any" placeholder="72.8777" value={routeForm.destination.lon} onChange={(e) => setRouteForm({ ...routeForm, destination: { ...routeForm.destination, lon: e.target.value } })} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '10px', marginBottom: 0 }}>
                  <label className="form-label">Address (optional)</label>
                  <input id="r-daddr" className="form-input" placeholder="Bandra Kurla Complex, Mumbai" value={routeForm.destination.address} onChange={(e) => setRouteForm({ ...routeForm, destination: { ...routeForm.destination, address: e.target.value } })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Distance (km) <span style={{ color: 'var(--text-muted)' }}>auto-calc if blank</span></label>
                  <input id="r-dist" className="form-input" type="number" step="any" placeholder="Auto" value={routeForm.distanceKm} onChange={(e) => setRouteForm({ ...routeForm, distanceKm: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (min)</label>
                  <input id="r-dur" className="form-input" type="number" placeholder="Auto" value={routeForm.durationMinutes} onChange={(e) => setRouteForm({ ...routeForm, durationMinutes: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button id="btn-save-route" className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? '⏳ Creating...' : '💾 Create Route'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Route Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAssignModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">🚗 Assign Route</span>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="form-group">
                <label className="form-label">Route</label>
                <select id="a-route" className="form-input form-select" value={assignForm.routeId} onChange={(e) => setAssignForm({ ...assignForm, routeId: e.target.value })} required>
                  <option value="">— Select Route —</option>
                  {routes.map((r) => <option key={r._id} value={r._id}>{r.name} ({r.distanceKm?.toFixed(0)} km)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Driver</label>
                <select id="a-driver" className="form-input form-select" value={assignForm.driverId} onChange={(e) => setAssignForm({ ...assignForm, driverId: e.target.value })} required>
                  <option value="">— Select Driver —</option>
                  {drivers.map((d) => <option key={d._id} value={d._id}>{d.firstName} {d.lastName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle</label>
                <select id="a-vehicle" className="form-input form-select" value={assignForm.vehicleId} onChange={(e) => setAssignForm({ ...assignForm, vehicleId: e.target.value })} required>
                  <option value="">— Select Vehicle —</option>
                  {vehicles.map((v) => <option key={v._id} value={v._id}>{v.make} {v.model} ({v.plateNumber})</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Planned Start</label>
                  <input id="a-start" className="form-input" type="datetime-local" value={assignForm.plannedStartTime} onChange={(e) => setAssignForm({ ...assignForm, plannedStartTime: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Planned End</label>
                  <input id="a-end" className="form-input" type="datetime-local" value={assignForm.plannedEndTime} onChange={(e) => setAssignForm({ ...assignForm, plannedEndTime: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button id="btn-confirm-assign" className="btn btn-success" type="submit" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? '⏳ Assigning...' : '✅ Assign Route'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAssignModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routes_;
