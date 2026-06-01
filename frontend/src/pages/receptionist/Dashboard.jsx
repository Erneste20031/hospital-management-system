import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusConfig = {
  'Checked In':  { bg: 'var(--blue-muted)',      color: 'var(--blue)',  dot: 'var(--blue)'  },
  'In Progress': { bg: 'rgba(22,163,74,0.10)',   color: '#16a34a',     dot: '#16a34a'       },
  'Waiting':     { bg: 'rgba(245,166,35,0.12)',  color: '#92640a',     dot: '#f59e0b'       },
  'Scheduled':   { bg: 'var(--gray-100)',        color: 'var(--gray-500)', dot: 'var(--gray-400)' },
  'Cancelled':   { bg: 'rgba(220,38,38,0.08)',   color: '#dc2626',     dot: '#dc2626'       },
};

const typeColors = {
  'Checkup':      { bg: 'var(--blue-muted)',      color: 'var(--blue)' },
  'Follow-up':    { bg: 'rgba(245,166,35,0.12)', color: '#92640a'     },
  'Consultation': { bg: 'rgba(147,51,234,0.1)',  color: '#7c3aed'     },
  'Emergency':    { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626'     },
};

const quickActions = [
  { icon: '👤', label: 'Register Patient',     to: '/register-patient', bg: 'var(--blue-muted)',      color: 'var(--blue)' },
  { icon: '📅', label: 'Schedule Appointment', to: '/appointments',     bg: 'rgba(245,166,35,0.12)', color: '#92640a'     },
  { icon: '💰', label: 'Process Payment',      to: '/payments',         bg: 'rgba(22,163,74,0.10)',  color: '#16a34a'     },
  { icon: '🔍', label: 'Search Patient',       to: '/patients',         bg: 'rgba(124,58,237,0.1)',  color: '#7c3aed'     },
];

// ── Live Clock ────────────────────────────────────────────────────────────────

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
};

// ── Appointment Row ───────────────────────────────────────────────────────────

const AppointmentRow = ({ appt, onStatusChange }) => {
  const sc = statusConfig[appt.status] || statusConfig['Scheduled'];
  const tc = typeColors[appt.type] || typeColors['Checkup'];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '13px 16px', borderRadius: '14px',
      border: `1.5px solid ${appt.status === 'Waiting' ? '#f59e0b44' : appt.status === 'In Progress' ? '#16a34a33' : 'var(--gray-200)'}`,
      background: appt.status === 'Waiting' ? 'rgba(245,166,35,0.03)' : appt.status === 'In Progress' ? 'rgba(22,163,74,0.03)' : 'white',
      transition: 'all 0.15s ease',
    }}>
      <div style={{ minWidth: '72px', textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gray-900)' }}>{appt.time}</div>
        {appt.waitMins > 0 && (
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#f59e0b', marginTop: '2px' }}>
            ⏱ {appt.waitMins}m wait
          </div>
        )}
      </div>

      <div style={{ width: '1px', height: '36px', background: 'var(--gray-200)', flexShrink: 0 }} />

      <div style={{
        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
        background: appt.deptColor || '#3D4DB7', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: '800',
      }}>{appt.avatar || appt.patientName?.charAt(0) || 'P'}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {appt.patientName || appt.patient}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500' }}>{appt.doctorName || appt.doctor}</span>
          <span style={{ color: 'var(--gray-300)' }}>·</span>
          <span style={{ fontSize: '10px', fontWeight: '700', background: appt.deptBg || 'rgba(61,77,183,0.08)', color: appt.deptColor || '#3D4DB7', padding: '1px 6px', borderRadius: '20px' }}>
            {appt.departmentIcon || '🏥'} {appt.departmentName || appt.dept}
          </span>
          <span style={{ fontSize: '10px', fontWeight: '700', background: tc.bg, color: tc.color, padding: '1px 6px', borderRadius: '20px' }}>
            {appt.type}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{
          fontSize: '10px', fontWeight: '700',
          background: sc.bg, color: sc.color,
          padding: '4px 10px', borderRadius: '20px',
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
          {appt.status}
        </span>
        {appt.status === 'Scheduled' && (
          <button
            onClick={() => onStatusChange(appt.id, 'Checked In')}
            style={{
              fontSize: '10px', fontWeight: '700',
              background: 'var(--blue-muted)', color: 'var(--blue)',
              border: 'none', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer',
            }}
          >Check In</button>
        )}
        {appt.status === 'Checked In' && (
          <button
            onClick={() => onStatusChange(appt.id, 'In Progress')}
            style={{
              fontSize: '10px', fontWeight: '700',
              background: 'rgba(22,163,74,0.1)', color: '#16a34a',
              border: 'none', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer',
            }}
          >Start</button>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const ReceptionistDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apptFilter, setApptFilter] = useState('All');
  const [paidToast, setPaidToast] = useState(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch today's appointments
      const appointmentsRes = await API.get('/appointments');
      const todayDate = new Date().toISOString().split('T')[0];
      const todayAppointments = appointmentsRes.data.filter(a => a.date === todayDate);
      setAppointments(todayAppointments);
      
      // Fetch recent registrations (patients registered today)
      const patientsRes = await API.get('/patients');
      const todayPatients = patientsRes.data.filter(p => {
        const createdDate = p.created_at?.split('T')[0];
        return createdDate === todayDate;
      });
      setRegistrations(todayPatients);
      
      // Fetch pending payments
      const billsRes = await API.get('/billing');
      const pendingBills = billsRes.data.filter(b => b.status === 'Unpaid');
      setPayments(pendingBills);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/appointments/${id}/status`, { status: newStatus });
      // Refresh appointments
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating appointment status:', err);
    }
  };

  const handlePayment = async (billNumber) => {
    try {
      await API.post(`/billing/pay/${billNumber}`, { method: 'card' });
      setPaidToast(`Payment processed successfully!`);
      setTimeout(() => setPaidToast(null), 3500);
      fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Payment failed. Please try again.');
    }
  };

  const apptFilters = ['All', 'Waiting', 'Checked In', 'In Progress', 'Scheduled'];
  const visibleAppts = appointments.filter(a => apptFilter === 'All' || a.status === apptFilter);

  const checkedIn = appointments.filter(a => a.status === 'Checked In').length;
  const inProgress = appointments.filter(a => a.status === 'In Progress').length;
  const waiting = appointments.filter(a => a.status === 'Waiting').length;
  const pendingAmt = payments.reduce((s, p) => s + (p.totalAmount || 0), 0);

  const stats = [
    { title: "Today's Appointments", value: appointments.length, icon: '📅', color: 'var(--blue)', sub: `${checkedIn} checked in` },
    { title: 'Currently Waiting', value: waiting + inProgress, icon: '⏳', color: '#f59e0b', sub: `${inProgress} in progress` },
    { title: "Registrations Today", value: registrations.length, icon: '👤', color: '#16a34a', sub: `${registrations.filter(r => r.status === 'Active').length} new patients` },
    { title: 'Pending Payments', value: `$${pendingAmt}`, icon: '💰', color: 'var(--orange)', sub: `${payments.length} invoice(s)` },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1.5px solid #fecaca' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
        <p style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '16px', fontSize: '13px' }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {paidToast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 999,
          background: '#16a34a', color: 'white',
          padding: '14px 22px', borderRadius: '16px',
          fontSize: '13px', fontWeight: '700',
          boxShadow: '0 8px 24px rgba(22,163,74,0.35)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>✅ {paidToast}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, <span style={{ color: 'var(--blue)' }}>Reception 👋</span>
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '5px', fontWeight: '500' }}>
            📅 {today} &nbsp;·&nbsp; 🕐 <LiveClock />
          </p>
        </div>
        <Link to="/register-patient" className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px', padding: '10px 22px' }}>
          + Register Patient
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '16px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '20px', padding: '20px',
            border: '1.5px solid var(--gray-200)',
            position: 'relative', overflow: 'hidden',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', borderRadius: '20px 20px 0 0', background: s.color }} />
            <div style={{ fontSize: '22px', marginBottom: '12px' }}>{s.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--gray-900)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-400)', margin: '4px 0 6px' }}>{s.title}</div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: s.color }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '12px' }}>
        {quickActions.map(({ icon, label, to, bg, color }) => (
          <Link key={to} to={to} style={{
            background: bg, borderRadius: '18px', padding: '18px 14px',
            textAlign: 'center', textDecoration: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
            border: '1.5px solid transparent', transition: 'all 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{ fontSize: '26px', lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: '12px', fontWeight: '800', color, lineHeight: 1.3 }}>{label}</span>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

        <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid var(--gray-200)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1.5px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>Today's Queue</h2>
                <p style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500', marginTop: '3px' }}>
                  {appointments.length} appointments · {waiting} waiting
                </p>
              </div>
              <Link to="/appointments" style={{
                fontSize: '12px', fontWeight: '700', color: 'var(--blue)',
                textDecoration: 'none', background: 'var(--blue-muted)',
                padding: '6px 14px', borderRadius: '20px',
              }}>View All →</Link>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {apptFilters.map(f => {
                const count = f === 'All' ? appointments.length : appointments.filter(a => a.status === f).length;
                return (
                  <button key={f} onClick={() => setApptFilter(f)} style={{
                    padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                    border: `2px solid ${apptFilter === f ? 'var(--blue)' : 'var(--gray-200)'}`,
                    background: apptFilter === f ? 'var(--blue)' : 'white',
                    color: apptFilter === f ? 'white' : 'var(--gray-500)',
                    cursor: 'pointer', outline: 'none',
                  }}>
                    {f} {count > 0 && <span style={{ opacity: 0.75 }}>({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '480px', overflowY: 'auto' }}>
            {visibleAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
                <p style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>No appointments in this category</p>
              </div>
            ) : (
              visibleAppts.map(appt => (
                <AppointmentRow key={appt.id} appt={appt} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid var(--gray-200)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>Registrations</h3>
              <Link to="/register-patient" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--blue)', textDecoration: 'none', background: 'var(--blue-muted)', padding: '4px 10px', borderRadius: '20px' }}>
                + New
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {registrations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-400)' }}>
                  No registrations today
                </div>
              ) : (
                registrations.slice(0, 5).map(r => (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '12px',
                    background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                  }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                      background: '#3D4DB7', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: '800',
                    }}>{r.first_name?.charAt(0) || 'P'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {r.first_name} {r.last_name}
                        {r.status === 'Active' && (
                          <span style={{ fontSize: '9px', fontWeight: '700', background: 'var(--blue-muted)', color: 'var(--blue)', padding: '1px 5px', borderRadius: '20px' }}>NEW</span>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: '500', marginTop: '2px' }}>
                        🏥 {r.department || 'General'} · {r.created_at?.split('T')[0] || today}
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gray-400)' }}>ID: {r.id}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid var(--gray-200)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>Pending Payments</h3>
              <span style={{
                fontSize: '11px', fontWeight: '800',
                background: 'rgba(245,166,35,0.12)', color: '#92640a',
                padding: '4px 10px', borderRadius: '20px',
              }}>${pendingAmt} due</span>
            </div>

            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gray-400)' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>✅</div>
                <p style={{ fontSize: '12px', fontWeight: '600', margin: 0 }}>All payments cleared!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {payments.slice(0, 5).map(p => (
                  <div key={p.id} style={{
                    padding: '10px 12px', borderRadius: '12px',
                    border: '1.5px solid rgba(245,166,35,0.25)',
                    background: 'rgba(245,166,35,0.04)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: '#3D4DB7', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '9px', fontWeight: '800', flexShrink: 0,
                        }}>{p.patient_name?.charAt(0) || 'P'}</div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gray-900)' }}>{p.patient_name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: '500' }}>{p.description}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--orange)' }}>${p.total_amount || p.amount}</div>
                        <div style={{ fontSize: '9px', color: '#dc2626', fontWeight: '700' }}>Due: {p.due_date || 'Today'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePayment(p.bill_number || p.id)}
                      style={{
                        width: '100%', padding: '6px', borderRadius: '8px',
                        background: 'var(--orange)', border: 'none',
                        color: 'white', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                      }}
                    >💳 Collect Payment</button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;