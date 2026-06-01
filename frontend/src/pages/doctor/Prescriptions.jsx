import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Prescriptions = () => {
  const { user } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [filter, setFilter]             = useState('All');
  const [showModal, setShowModal]       = useState(false);
  const [editingPres, setEditingPres]   = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '', medicine: '', dosage: '', frequency: '', duration: '', notes: ''
  });

  useEffect(() => { fetchPrescriptions(); }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await API.get('/medical/records');
      const records  = response.data || [];
      const extracted = records
        .filter(r => r.prescription && r.prescription.trim() !== '')
        .map(r => ({
          id:          r.id,
          patientId:   r.patient_id,
          patientName: r.patient_name || `Patient #${r.patient_id}`,
          medicine:    r.prescription,
          diagnosis:   r.diagnosis,
          doctor:      r.doctor_name || user?.name,
          date:        r.last_visit?.split('T')[0] || r.created_at?.split('T')[0],
          status:      r.status === 'Active' ? 'Active' : 'Completed',
          notes:       r.notes,
          allergies:   r.allergies,
        }));
      setPrescriptions(extracted);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const prescriptionText =
        `${formData.medicine}` +
        `${formData.dosage    ? ` ${formData.dosage}`           : ''}` +
        `${formData.frequency ? `, ${formData.frequency}`       : ''}` +
        `${formData.duration  ? ` for ${formData.duration}`     : ''}`;

      await API.post('/medical/records', {
        patientId:   formData.patientId,
        diagnosis:   formData.medicine,
        prescription: prescriptionText,
        notes:       formData.notes,
        allergies:   '',
        status:      'Active',
      });

      setShowModal(false);
      setEditingPres(null);
      setFormData({ patientId: '', medicine: '', dosage: '', frequency: '', duration: '', notes: '' });
      fetchPrescriptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (pres) => {
    setEditingPres(pres);
    setFormData({ patientId: pres.patientId, medicine: pres.medicine, dosage: '', frequency: '', duration: '', notes: pres.notes || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/medical/records/${id}`);
      setDeleteConfirm(null);
      fetchPrescriptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete prescription');
    }
  };

  const openNew = () => {
    setEditingPres(null);
    setFormData({ patientId: '', medicine: '', dosage: '', frequency: '', duration: '', notes: '' });
    setShowModal(true);
  };

  const filters = ['All', 'Active', 'Completed'];
  const visible = prescriptions.filter(p => filter === 'All' || p.status === filter);

  /* ── shared styles ───────────────────────────────────── */
  const inputStyle = {
    width: '100%', padding: '10px 14px',
    borderRadius: '10px', border: '1.5px solid var(--gray-200)',
    fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
    fontFamily: 'inherit', color: 'var(--gray-900)',
  };

  /* ── overlay: handles its own scroll, never touches body ─ */
  const overlayStyle = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
    overflowY: 'auto',          /* overlay scrolls, not body  */
    WebkitOverflowScrolling: 'touch',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '48px 16px 48px',  /* breathing room top+bottom  */
  };

  const modalStyle = {
    background: 'white', borderRadius: '20px',
    maxWidth: '500px', width: '100%',
    padding: '32px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
    /* NO maxHeight / overflowY here — let the overlay handle it */
  };

  /* ── loading / error states ──────────────────────────── */
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '360px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '38px', marginBottom: '14px' }}>💊</div>
        <p style={{ color: 'var(--gray-400)', fontWeight: '500', fontSize: '14px' }}>Loading prescriptions…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1.5px solid #fecaca' }}>
      <div style={{ fontSize: '38px', marginBottom: '12px' }}>⚠️</div>
      <p style={{ fontSize: '14px', fontWeight: '700', color: '#dc2626' }}>{error}</p>
      <button onClick={fetchPrescriptions} className="btn-primary" style={{ marginTop: '16px', fontSize: '13px' }}>Try Again</button>
    </div>
  );

  /* ── main render ─────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Delete modal ──────────────────────────────── */}
      {deleteConfirm && (
        <div style={overlayStyle} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...modalStyle, maxWidth: '380px', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}
               onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '8px', color: 'var(--gray-900)' }}>
              Delete Prescription?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '24px', lineHeight: '1.6' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, padding: '11px', borderRadius: '10px',
                border: '1.5px solid var(--gray-200)', background: 'white',
                cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: 'var(--gray-700)'
              }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{
                flex: 1, padding: '11px', borderRadius: '10px',
                background: '#dc2626', color: 'white', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: '700'
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit modal ──────────────────────────── */}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>

            {/* modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
                {editingPres ? 'Edit Prescription' : 'New Prescription'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{
                background: 'var(--gray-100)', border: 'none', borderRadius: '8px',
                width: '32px', height: '32px', cursor: 'pointer',
                fontSize: '16px', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Patient ID */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Patient ID <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input type="number" required value={formData.patientId}
                  onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                  disabled={!!editingPres}
                  style={{ ...inputStyle, background: editingPres ? 'var(--gray-50, #f9fafb)' : 'white', color: 'var(--gray-900)' }} />
              </div>

              {/* Medicine */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Medicine Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input type="text" required value={formData.medicine}
                  onChange={e => setFormData({ ...formData, medicine: e.target.value })}
                  placeholder="e.g., Lisinopril, Amoxicillin"
                  style={inputStyle} />
              </div>

              {/* Dosage + Frequency side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dosage</label>
                  <input type="text" value={formData.dosage}
                    onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 10mg"
                    style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Frequency</label>
                  <input type="text" value={formData.frequency}
                    onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                    placeholder="e.g., Twice daily"
                    style={inputStyle} />
                </div>
              </div>

              {/* Duration */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Duration</label>
                <input type="text" value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 30 days, 2 weeks"
                  style={inputStyle} />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Notes / Instructions</label>
                <textarea rows="3" value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional instructions for the patient…"
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }} />
              </div>

              {/* Footer buttons */}
              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--gray-100)', paddingTop: '20px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: '11px', borderRadius: '10px',
                  border: '1.5px solid var(--gray-200)', background: 'white',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)'
                }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{
                  flex: 1, padding: '11px', borderRadius: '10px',
                  background: 'var(--blue)', color: 'white', border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: '700',
                  opacity: submitting ? 0.7 : 1
                }}>
                  {submitting ? 'Saving…' : (editingPres ? 'Update Prescription' : 'Save Prescription')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Page header ───────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
          Prescriptions
        </h1>
        <button onClick={openNew} className="btn-primary"
          style={{ fontSize: '13px', padding: '10px 22px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
          + New Prescription
        </button>
      </div>

      {/* ── Filter pills ──────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 18px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
            border: `2px solid ${filter === f ? 'var(--blue)' : 'var(--gray-200)'}`,
            background: filter === f ? 'var(--blue)' : 'white',
            color: filter === f ? 'white' : 'var(--gray-600)',
            cursor: 'pointer', transition: 'all 0.18s ease'
          }}>{f}</button>
        ))}
      </div>

      {/* ── Empty state ───────────────────────────────── */}
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1.5px solid var(--gray-200)' }}>
          <div style={{ fontSize: '38px', marginBottom: '12px' }}>💊</div>
          <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-900)' }}>No prescriptions found</p>
          <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '4px' }}>Click "New Prescription" to add one</p>
        </div>

      /* ── Card list ────────────────────────────────── */
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {visible.map(pres => {
            const isActive = pres.status === 'Active';
            return (
              <div key={pres.id} style={{
                borderRadius: '16px',
                border: `1.5px solid ${isActive ? 'rgba(22,163,74,0.22)' : 'var(--gray-200)'}`,
                background: isActive ? 'rgba(22,163,74,0.025)' : 'white',
                overflow: 'hidden',
              }}>
                {/* top row: icon + main info + status badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px' }}>

                  {/* icon */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                    background: isActive ? 'rgba(22,163,74,0.1)' : 'var(--gray-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', marginTop: '1px'
                  }}>💊</div>

                  {/* text block — grows to fill width */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gray-900)', lineHeight: '1.3', wordBreak: 'break-word' }}>
                      {pres.medicine}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: '500', marginTop: '4px' }}>
                      {pres.patientName}
                      {pres.doctor ? <span style={{ color: 'var(--gray-400)' }}> · {pres.doctor}</span> : null}
                    </div>
                    {pres.diagnosis && (
                      <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '3px' }}>
                        {pres.diagnosis}
                      </div>
                    )}
                    {pres.notes && (
                      <div style={{
                        fontSize: '12px', color: 'var(--gray-600)', marginTop: '6px',
                        padding: '6px 10px', borderRadius: '8px',
                        background: 'rgba(0,0,0,0.035)',
                        borderLeft: '3px solid var(--gray-300)',
                        lineHeight: '1.5'
                      }}>
                        {pres.notes}
                      </div>
                    )}
                  </div>

                  {/* status badge + date — top-right */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '700',
                      padding: '3px 10px', borderRadius: '20px',
                      background: isActive ? 'rgba(22,163,74,0.12)' : 'var(--gray-100)',
                      color: isActive ? '#16a34a' : 'var(--gray-500)',
                      whiteSpace: 'nowrap'
                    }}>{pres.status}</span>
                    {pres.date && (
                      <span style={{ fontSize: '11px', color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                        {pres.date}
                      </span>
                    )}
                  </div>
                </div>

                {/* bottom action bar — separated by a hairline */}
                <div style={{
                  display: 'flex', justifyContent: 'flex-end', gap: '8px',
                  padding: '10px 20px',
                  borderTop: `1px solid ${isActive ? 'rgba(22,163,74,0.12)' : 'var(--gray-100)'}`,
                  background: isActive ? 'rgba(22,163,74,0.02)' : 'var(--gray-50, #f9fafb)'
                }}>
                  <button onClick={() => handleEdit(pres)} style={{
                    padding: '6px 14px', borderRadius: '8px',
                    border: '1px solid var(--gray-200)', background: 'white',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: 'var(--gray-700)',
                    transition: 'background 0.15s'
                  }}>✏️ Edit</button>
                  <button onClick={() => setDeleteConfirm(pres.id)} style={{
                    padding: '6px 14px', borderRadius: '8px',
                    border: '1px solid rgba(220,38,38,0.25)',
                    background: 'rgba(220,38,38,0.04)',
                    color: '#dc2626', cursor: 'pointer',
                    fontSize: '12px', fontWeight: '600',
                    transition: 'background 0.15s'
                  }}>🗑️ Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;