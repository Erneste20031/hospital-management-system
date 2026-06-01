import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const statusConfig = {
  'Confirmed':  { cls: 'status-active',    color: '#16a34a'      },
  'Scheduled':  { cls: 'status-completed', color: 'var(--blue)'  },
  'Cancelled':  { cls: 'status-cancelled', color: '#dc2626'      },
};

const typeColors = {
  'Checkup':      { bg: 'var(--blue-muted)',       color: 'var(--blue)' },
  'Follow-up':    { bg: 'rgba(245,166,35,0.12)',   color: '#92640a'     },
  'Consultation': { bg: 'rgba(147,51,234,0.1)',    color: '#7c3aed'     },
  'Emergency':    { bg: 'rgba(220,38,38,0.1)',     color: '#dc2626'     },
};

const quickActions = [
  { icon: '📅', label: 'Book Appointment', to: '/book-appointment',  bg: 'var(--blue-muted)',       color: 'var(--blue)' },
  { icon: '📋', label: 'Medical History',  to: '/medical-history',   bg: 'rgba(245,166,35,0.12)',  color: '#92640a'     },
  { icon: '💊', label: 'Prescriptions',    to: '/medical-history',   bg: 'rgba(147,51,234,0.1)',   color: '#7c3aed'     },
  { icon: '💰', label: 'My Bills',         to: '/my-bills',          bg: 'rgba(22,163,74,0.08)',   color: '#16a34a'     },
];

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments,   setAppointments]   = useState([]);
  const [prescriptions,  setPrescriptions]  = useState([]);
  const [bills,          setBills]          = useState([]);
  const [medicalCount,   setMedicalCount]   = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments
      const appointmentsRes = await API.get('/appointments');
      setAppointments(appointmentsRes.data || []);
      
      // Fetch bills
      const billsRes = await API.get('/billing/my-bills');
      setBills(billsRes.data || []);
      
      // Fetch medical records count
      const medicalRes = await API.get('/medical/records');
      setMedicalCount(medicalRes.data?.length || 0);
      
      // For prescriptions - you'll need a prescriptions endpoint
      // For now using mock or extract from medical records
      const prescriptionsData = medicalRes.data?.flatMap(record => 
        record.prescription ? [{ 
          id: record.id, 
          medicine: record.prescription, 
          doctor: record.doctor_name || 'Dr. Unknown', 
          date: record.last_visit, 
          status: 'Active' 
        }] : []
      ) || [];
      setPrescriptions(prescriptionsData);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const unpaidTotal = bills.filter(b => b.status === 'Unpaid').reduce((s, b) => s + (b.totalAmount || 0), 0);

  const stats = [
    { title: 'Upcoming Appointments', value: appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').length, icon: '📅', orange: false, to: '/book-appointment'  },
    { title: 'Active Prescriptions',  value: prescriptions.length, icon: '💊', orange: false, to: '/medical-history'   },
    { title: 'Pending Bills',         value: `$${unpaidTotal}`,    icon: '💰', orange: true,  to: '/my-bills'          },
    { title: 'Medical Records',       value: medicalCount,         icon: '📋', orange: true,  to: '/medical-history'   },
  ];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '14px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '18px', height: '90px', border: '1.5px solid var(--gray-200)', opacity: 0.6 }} />
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: '20px', height: '340px', border: '1.5px solid var(--gray-200)', opacity: 0.6 }} />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1.5px solid #fecaca' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
      <p style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626' }}>{error}</p>
      <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '16px', fontSize: '13px' }}>Try Again</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
            Welcome back, <span style={{ color: 'var(--orange)' }}>{user?.name?.split(' ')[0] || 'Patient'} 👋</span>
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '5px', fontWeight: '500' }}>
            📅 {today}
          </p>
        </div>
        <Link
          to="/book-appointment"
          className="btn-primary"
          style={{ textDecoration: 'none', fontSize: '13px', padding: '10px 22px' }}
        >
          + Book Appointment
        </Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '16px' }}>
        {stats.map((s, i) => (
          <Link key={i} to={s.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white', borderRadius: '20px',
              padding: '20px', border: '1.5px solid var(--gray-200)',
              position: 'relative', overflow: 'hidden',
              transition: 'all 0.2s ease', height: '100%',
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
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-400)' }}>
                {s.title}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

        {/* Upcoming Appointments */}
        <div style={{
          background: 'white', borderRadius: '20px',
          padding: '24px', border: '1.5px solid var(--gray-200)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
                Upcoming Appointments
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '3px', fontWeight: '500' }}>
                Your next {appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').length} scheduled visits
              </p>
            </div>
            <Link to="/book-appointment" style={{
              fontSize: '12px', fontWeight: '700',
              color: 'var(--blue)', textDecoration: 'none',
              background: 'var(--blue-muted)',
              padding: '6px 14px', borderRadius: '20px',
            }}>
              Book New →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                No upcoming appointments
              </div>
            ) : (
              appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').slice(0, 5).map((apt, i) => (
                <div key={apt.id} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: i === 0 ? 'rgba(61,77,183,0.03)' : 'var(--gray-50)',
                  borderRadius: '14px',
                  border: `1.5px solid ${i === 0 ? 'var(--blue)' : 'var(--gray-200)'}`,
                  transition: 'all 0.15s ease',
                }}
                  onMouseEnter={e => {
                    if (i !== 0) {
                      e.currentTarget.style.borderColor = 'var(--blue)';
                      e.currentTarget.style.background = 'rgba(61,77,183,0.02)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (i !== 0) {
                      e.currentTarget.style.borderColor = 'var(--gray-200)';
                      e.currentTarget.style.background = 'var(--gray-50)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: i === 0 ? 'var(--blue)' : 'var(--gray-200)',
                      color: i === 0 ? 'white' : 'var(--gray-600)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '16px',
                      fontWeight: '800', flexShrink: 0,
                    }}>
                      {apt.doctorName?.split(' ')[1]?.[0] || apt.doctorName?.[0] || 'D'}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>
                        {apt.doctorName}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500' }}>
                          {apt.departmentName || apt.department || 'General'}
                        </span>
                        <span style={{ color: 'var(--gray-200)' }}>•</span>
                        <span style={{
                          fontSize: '11px', fontWeight: '700',
                          background: typeColors[apt.type]?.bg,
                          color: typeColors[apt.type]?.color,
                          padding: '2px 8px', borderRadius: '20px',
                        }}>
                          {apt.type || 'Checkup'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>
                      📅 {apt.date}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: 0, fontWeight: '500' }}>
                      🕐 {apt.time}
                    </p>
                    <span className={`status-badge ${statusConfig[apt.status]?.cls}`}>
                      {apt.status || 'Scheduled'}
                    </span>
                    <Link to="/book-appointment" style={{
                      fontSize: '11px', fontWeight: '700',
                      color: 'var(--orange)', background: 'rgba(245,166,35,0.1)',
                      padding: '3px 10px', borderRadius: '8px',
                      textDecoration: 'none',
                    }}>
                      Reschedule
                    </Link>
                  </div>
                </div>
              ))
            )}
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
                <Link key={to + label} to={to} style={{
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

          {/* Active Prescriptions */}
          <div style={{
            background: 'white', borderRadius: '20px',
            padding: '22px', border: '1.5px solid var(--gray-200)',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--gray-900)', margin: '0 0 14px 0' }}>
              Active Prescriptions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {prescriptions.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-400)', fontSize: '12px' }}>
                  No active prescriptions
                </p>
              ) : (
                prescriptions.map((p, i) => (
                  <div key={p.id || i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '12px',
                    background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                  }}>
                    <span style={{ fontSize: '18px' }}>💊</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>{p.medicine}</p>
                      <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: '2px 0 0', fontWeight: '500' }}>{p.doctor}</p>
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: '700',
                      background: 'rgba(22,163,74,0.1)', color: '#16a34a',
                      padding: '3px 8px', borderRadius: '20px',
                    }}>
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Bills Banner */}
          {unpaidTotal > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, var(--orange) 0%, #f97316 100%)',
              borderRadius: '20px', padding: '22px', textAlign: 'center',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Pending Payment
              </p>
              <p style={{ color: 'white', fontWeight: '800', fontSize: '22px', margin: '0 0 4px 0' }}>
                ${unpaidTotal}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: '0 0 14px', fontWeight: '500' }}>
                {bills.filter(b => b.status === 'Unpaid').length} unpaid bill(s)
              </p>
              <Link to="/my-bills" style={{
                display: 'inline-block',
                padding: '9px 24px', borderRadius: '40px',
                border: '1.5px solid rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.15)',
                color: 'white', fontSize: '12px', fontWeight: '700',
                textDecoration: 'none',
              }}>
                Pay Now →
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;