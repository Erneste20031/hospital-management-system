import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  :root {
    --bg: #f4f1ec;
    --surface: #faf8f5;
    --card: #ffffff;
    --border: #e8e2d9;
    --border-light: #f0ece6;
    --text-primary: #1a1714;
    --text-secondary: #6b6459;
    --text-muted: #9e9389;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --accent-dark: #1d4ed8;
    --green: #16a34a;
    --green-light: #dcfce7;
    --green-text: #14532d;
    --yellow: #ca8a04;
    --yellow-light: #fef9c3;
    --yellow-text: #713f12;
    --red: #dc2626;
    --red-light: #fee2e2;
    --red-text: #7f1d1d;
    --gray-light: #f3f4f6;
    --gray-text: #4b5563;
    --shadow-sm: 0 1px 3px rgba(26,23,20,0.06), 0 1px 2px rgba(26,23,20,0.04);
    --shadow-md: 0 4px 12px rgba(26,23,20,0.08), 0 2px 6px rgba(26,23,20,0.05);
    --shadow-lg: 0 16px 40px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08);
    --radius: 16px;
    --radius-sm: 10px;
    --transition: 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .mr-root { font-family: 'DM Sans', sans-serif; color: var(--text-primary); }

  .mr-wrap {
    display: flex; flex-direction: column; gap: 20px;
    animation: mr-page-in 0.35s ease both;
  }
  @keyframes mr-page-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Header */
  .mr-header {
    display: flex; justify-content: space-between; align-items: center;
    gap: 12px; flex-wrap: wrap;
  }
  .mr-title {
    font-family: 'DM Serif Display', serif;
    font-size: 28px; font-weight: 400;
    color: var(--text-primary); letter-spacing: -0.3px; line-height: 1.15;
  }

  /* Buttons */
  .mr-btn-primary {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--accent); color: white;
    border: none; border-radius: 50px; padding: 10px 20px;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; white-space: nowrap;
    box-shadow: 0 2px 8px rgba(37,99,235,0.28);
    transition: background var(--transition), transform var(--transition), box-shadow var(--transition);
  }
  .mr-btn-primary:hover  { background: var(--accent-dark); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,99,235,0.32); }
  .mr-btn-primary:active { transform: translateY(0); }
  .mr-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
  .mr-btn-primary.danger { background: var(--red); box-shadow: 0 2px 8px rgba(220,38,38,0.25); }
  .mr-btn-primary.danger:hover { background: #b91c1c; }

  .mr-btn-secondary {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--card); color: var(--text-secondary);
    border: 1.5px solid var(--border); border-radius: 50px; padding: 9px 18px;
    font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all var(--transition);
  }
  .mr-btn-secondary:hover { border-color: var(--text-muted); color: var(--text-primary); }

  .mr-btn-icon {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: var(--radius-sm);
    font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all var(--transition);
  }
  .mr-btn-icon.edit   { border: 1.5px solid var(--border); background: white; color: var(--text-secondary); }
  .mr-btn-icon.edit:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .mr-btn-icon.delete { border: 1.5px solid rgba(220,38,38,0.25); background: rgba(220,38,38,0.04); color: var(--red); }
  .mr-btn-icon.delete:hover { background: var(--red-light); border-color: rgba(220,38,38,0.4); }

  /* Search */
  .mr-search-inner {
    display: flex; align-items: center; gap: 10px;
    background: white; border: 1.5px solid var(--border); border-radius: 40px;
    padding: 9px 16px; box-shadow: var(--shadow-sm);
    transition: border-color var(--transition), box-shadow var(--transition);
  }
  .mr-search-inner:focus-within {
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
  }
  .mr-search-input {
    border: none; outline: none; background: transparent;
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: var(--text-primary); flex: 1;
  }
  .mr-search-input::placeholder { color: var(--text-muted); }
  .mr-search-clear {
    border: none; background: none; cursor: pointer;
    color: var(--text-muted); font-size: 13px; padding: 0; line-height: 1;
    transition: color var(--transition);
  }
  .mr-search-clear:hover { color: var(--text-primary); }

  /* Record card */
  .mr-card {
    background: white; border-radius: 16px; border: 1.5px solid var(--border);
    overflow: hidden; box-shadow: var(--shadow-sm);
    transition: box-shadow var(--transition), border-color var(--transition), transform var(--transition);
    animation: mr-card-in 0.28s ease both;
  }
  @keyframes mr-card-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mr-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
  .mr-card.expanded { border-color: var(--accent); }
  .mr-card-body { padding: 18px 20px; }

  .mr-card-top {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap;
  }
  .mr-patient-row { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
  .mr-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--accent-light); color: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Serif Display', serif; font-size: 18px; flex-shrink: 0;
    border: 2px solid rgba(37,99,235,0.12);
  }
  .mr-patient-name {
    font-family: 'DM Serif Display', serif; font-size: 17px;
    color: var(--text-primary); line-height: 1.2;
  }
  .mr-patient-meta {
    display: flex; gap: 8px; flex-wrap: wrap;
    font-size: 12px; color: var(--text-muted); margin-top: 3px;
  }

  .mr-card-actions { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; flex-shrink: 0; }

  /* Badge */
  .mr-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.4px;
    text-transform: uppercase; white-space: nowrap;
  }
  .mr-badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .mr-badge-active   { background: var(--green-light);  color: var(--green-text); }
  .mr-badge-active   .mr-badge-dot { background: var(--green); }
  .mr-badge-followup { background: var(--yellow-light); color: var(--yellow-text); }
  .mr-badge-followup .mr-badge-dot { background: var(--yellow); }
  .mr-badge-chronic  { background: var(--red-light);    color: var(--red-text); }
  .mr-badge-chronic  .mr-badge-dot { background: var(--red); }
  .mr-badge-resolved { background: var(--gray-light);   color: var(--gray-text); }
  .mr-badge-resolved .mr-badge-dot { background: #9ca3af; }

  .mr-chevron {
    background: none; border: none; cursor: pointer;
    color: var(--text-muted); font-size: 20px; padding: 2px 4px; line-height: 1;
    transition: transform var(--transition), color var(--transition);
  }
  .mr-chevron:hover { color: var(--text-primary); }
  .mr-chevron.open  { transform: rotate(180deg); }

  /* Info grid */
  .mr-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
  .mr-info-block { background: var(--bg); border: 1px solid var(--border-light); padding: 11px 13px; border-radius: var(--radius-sm); }
  .mr-info-label { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; }
  .mr-info-value { font-size: 13.5px; font-weight: 600; color: var(--text-primary); line-height: 1.4; }

  .mr-notes { margin-top: 10px; padding: 11px 13px; background: var(--accent-light); border-left: 3px solid var(--accent); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
  .mr-notes-label { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: var(--accent); margin-bottom: 3px; }
  .mr-notes-text  { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }

  .mr-allergy {
    display: inline-flex; align-items: center; gap: 6px; margin-top: 10px;
    background: var(--red-light); border: 1px solid rgba(220,38,38,0.18);
    color: var(--red); padding: 4px 11px; border-radius: 8px;
    font-size: 12px; font-weight: 600;
  }

  .mr-expanded-panel {
    border-top: 1px solid var(--border-light); background: var(--bg);
    padding: 14px 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
    animation: mr-expand-in 0.2s ease both;
  }
  @keyframes mr-expand-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mr-exp-label { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 3px; }
  .mr-exp-value { font-size: 13px; color: var(--text-secondary); }

  /* ── OVERLAY: fixed, fills viewport, scrolls itself — never touches body ── */
  .mr-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 9999;
    padding: 48px 16px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    animation: mr-overlay-in 0.18s ease both;
  }
  @keyframes mr-overlay-in { from { opacity: 0; } to { opacity: 1; } }

  .mr-modal {
    background: white; border-radius: 22px;
    width: 100%; max-width: 500px;
    padding: 28px;
    box-shadow: var(--shadow-lg);
    margin: auto 0;
    /* NO max-height, NO overflow — overlay handles scrolling */
    animation: mr-modal-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes mr-modal-in {
    from { opacity: 0; transform: scale(0.95) translateY(8px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }

  /* close button */
  .mr-modal-close {
    background: var(--gray-light); border: none; border-radius: 8px;
    width: 32px; height: 32px; cursor: pointer; font-size: 15px;
    color: var(--text-muted); display: flex; align-items: center; justify-content: center;
    transition: background var(--transition), color var(--transition);
  }
  .mr-modal-close:hover { background: var(--border); color: var(--text-primary); }

  .mr-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
  .mr-modal-title { font-family: 'DM Serif Display', serif; font-size: 21px; font-weight: 400; }

  /* Form */
  .mr-field { margin-bottom: 14px; }
  .mr-label { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; display: block; margin-bottom: 5px; color: var(--text-secondary); }
  .mr-label .req { color: var(--red); }
  .mr-input {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid var(--border); border-radius: var(--radius-sm);
    background: var(--bg); color: var(--text-primary);
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; outline: none;
    transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
  }
  .mr-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); background: white; }
  .mr-input::placeholder { color: var(--text-muted); }
  .mr-input:disabled { background: var(--border-light); color: var(--text-muted); cursor: not-allowed; }
  textarea.mr-input { resize: vertical; min-height: 68px; }
  select.mr-input {
    cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239e9389' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
  }

  .mr-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }

  .mr-modal-footer {
    display: flex; gap: 10px;
    margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--border-light);
  }
  .mr-modal-footer .mr-btn-primary,
  .mr-modal-footer .mr-btn-secondary { flex: 1; justify-content: center; padding: 11px; border-radius: 12px; }

  /* Confirm modal */
  .mr-confirm-modal {
    background: white; border-radius: 22px;
    width: 100%; max-width: 360px; padding: 28px; text-align: center;
    box-shadow: var(--shadow-lg);
    animation: mr-modal-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
    margin: auto 0;
  }
  .mr-confirm-icon  { font-size: 40px; margin-bottom: 14px; }
  .mr-confirm-title { font-family: 'DM Serif Display', serif; font-size: 19px; margin-bottom: 8px; }
  .mr-confirm-text  { font-size: 13px; color: var(--text-muted); margin-bottom: 22px; line-height: 1.5; font-weight: 300; }
  .mr-confirm-footer { display: flex; gap: 10px; }
  .mr-confirm-footer .mr-btn-primary,
  .mr-confirm-footer .mr-btn-secondary { flex: 1; justify-content: center; padding: 11px; border-radius: 12px; }

  /* Loading / Error / Empty */
  .mr-center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; gap: 14px; }
  .mr-spinner { width: 34px; height: 34px; border: 2.5px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: mr-spin 0.75s linear infinite; }
  @keyframes mr-spin { to { transform: rotate(360deg); } }
  .mr-center-label { font-size: 14px; color: var(--text-muted); }

  .mr-error-card { text-align: center; padding: 48px 20px; background: white; border-radius: 16px; border: 1.5px solid rgba(220,38,38,0.2); }
  .mr-empty-card  { text-align: center; padding: 48px 20px; background: white; border-radius: 16px; border: 1.5px solid var(--border); }
  .mr-empty-icon  { font-size: 34px; margin-bottom: 10px; opacity: 0.4; }
  .mr-empty-title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
  .mr-empty-sub   { font-size: 13px; color: var(--text-muted); font-weight: 300; }

  /* Responsive */
  @media (max-width: 560px) {
    .mr-title { font-size: 24px; }
    .mr-info-grid { grid-template-columns: 1fr; }
    .mr-expanded-panel { grid-template-columns: 1fr 1fr; }
    .mr-field-row { grid-template-columns: 1fr; }
    .mr-overlay { padding: 20px 12px; }
    .mr-modal  { padding: 22px; }
  }
  @media (max-width: 400px) {
    .mr-card-actions .mr-btn-icon span { display: none; }
  }
`;

const getBadgeClass = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'active':    return 'mr-badge mr-badge-active';
    case 'follow-up': return 'mr-badge mr-badge-followup';
    case 'chronic':   return 'mr-badge mr-badge-chronic';
    case 'resolved':  return 'mr-badge mr-badge-resolved';
    default:          return 'mr-badge mr-badge-active';
  }
};

const EMPTY_FORM = { patientId: '', diagnosis: '', prescription: '', notes: '', allergies: '', status: 'Active' };

const MedicalRecords = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState('');
  const [expanded, setExpanded]           = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData]           = useState(EMPTY_FORM);

  // ── no body scroll lock at all — overlay handles its own scroll ──
  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await API.get('/medical/records');
      setRecords(response.data || []);
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setError(err.response?.data?.message || 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/medical/records', formData);
      setShowModal(false);
      setEditingRecord(null);
      setFormData(EMPTY_FORM);
      fetchRecords();
    } catch (err) {
      console.error('Error saving record:', err);
      alert(err.response?.data?.message || 'Failed to save medical record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      patientId:    record.patient_id,
      diagnosis:    record.diagnosis    || '',
      prescription: record.prescription || '',
      notes:        record.notes        || '',
      allergies:    record.allergies    || '',
      status:       record.status       || 'Active',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/medical/records/${id}`);
      setDeleteConfirm(null);
      fetchRecords();
    } catch (err) {
      console.error('Error deleting record:', err);
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  const filtered = records.filter(record =>
    (record.patient_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (record.diagnosis    || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="mr-root">
      <style>{styles}</style>
      <div className="mr-center">
        <div className="mr-spinner" />
        <span className="mr-center-label">Loading…</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="mr-root">
      <style>{styles}</style>
      <div className="mr-error-card">
        <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚠️</div>
        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--red)', marginBottom: '14px' }}>{error}</p>
        <button onClick={fetchRecords} className="mr-btn-primary">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="mr-root">
      <style>{styles}</style>
      <div className="mr-wrap">

        {/* ── Delete confirm ───────────────────────────── */}
        {deleteConfirm && (
          <div className="mr-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="mr-confirm-modal" onClick={e => e.stopPropagation()}>
              <div className="mr-confirm-icon">🗑️</div>
              <h3 className="mr-confirm-title">Delete Record?</h3>
              <p className="mr-confirm-text">This record will be permanently removed and cannot be undone.</p>
              <div className="mr-confirm-footer">
                <button onClick={() => setDeleteConfirm(null)} className="mr-btn-secondary">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="mr-btn-primary danger">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Add / Edit modal ─────────────────────────── */}
        {showModal && (
          <div className="mr-overlay" onClick={() => setShowModal(false)}>
            <div className="mr-modal" onClick={e => e.stopPropagation()}>

              <div className="mr-modal-header">
                <h2 className="mr-modal-title">
                  {editingRecord ? 'Edit Record' : 'New Record'}
                </h2>
                <button className="mr-modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mr-field">
                  <label className="mr-label">Patient ID <span className="req">*</span></label>
                  <input type="number" className="mr-input" required
                    value={formData.patientId}
                    onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                    disabled={!!editingRecord} />
                </div>

                <div className="mr-field">
                  <label className="mr-label">Diagnosis</label>
                  <input type="text" className="mr-input" placeholder="e.g. Hypertension"
                    value={formData.diagnosis}
                    onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} />
                </div>

                <div className="mr-field">
                  <label className="mr-label">Prescription</label>
                  <textarea rows="2" className="mr-input" placeholder="Medications and dosage…"
                    value={formData.prescription}
                    onChange={e => setFormData({ ...formData, prescription: e.target.value })} />
                </div>

                <div className="mr-field">
                  <label className="mr-label">Doctor's Notes</label>
                  <textarea rows="3" className="mr-input" placeholder="Clinical observations…"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                </div>

                {/* Allergies + Status side by side */}
                <div className="mr-field-row">
                  <div>
                    <label className="mr-label">Allergies</label>
                    <input type="text" className="mr-input" placeholder="e.g. Penicillin"
                      value={formData.allergies}
                      onChange={e => setFormData({ ...formData, allergies: e.target.value })} />
                  </div>
                  <div>
                    <label className="mr-label">Status</label>
                    <select className="mr-input" value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="Active">Active</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Chronic">Chronic</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="mr-modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="mr-btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="mr-btn-primary">
                    {submitting ? 'Saving…' : (editingRecord ? 'Update' : 'Save Record')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Page header ──────────────────────────────── */}
        <div className="mr-header">
          <h1 className="mr-title">Medical Records</h1>
          <button className="mr-btn-primary" onClick={() => {
            setEditingRecord(null);
            setFormData(EMPTY_FORM);
            setShowModal(true);
          }}>+ New Record</button>
        </div>

        {/* ── Search ───────────────────────────────────── */}
        <div className="mr-search-inner">
          <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>⌕</span>
          <input type="text" className="mr-search-input"
            placeholder="Search by patient name or diagnosis…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button className="mr-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* ── Records list ─────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="mr-empty-card">
            <div className="mr-empty-icon">📋</div>
            <div className="mr-empty-title">{search ? 'No records match your search' : 'No medical records yet'}</div>
            <div className="mr-empty-sub">{search ? 'Try a different term.' : 'Click "+ New Record" to get started.'}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((record, idx) => (
              <div key={record.id}
                className={`mr-card${expanded === record.id ? ' expanded' : ''}`}
                style={{ animationDelay: `${idx * 0.035}s` }}
              >
                <div className="mr-card-body">
                  <div className="mr-card-top">
                    <div className="mr-patient-row">
                      <div className="mr-avatar">
                        {(record.patient_name || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="mr-patient-name">
                          {record.patient_name || `Patient #${record.patient_id}`}
                        </div>
                        <div className="mr-patient-meta">
                          <span>Age: {record.age || 'N/A'}</span>
                          <span>·</span>
                          <span>Blood: {record.blood_group || 'N/A'}</span>
                          <span>·</span>
                          <span>Last visit: {record.last_visit?.split('T')[0] || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mr-card-actions">
                      <span className={getBadgeClass(record.status)}>
                        <span className="mr-badge-dot" />
                        {record.status || 'Active'}
                      </span>
                      <button className="mr-btn-icon edit" onClick={() => handleEdit(record)}>
                        ✏️ <span>Edit</span>
                      </button>
                      <button className="mr-btn-icon delete" onClick={() => setDeleteConfirm(record.id)}>
                        🗑️ <span>Delete</span>
                      </button>
                      <button
                        className={`mr-chevron${expanded === record.id ? ' open' : ''}`}
                        onClick={() => setExpanded(expanded === record.id ? null : record.id)}
                        aria-label="Toggle details"
                      >⌄</button>
                    </div>
                  </div>

                  <div className="mr-info-grid">
                    <div className="mr-info-block">
                      <div className="mr-info-label">Diagnosis</div>
                      <div className="mr-info-value">{record.diagnosis || '—'}</div>
                    </div>
                    <div className="mr-info-block">
                      <div className="mr-info-label">Prescription</div>
                      <div className="mr-info-value">{record.prescription || '—'}</div>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mr-notes">
                      <div className="mr-notes-label">Notes</div>
                      <div className="mr-notes-text">{record.notes}</div>
                    </div>
                  )}

                  {record.allergies && (
                    <div className="mr-allergy">⚠ Allergies: {record.allergies}</div>
                  )}
                </div>

                {expanded === record.id && (
                  <div className="mr-expanded-panel">
                    <div>
                      <div className="mr-exp-label">Patient ID</div>
                      <div className="mr-exp-value">{record.patient_id}</div>
                    </div>
                    <div>
                      <div className="mr-exp-label">Record ID</div>
                      <div className="mr-exp-value">{record.id}</div>
                    </div>
                    <div>
                      <div className="mr-exp-label">Total Visits</div>
                      <div className="mr-exp-value">{record.visits_count || 1}</div>
                    </div>
                    <div>
                      <div className="mr-exp-label">Created</div>
                      <div className="mr-exp-value">{record.created_at?.split('T')[0] || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="mr-exp-label">Last Updated</div>
                      <div className="mr-exp-value">{record.updated_at?.split('T')[0] || 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;