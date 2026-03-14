// ??$$$ Invoices page – submit, view, flag, and approve/reject invoices with anomaly detection
import { useState, useEffect, useCallback } from 'react';
import http from '../api/http';
import { useToast } from '../App';

const typeOptions = ['fuel_claim', 'delivery_summary'];
const statusOptions = ['all', 'pending', 'approved', 'rejected', 'flagged'];

const statusBadge = { pending: 'badge-blue', approved: 'badge-green', rejected: 'badge-red', flagged: 'badge-orange' };

const defaultForm = { driverId: '', vehicleId: '', type: 'fuel_claim', amount: '', fuelLitersClaimed: '', currency: 'USD' };

const Invoices = () => {
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [inv, drv, veh] = await Promise.all([http.get('/invoices'), http.get('/drivers'), http.get('/vehicles')]);
      setInvoices(inv.data);
      setDrivers(drv.data);
      setVehicles(veh.data);
    } catch (err) {
      addToast('error', 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        fuelLitersClaimed: form.type === 'fuel_claim' ? parseFloat(form.fuelLitersClaimed) : undefined,
      };
      const { data } = await http.post('/invoices', payload);
      setInvoices((prev) => [data, ...prev]);
      if (data.anomalyFlag) {
        addToast('warning', '⚠️ Anomaly Detected', data.anomalyDetails?.reason);
      } else {
        addToast('success', 'Invoice submitted', `#${data.invoiceNumber}`);
      }
      setShowModal(false);
      setForm(defaultForm);
    } catch (err) {
      addToast('error', 'Failed to submit', err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const { data } = await http.put(`/invoices/${id}/status`, { status });
      setInvoices((prev) => prev.map((inv) => inv._id === id ? { ...inv, status: data.status } : inv));
      addToast('success', `Invoice ${status}`);
    } catch {
      addToast('error', 'Failed to update status');
    }
  };

  const filtered = statusFilter === 'all' ? invoices : invoices.filter((i) => i.status === statusFilter);

  const flaggedCount = invoices.filter((i) => i.anomalyFlag).length;
  const pendingCount = invoices.filter((i) => i.status === 'pending').length;
  const approvedCount = invoices.filter((i) => i.status === 'approved').length;

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Invoice Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {invoices.length} total · <span style={{ color: 'var(--accent-orange)' }}>{flaggedCount} flagged</span>
          </p>
        </div>
        <button id="btn-submit-invoice" className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Submit Invoice</button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card blue"><div className="stat-value">{pendingCount}</div><div className="stat-label">Pending Review</div></div>
        <div className="stat-card green"><div className="stat-value">{approvedCount}</div><div className="stat-label">Approved</div></div>
        <div className="stat-card red"><div className="stat-value">{invoices.filter(i => i.status === 'rejected').length}</div><div className="stat-label">Rejected</div></div>
        <div className="stat-card yellow"><div className="stat-value">{flaggedCount}</div><div className="stat-label">🚨 Flagged (Anomaly)</div></div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '16px' }}>
        <select id="inv-filter" className="form-input form-select" style={{ width: 'auto', minWidth: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {statusOptions.map((s) => <option key={s} value={s}>{s === 'all' ? '🔍 All Statuses' : s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Type</th>
                <th>Driver</th>
                <th>Amount</th>
                <th>Fuel Claimed</th>
                <th>Anomaly</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No invoices found</td></tr>
                : filtered.map((inv) => (
                  <tr key={inv._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedInvoice(inv === selectedInvoice ? null : inv)}>
                    <td>
                      <code style={{ fontSize: '12px', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                        {inv.invoiceNumber}
                      </code>
                    </td>
                    <td><span className="badge badge-blue">{inv.type.replace('_', ' ')}</span></td>
                    <td style={{ fontSize: '13px' }}>{inv.driverId ? `${inv.driverId.firstName} ${inv.driverId.lastName}` : '—'}</td>
                    <td style={{ fontWeight: '700' }}>${inv.amount?.toFixed(2)}</td>
                    <td>{inv.fuelLitersClaimed ? `${inv.fuelLitersClaimed}L` : '—'}</td>
                    <td>
                      {inv.anomalyFlag
                        ? <span className="badge badge-orange">⚠️ Flagged</span>
                        : <span className="badge badge-green">✅ Clean</span>
                      }
                    </td>
                    <td><span className={`badge ${statusBadge[inv.status] || 'badge-gray'}`}>{inv.status}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(inv.submittedAt).toLocaleDateString()}</td>
                    <td>
                      {inv.status === 'pending' || inv.status === 'flagged' ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button id={`approve-${inv._id}`} className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(inv._id, 'approved'); }}>✅</button>
                          <button id={`reject-${inv._id}`} className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(inv._id, 'rejected'); }}>❌</button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Anomaly Details Expanded */}
      {selectedInvoice?.anomalyFlag && (
        <div className="card" style={{ marginTop: '16px', borderColor: 'rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.05)' }}>
          <div style={{ fontWeight: '700', color: 'var(--accent-orange)', marginBottom: '10px' }}>⚠️ Anomaly Details – {selectedInvoice.invoiceNumber}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Type</div>
              <div style={{ fontWeight: '600' }}>{selectedInvoice.anomalyDetails?.type || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score</div>
              <div style={{ fontWeight: '600', color: 'var(--accent-red)' }}>{selectedInvoice.anomalyDetails?.score || 0}/100</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Reason</div>
              <div style={{ fontWeight: '600', fontSize: '13px' }}>{selectedInvoice.anomalyDetails?.reason || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">📄 Submit Invoice</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select id="inv-type" className="form-input form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {typeOptions.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Driver</label>
                <select id="inv-driver" className="form-input form-select" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} required>
                  <option value="">— Select Driver —</option>
                  {drivers.map((d) => <option key={d._id} value={d._id}>{d.firstName} {d.lastName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle</label>
                <select id="inv-vehicle" className="form-input form-select" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                  <option value="">— Select Vehicle —</option>
                  {vehicles.map((v) => <option key={v._id} value={v._id}>{v.make} {v.model} ({v.plateNumber})</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount ($)</label>
                  <input id="inv-amount" className="form-input" type="number" step="0.01" placeholder="250.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                </div>
                {form.type === 'fuel_claim' && (
                  <div className="form-group">
                    <label className="form-label">Fuel Claimed (Liters)</label>
                    <input id="inv-fuel" className="form-input" type="number" step="0.1" placeholder="45.5" value={form.fuelLitersClaimed} onChange={(e) => setForm({ ...form, fuelLitersClaimed: e.target.value })} />
                  </div>
                )}
              </div>
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                ⚡ AI anomaly detection will automatically analyze fuel claims against recent route data.
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button id="btn-save-invoice" className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? '⏳ Analyzing...' : '📤 Submit Invoice'}
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

export default Invoices;
