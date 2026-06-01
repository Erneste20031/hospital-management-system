import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import appointmentService from '../../services/appointmentsService';
import doctorService from '../../services/doctorService';
import { AuthContext } from '../../context/AuthContext';

const mockAppointments = [
  { id: 1, time: '09:00 AM', patient: 'John Doe',      age: 45, type: 'Checkup',      status: 'Waiting',      token: 'A101' },
  { id: 2, time: '10:30 AM', patient: 'Jane Smith',    age: 32, type: 'Follow-up',    status: 'In Progress',  token: 'A102' },
  { id: 3, time: '11:00 AM', patient: 'Robert Brown',  age: 28, type: 'Consultation', status: 'Scheduled',    token: 'A103' },
  { id: 4, time: '02:00 PM', patient: 'Maria Garcia',  age: 52, type: 'Emergency',    status: 'Scheduled',    token: 'A104' },
];

const statusConfig = {
  'Waiting':     { cls: 'status-pending',   color: '#92640a'     },
  'In Progress': { cls: 'status-active',    color: '#166534'     },
  'Scheduled':   { cls: 'status-completed', color: 'var(--blue)' },
  'Done':        { cls: 'status-completed', color: 'var(--blue)' },
};

const typeColors = {
  'Checkup':      { bg: 'var(--blue-muted)',       color: 'var(--blue)'  },
  'Follow-up':    { bg: 'rgba(245,166,35,0.12)',   color: '#92640a'      },
  'Consultation': { bg: 'rgba(147,51,234,0.1)',    color: '#7c3aed'      },
  'Emergency':    { bg: 'rgba(220,38,38,0.1)',     color: '#dc2626'      },
};

const avatarColors = ['#3D4DB7', '#7c3aed', '#0891b2', '#059669', '#dc2626'];

const quickActions = [
  { icon: '📋', label: 'Medical Records',  to: '/medical-records',          bg: 'var(--blue-muted)',        color: 'var(--blue)' },
  { icon: '💊', label: 'Prescriptions',    to: '/prescriptions',            bg: 'rgba(245,166,35,0.12)',   color: '#92640a'     },
  { icon: '📅', label: 'My Appointments',  to: '/doctor/appointments',      bg: 'rgba(147,51,234,0.1)',    color: '#7c3aed'     },
  { icon: '👤', label: 'My Profile',       to: '/profile',                  bg: 'rgba(22,163,74,0.08)',    color: '#16a34a'     },
];

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [status,       setStatus]       = useState('Available');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.status) {
      setStatus(user.status);
    }
  }, [user]);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getTodayByDoctor();
      const formatted = res.data.map((apt, index) => ({
        ...apt,
        token: apt.token || `A${101 + index}`
      }));
      setAppointments(formatted);
    } catch (err) {
      console.error(err);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const handleStartAppointment = async (id) => {
    try {
      await appointmentService.updateStatus(id, 'In Progress');
      await fetchTodayAppointments();
    } catch (err) {
      console.error(err);
      alert('Failed to start appointment');
    }
  };

  const toggleAvailability = async () => {
    if (!user?.doctorId) return;
    const nextStatus = status === 'Available' ? 'Busy' : 'Available';
    try {
      await doctorService.updateStatus(user.doctorId, nextStatus);
      setStatus(nextStatus);
    } catch (err) {
      console.error(err);
      alert('Failed to update availability status.');
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const stats = [
    { title: "Today's Patients", value: appointments.length.toString(),    icon: '👥', change: '+3',   positive: true,  orange: false },
    { title: 'Total Patients',   value: (user?.patients_count || 1247).toString(), icon: '📊', change: '+45',  positive: true,  orange: false },
    { title: 'Pending Reports',  value: appointments.filter(a => a.status === 'Waiting').length.toString(),     icon: '📋', change: '-2',   positive: false, orange: true  },
    { title: 'My Rating',        value: (user?.rating || 4.8).toString(),   icon: '⭐', change: '+0.2', positive: true,  orange: true  },
  ];

  // ── Loading Skeleton ──
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '14px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '18px', height: '90px',
            border: '1.5px solid var(--gray-200)', opacity: 0.6,
          }} />
        ))}
      </div>
      <div style={{
        background: 'white', borderRadius: '20px', height: '380px',
        border: '1.5px solid var(--gray-200)', opacity: 0.6,
      }} />
    </div>
  );

  // ── Error State ──
  if (error) return (
    <div style={{
      textAlign: 'center', padding: '60px 20px',
      background: 'white', borderRadius: '20px',
      border: '1.5px solid #fecaca',
    }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
      <p style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626' }}>{error}</p>
      <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '16px', fontSize: '13px' }}>
        Try Again
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
            Good morning, <span style={{ color: 'var(--orange)' }}>{user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Dr. Sarah'} 👋</span>
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '5px', fontWeight: '500' }}>
            📅 {today}
          </p>
        </div>
        <Link
          to="/doctor/appointments"
          className="btn-primary"
          style={{ textDecoration: 'none', fontSize: '13px', padding: '10px 22px' }}
        >
          + New Appointment
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '16px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '20px',
            padding: '20px', border: '1.5px solid var(--gray-200)',
            position: 'relative', overflow: 'hidden',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(61,77,183,0.12)';
              e.currentTarget.style.borderColor = s.orange ? 'var(--orange)' : 'var(--blue)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--gray-200)';
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: '4px', borderRadius: '20px 20px 0 0',
              background: s.orange ? 'var(--orange)' : 'var(--blue)',
            }} />
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: s.orange ? 'rgba(245,166,35,0.12)' : 'var(--blue-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', marginBottom: '14px',
            }}>
              {s.icon}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', lineHeight: 1, marginBottom: '4px' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-400)', marginBottom: '10px' }}>
              {s.title}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', fontWeight: '700',
              color: s.positive ? '#16a34a' : '#dc2626',
              background: s.positive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
              padding: '3px 8px', borderRadius: '20px',
            }}>
              {s.positive ? '▲' : '▼'} {s.change} this week
            </div>
          </div>
        ))}
      </div>

      {/* ── Two Column Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

        {/* Today's Schedule */}
        <div style={{
          background: 'white', borderRadius: '20px',
          padding: '24px', border: '1.5px solid var(--gray-200)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
                Today's Schedule
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '3px', fontWeight: '500' }}>
                {appointments.length} appointments today
              </p>
            </div>
            <Link to="/doctor/appointments" style={{
              fontSize: '12px', fontWeight: '700',
              color: 'var(--blue)', textDecoration: 'none',
              background: 'var(--blue-muted)',
              padding: '6px 14px', borderRadius: '20px',
            }}>
              View All →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {appointments.map((apt, i) => (
              <div
                key={apt.id}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: apt.status === 'In Progress'
                    ? 'rgba(61,77,183,0.04)'
                    : 'var(--gray-50)',
                  borderRadius: '14px',
                  border: `1.5px solid ${apt.status === 'In Progress' ? 'var(--blue)' : 'var(--gray-200)'}`,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (apt.status !== 'In Progress') {
                    e.currentTarget.style.borderColor = 'var(--blue)';
                    e.currentTarget.style.background = 'rgba(61,77,183,0.03)';
                  }
                }}
                onMouseLeave={e => {
                  if (apt.status !== 'In Progress') {
                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                    e.currentTarget.style.background = 'var(--gray-50)';
                  }
                }}
              >
                {/* Left — Token + Patient */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: avatarColors[i % avatarColors.length],
                    color: 'white', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '9px', fontWeight: '700', opacity: 0.8, lineHeight: 1 }}>TOKEN</span>
                    <span style={{ fontSize: '11px', fontWeight: '800', lineHeight: 1.2 }}>{apt.token}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>
                      {apt.patient}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500' }}>
                        {apt.age} yrs
                      </span>
                      <span style={{ color: 'var(--gray-200)', fontSize: '12px' }}>•</span>
                      <span style={{
                        fontSize: '11px', fontWeight: '700',
                        background: typeColors[apt.type]?.bg || 'var(--gray-100)',
                        color: typeColors[apt.type]?.color || 'var(--gray-600)',
                        padding: '2px 8px', borderRadius: '20px',
                      }}>
                        {apt.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right — Time + Status + Action */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gray-700)', margin: 0 }}>
                    🕐 {apt.time}
                  </p>
                  <span className={`status-badge ${statusConfig[apt.status]?.cls}`}>
                    {apt.status}
                  </span>
                  {apt.status === 'Waiting' && (
                    <button
                      onClick={() => handleStartAppointment(apt.id)}
                      style={{
                        fontSize: '11px', fontWeight: '700',
                        background: 'var(--blue)', color: 'white',
                        border: 'none', borderRadius: '8px',
                        padding: '4px 10px', cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Start →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Quick Actions */}
          <div style={{
            background: 'white', borderRadius: '20px',
            padding: '22px', border: '1.5px solid var(--gray-200)',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gray-900)', margin: '0 0 16px 0' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {quickActions.map(({ icon, label, to, bg, color }) => (
                <Link key={to} to={to} style={{
                  background: bg, borderRadius: '16px',
                  padding: '16px 10px', textAlign: 'center',
                  textDecoration: 'none', transition: 'all 0.15s ease',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '8px',
                  border: '1.5px solid transparent',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = color;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '22px', lineHeight: 1 }}>{icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color, lineHeight: 1.3 }}>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Today's Summary */}
          <div style={{
            background: 'white', borderRadius: '20px',
            padding: '22px', border: '1.5px solid var(--gray-200)',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--gray-900)', margin: '0 0 14px 0' }}>
              Today's Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Waiting',     value: appointments.filter(a => a.status === 'Waiting').length,     color: '#92640a',    bg: 'rgba(245,166,35,0.1)'   },
                { label: 'In Progress', value: appointments.filter(a => a.status === 'In Progress').length, color: '#16a34a',    bg: 'rgba(22,163,74,0.08)'   },
                { label: 'Scheduled',   value: appointments.filter(a => a.status === 'Scheduled').length,   color: 'var(--blue)', bg: 'var(--blue-muted)'      },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: bg, borderRadius: '12px',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-600)' }}>{label}</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div style={{
            background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)',
            borderRadius: '20px', padding: '22px', textAlign: 'center',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Your Status
            </p>
            <p style={{ color: 'white', fontWeight: '800', fontSize: '16px', margin: '0 0 14px 0' }}>
              {status === 'Available' ? '🟢' : '🔴'} {status}
            </p>
            <button
              onClick={toggleAvailability}
              style={{
                padding: '9px 24px', borderRadius: '40px',
                border: '1.5px solid rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.12)',
                color: 'white', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
              {status === 'Available' ? 'Set Unavailable' : 'Set Available'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;