import React, { useState, useEffect, useContext } from 'react';
import appointmentService from '../../services/appointmentsService';
import { AuthContext } from '../../context/AuthContext';

/* ─── config ────────────────────────────────────────────── */
const statusConfig = {
  'Waiting':     { cls: 'status-pending',   dot: '#92640a'     },
  'In Progress': { cls: 'status-active',    dot: '#166534'     },
  'Scheduled':   { cls: 'status-completed', dot: 'var(--blue)' },
  'Completed':   { cls: 'status-completed', dot: 'var(--blue)' },
  'Cancelled':   { cls: 'status-cancelled', dot: '#991b1b'     },
};
const typeColors = {
  'Checkup':      { bg: 'var(--blue-muted)',     color: 'var(--blue)' },
  'Follow-up':    { bg: 'rgba(245,166,35,0.12)', color: '#92640a'     },
  'Consultation': { bg: 'rgba(147,51,234,0.1)',  color: '#7c3aed'     },
  'Emergency':    { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626'     },
};
const avatarColors = ['#3D4DB7', '#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706'];

/* Normalize DB row → UI shape */
const normalise = (a) => ({
  id:       a.id,
  patient:  `${a.patient_first_name ?? a.first_name ?? ''} ${a.patient_last_name ?? a.last_name ?? ''}`.trim() || a.patient || 'Unknown',
  age:      a.age      ?? '—',
  date:     a.date     ?? a.appointment_date ?? '—',
  time:     a.time     ?? a.appointment_time ?? '—',
  symptoms: a.symptoms ?? a.reason ?? '—',
  status:   a.status   ?? 'Scheduled',
  type:     a.type     ?? a.appointment_type ?? 'Checkup',
  token:    a.token    ?? `#${a.id}`,
});

/* ─── View Detail Modal ──────────────────────────────────── */
const ViewModal = ({ apt, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
    <div style={{ background: 'white', borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 60px rgba(0,0,0,0.22)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>📋 Appointment Details</h2>
        <button onClick={onClose} style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1.5px solid var(--gray-200)', background: 'white', cursor: 'pointer', fontSize: '16px' }}>✕</button>
      </div>
      {[
        ['Patient',   apt.patient],
        ['Token',     apt.token],
        ['Date',      apt.date],
        ['Time',      apt.time],
        ['Type',      apt.type],
        ['Status',    apt.status],
        ['Symptoms',  apt.symptoms],
      ].map(([lbl, val]) => (
        <div key={lbl} style={{ display: 'flex', gap: '16px', marginBottom: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-400)', minWidth: '80px', textTransform: 'uppercase' }}>{lbl}</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-900)' }}>{val}</span>
        </div>
      ))}
      <button onClick={onClose} className="btn-primary" style={{ width: '100%', padding: '11px', borderRadius: '40px', fontSize: '13px', marginTop: '8px' }}>Close</button>
    </div>
  </div>
);

/* ─── New Appointment Modal ──────────────────────────────── */
const NewAppointmentModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({ patientName: '', date: '', time: '', type: 'Checkup', symptoms: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.date || !form.time) { setErr('Date and time are required.'); return; }
    setSaving(true); setErr('');
    try {
      await appointmentService.create({
        appointment_date: form.date,
        appointment_time: form.time,
        appointment_type: form.type,
        reason:           form.symptoms,
        status:           'Scheduled',
      });
      onSaved();
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message ?? 'Failed to create appointment.');
    } finally {
      setSaving(false);
    }
  };

  const inp = { width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--gray-200)', fontSize: '13px', fontFamily: 'inherit', outline: 'none', color: 'var(--gray-900)', boxSizing: 'border-box', background: 'white' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 60px rgba(0,0,0,0.22)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>📅 New Appointment</h2>
          <button onClick={onClose} style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1.5px solid var(--gray-200)', background: 'white', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          {[
            { label: 'Date *',  key: 'date', type: 'date' },
            { label: 'Time *',  key: 'time', type: 'time' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', marginBottom: '6px' }}>{label}</p>
              <input type={type} value={form[key]} onChange={set(key)} style={inp}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                onBlur={e  => e.currentTarget.style.borderColor = 'var(--gray-200)'}
              />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '14px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', marginBottom: '6px' }}>Type</p>
          <select value={form.type} onChange={set('type')} style={{ ...inp, cursor: 'pointer' }}>
            {['Checkup', 'Follow-up', 'Consultation', 'Emergency'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', marginBottom: '6px' }}>Symptoms / Reason</p>
          <textarea value={form.symptoms} onChange={set('symptoms')} rows={3} placeholder="Describe patient symptoms…"
            style={{ ...inp, resize: 'vertical' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--blue)'}
            onBlur={e  => e.currentTarget.style.borderColor = 'var(--gray-200)'}
          />
        </div>

        {err && <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}><p style={{ fontSize: '13px', color: '#dc2626', margin: 0, fontWeight: '600' }}>⚠️ {err}</p></div>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '40px', border: '1.5px solid var(--gray-200)', cursor: 'pointer', background: 'white', color: 'var(--gray-600)', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary" style={{ flex: 2, padding: '11px', borderRadius: '40px', fontSize: '13px', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : '+ Schedule Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────── */
const DoctorAppointments = () => {
  const { user } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter,   setDateFilter]   = useState('Today');
  const [showAdd,      setShowAdd]      = useState(false);
  const [viewApt,      setViewApt]      = useState(null);
  const [updating,     setUpdating]     = useState(null); // id being updated

  /* ── fetch ── */
  const fetchAppointments = async () => {
    try {
      setLoading(true); setError(null);
      const res  = await appointmentService.getAll();
      const data = Array.isArray(res.data) ? res.data : [];
      setAppointments(data.map(normalise));
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [dateFilter]);

  /* ── update status ── */
  const updateStatus = async (apt, newStatus) => {
    setUpdating(apt.id);
    try {
      await appointmentService.updateStatus(apt.id, newStatus);
      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, status: newStatus } : a));
    } catch { alert('Update failed. Please try again.'); }
    finally { setUpdating(null); }
  };

  /* ── cancel ── */
  const handleCancel = async (apt) => {
    if (!window.confirm(`Cancel appointment for ${apt.patient}?`)) return;
    setUpdating(apt.id);
    try {
      await appointmentService.cancel(apt.id);
      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, status: 'Cancelled' } : a));
    } catch { alert('Cancel failed. Please try again.'); }
    finally { setUpdating(null); }
  };

  /* ── client-side date filter ── */
  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const filtered = appointments.filter(a => {
    const matchSearch =
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.symptoms.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    let matchDate = true;
    if (dateFilter === 'Today')     matchDate = a.date === today;
    if (dateFilter === 'Tomorrow')  matchDate = a.date === tomorrow;
    if (dateFilter === 'This Week') {
      const d = new Date(a.date), now = new Date();
      const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
      matchDate = d >= now && d <= weekEnd;
    }
    return matchSearch && matchStatus && matchDate;
  });

  const stats = [
    { label: 'Total Today',  value: appointments.filter(a => a.date === today).length,          icon: '📅', orange: false },
    { label: 'Waiting',      value: appointments.filter(a => a.status === 'Waiting').length,     icon: '⏳', orange: false },
    { label: 'In Progress',  value: appointments.filter(a => a.status === 'In Progress').length, icon: '🔄', orange: true  },
    { label: 'Completed',    value: appointments.filter(a => a.status === 'Completed').length,   icon: '✅', orange: true  },
  ];

  const iconBtn = (bg = 'white', border = 'var(--gray-200)', color = 'var(--gray-600)') => ({
    padding: '7px 13px', borderRadius: '10px',
    border: `1.5px solid ${border}`, cursor: 'pointer',
    background: bg, color, fontSize: '12px', fontWeight: '700',
    fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap',
  });

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '14px' }}>
        {[...Array(4)].map((_, i) => <div key={i} style={{ background: 'white', borderRadius: '18px', height: '90px', border: '1.5px solid var(--gray-200)', opacity: 0.5 }} />)}
      </div>
      {[...Array(3)].map((_, i) => <div key={i} style={{ background: 'white', borderRadius: '20px', height: '120px', border: '1.5px solid var(--gray-200)', opacity: 0.5 }} />)}
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1.5px solid #fecaca' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
      <p style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626' }}>{error}</p>
      <button onClick={fetchAppointments} className="btn-primary" style={{ marginTop: '16px', fontSize: '13px' }}>Try Again</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Modals */}
      {showAdd  && <NewAppointmentModal onClose={() => setShowAdd(false)} onSaved={fetchAppointments} />}
      {viewApt  && <ViewModal apt={viewApt} onClose={() => setViewApt(null)} />}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
            My <span style={{ color: 'var(--orange)' }}>Appointments</span>
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '4px', fontWeight: '500' }}>
            📅 {appointments.length} total appointments
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ fontSize: '13px', padding: '10px 22px' }}>
          + New Appointment
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '14px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '18px', padding: '18px 16px', border: '1.5px solid var(--gray-200)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', borderRadius: '18px 18px 0 0', background: s.orange ? 'var(--orange)' : 'var(--blue)' }} />
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--gray-900)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-400)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '16px 20px', border: '1.5px solid var(--gray-200)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)', borderRadius: '40px', padding: '8px 16px', flex: 1, minWidth: '200px' }}>
          <span>🔍</span>
          <input type="text" placeholder="Search patient or symptoms…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', fontFamily: 'inherit', color: 'var(--gray-900)', flex: 1 }}
          />
          {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '14px', padding: 0 }}>✕</button>}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['Today', 'Tomorrow', 'This Week'].map(d => (
            <button key={d} onClick={() => setDateFilter(d)} style={{
              padding: '7px 16px', borderRadius: '40px', border: '1.5px solid',
              borderColor: dateFilter === d ? 'var(--blue)' : 'var(--gray-200)',
              background: dateFilter === d ? 'var(--blue)' : 'white',
              color: dateFilter === d ? 'white' : 'var(--gray-600)',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
            }}>{d}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Waiting', 'In Progress', 'Scheduled', 'Completed'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{
              padding: '7px 14px', borderRadius: '40px', border: '1.5px solid',
              borderColor: statusFilter === f ? 'var(--orange)' : 'var(--gray-200)',
              background: statusFilter === f ? 'var(--orange)' : 'white',
              color: statusFilter === f ? 'white' : 'var(--gray-600)',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>{f}</button>
          ))}
        </div>

        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-400)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          {filtered.length} of {appointments.length}
        </span>
      </div>

      {/* ── Appointment Cards ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1.5px solid var(--gray-200)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
          <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-900)' }}>No appointments found</p>
          <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '4px' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((apt, i) => {
            const sc = statusConfig[apt.status] ?? statusConfig['Scheduled'];
            const tc = typeColors[apt.type] ?? typeColors['Checkup'];
            const isInProgress = apt.status === 'In Progress';
            const isUpdating   = updating === apt.id;

            return (
              <div key={apt.id} style={{
                background: isInProgress ? 'rgba(61,77,183,0.02)' : 'white',
                borderRadius: '20px', padding: '20px 22px',
                border: `1.5px solid ${isInProgress ? 'var(--blue)' : 'var(--gray-200)'}`,
                transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => { if (!isInProgress) { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(61,77,183,0.1)'; }}}
                onMouseLeave={e => { if (!isInProgress) { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.boxShadow = 'none'; }}}
              >
                {/* In-progress accent bar */}
                {isInProgress && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--blue)', borderRadius: '20px 0 0 20px' }} />}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', paddingLeft: isInProgress ? '8px' : 0 }}>

                  {/* Avatar + Patient */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '160px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: avatarColors[i % avatarColors.length], color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '8px', fontWeight: '700', opacity: 0.8, lineHeight: 1 }}>TOKEN</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', lineHeight: 1.3 }}>{apt.token}</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>{apt.patient}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {apt.age !== '—' && <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500' }}>{apt.age} yrs</span>}
                        <span style={{ fontSize: '11px', fontWeight: '700', background: tc.bg, color: tc.color, padding: '3px 9px', borderRadius: '20px' }}>{apt.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div style={{ flex: 2, minWidth: '150px', padding: '10px 14px', background: 'var(--gray-50)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gray-400)', margin: '0 0 4px', textTransform: 'uppercase' }}>Symptoms</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-700)', margin: 0 }}>{apt.symptoms}</p>
                  </div>

                  {/* Time */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>{apt.time}</p>
                    <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: '3px 0 0', fontWeight: '500' }}>{apt.date}</p>
                  </div>

                  {/* Status + Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                    <span className={`status-badge ${sc.cls}`}>{apt.status}</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>

                      {/* View */}
                      <button onClick={() => setViewApt(apt)} style={iconBtn('var(--blue-muted)', 'var(--blue)', 'var(--blue)')}>
                        👁 View
                      </button>

                      {/* Start → */}
                      {apt.status === 'Waiting' && (
                        <button
                          onClick={() => updateStatus(apt, 'In Progress')}
                          disabled={isUpdating}
                          style={iconBtn('var(--blue)', 'var(--blue)', 'white')}
                        >
                          {isUpdating ? '⏳' : 'Start →'}
                        </button>
                      )}

                      {/* Complete ✓ */}
                      {apt.status === 'In Progress' && (
                        <button
                          onClick={() => updateStatus(apt, 'Completed')}
                          disabled={isUpdating}
                          style={iconBtn('rgba(22,163,74,0.1)', 'rgba(22,163,74,0.3)', '#16a34a')}
                        >
                          {isUpdating ? '⏳' : 'Complete ✓'}
                        </button>
                      )}

                      {/* Cancel */}
                      {['Waiting', 'Scheduled', 'In Progress'].includes(apt.status) && (
                        <button
                          onClick={() => handleCancel(apt)}
                          disabled={isUpdating}
                          style={iconBtn('rgba(220,38,38,0.06)', 'rgba(220,38,38,0.25)', '#dc2626')}
                        >
                          {isUpdating ? '⏳' : '✕ Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;