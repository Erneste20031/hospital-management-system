import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    pendingBills: 0,
    revenue: 0,
    bedOccupancy: 78
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // ✅ Single stats call now includes pendingBills — no need for /billing
      const [statsRes, appointmentsRes] = await Promise.all([
        API.get('/stats'),
        API.get('/appointments'),
      ]);

      setStats({
        totalPatients:     statsRes.data.totalPatients     || 0,
        totalDoctors:      statsRes.data.totalDoctors      || 0,
        todayAppointments: statsRes.data.todayAppointments || 0,
        pendingBills:      statsRes.data.pendingBills      || 0, // ✅ from /api/stats directly
        revenue:           statsRes.data.revenue           || 0,
        bedOccupancy: 78,
      });

      // ✅ Take only 5 most recent appointments
      setRecentAppointments(appointmentsRes.data?.slice(0, 5) || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Patients',       value: stats.totalPatients.toLocaleString(),  icon: '👥',  change: '+12%', positive: true,  link: '/patients',     orange: false },
    { title: 'Total Doctors',        value: stats.totalDoctors,                    icon: '👨‍⚕️', change: '+5%',  positive: true,  link: '/doctors',      orange: true  },
    { title: "Today's Appointments", value: stats.todayAppointments,               icon: '📅',  change: '+8%',  positive: true,  link: '/appointments', orange: false },
    { title: 'Pending Bills',        value: stats.pendingBills,                    icon: '💰',  change: '-3%',  positive: false, link: '/billing',      orange: true  },
    { title: 'Revenue (MTD)',        value: `$${stats.revenue.toLocaleString()}`,  icon: '💵',  change: '+18%', positive: true,  link: '/reports',      orange: false },
    { title: 'Bed Occupancy',        value: `${stats.bedOccupancy}%`,              icon: '🛏️', change: '+2%',  positive: true,  link: '/departments',  orange: true  },
  ];

  const statusConfig = {
    'Completed':   { cls: 'status-completed', dot: '#3D4DB7' },
    'In Progress': { cls: 'status-pending',   dot: '#F5A623' },
    'Scheduled':   { cls: 'status-active',    dot: '#16a34a' },
    'Cancelled':   { cls: 'status-cancelled', dot: '#dc2626' },
  };

  const avatarColors = [
    'var(--blue)', '#7c3aed', '#0891b2', '#059669', '#dc2626',
  ];

  const quickActions = [
    { icon: '➕', label: 'Register Patient', to: '/register-patient', bg: 'var(--blue-muted)',       color: 'var(--blue)' },
    { icon: '👨‍⚕️', label: 'Add Doctor',       to: '/doctors/new',      bg: 'rgba(245,166,35,0.12)', color: '#92640a'     },
    { icon: '📅', label: 'Schedule Appt',   to: '/appointments/new', bg: 'rgba(61,77,183,0.08)',  color: 'var(--blue)' },
    { icon: '📊', label: 'View Reports',    to: '/reports',          bg: 'rgba(245,166,35,0.12)', color: '#92640a'     },
  ];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏥</div>
          <p style={{ color: 'var(--gray-400)', fontWeight: '500' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Page Header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontSize: '26px',
            fontWeight: '800',
            color: 'var(--gray-900)',
            margin: 0,
            lineHeight: 1.2,
          }}>
            Hospital <span style={{ color: 'var(--orange)' }}>Overview</span>
          </h1>
          <p style={{
            color: 'var(--gray-400)',
            fontSize: '13px',
            marginTop: '5px',
            fontWeight: '500',
          }}>
            📅 {today}
          </p>
        </div>
        <Link
          to="/reports"
          className="btn-primary"
          style={{ textDecoration: 'none', fontSize: '13px', padding: '10px 22px' }}
        >
          + Generate Report
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px',
      }}>
        {statCards.map((card, i) => (
          <Link
            key={i}
            to={card.link}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '20px',
                border: '1.5px solid var(--gray-200)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(61,77,183,0.14)';
                e.currentTarget.style.borderColor = card.orange ? 'var(--orange)' : 'var(--blue)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--gray-200)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '4px',
                borderRadius: '20px 20px 0 0',
                background: card.orange ? 'var(--orange)' : 'var(--blue)',
              }} />

              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: card.orange ? 'rgba(245,166,35,0.12)' : 'var(--blue-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                marginBottom: '14px',
              }}>
                {card.icon}
              </div>

              <div style={{
                fontSize: '26px',
                fontWeight: '800',
                color: 'var(--gray-900)',
                lineHeight: 1,
                marginBottom: '4px',
              }}>
                {card.value}
              </div>

              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--gray-400)',
                marginBottom: '12px',
              }}>
                {card.title}
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '700',
                color: card.positive ? '#16a34a' : '#dc2626',
                background: card.positive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                padding: '3px 8px',
                borderRadius: '20px',
              }}>
                {card.positive ? '▲' : '▼'} {card.change} vs last month
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Two Column Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>

        {/* Recent Appointments */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          border: '1.5px solid var(--gray-200)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
                Recent Appointments
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '3px', fontWeight: '500' }}>
                Today's schedule overview
              </p>
            </div>
            <Link
              to="/appointments"
              style={{
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--blue)',
                textDecoration: 'none',
                background: 'var(--blue-muted)',
                padding: '6px 14px',
                borderRadius: '20px',
              }}
            >
              View All →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                No recent appointments
              </div>
            ) : (
              recentAppointments.map((apt, i) => (
                <div
                  key={apt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'var(--gray-50)',
                    borderRadius: '14px',
                    border: '1.5px solid var(--gray-200)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--blue)';
                    e.currentTarget.style.background = 'rgba(61,77,183,0.03)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                    e.currentTarget.style.background = 'var(--gray-50)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: avatarColors[i % avatarColors.length],
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      fontWeight: '800',
                      flexShrink: 0,
                    }}>
                      {/* ✅ Fixed: was apt.patientName — DB returns patient_name */}
                      {apt.patient_name?.[0] || 'P'}
                    </div>
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: 'var(--gray-900)',
                        margin: 0,
                        lineHeight: 1.3,
                      }}>
                        {/* ✅ Fixed: was apt.patientName — now shows real name */}
                        {apt.patient_name || 'Unknown'}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: 'var(--gray-400)',
                        margin: 0,
                        marginTop: '2px',
                        fontWeight: '500',
                      }}>
                        {/* ✅ Fixed: was apt.doctorName — now shows real doctor name */}
                        {apt.doctor_name || 'Unknown Doctor'}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--gray-600)',
                      margin: 0,
                      marginBottom: '5px',
                    }}>
                      🕐 {apt.time}
                    </p>
                    <span className={`status-badge ${statusConfig[apt.status]?.cls || 'status-pending'}`}>
                      {apt.status || 'Scheduled'}
                    </span>
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
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            border: '1.5px solid var(--gray-200)',
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '800',
              color: 'var(--gray-900)',
              margin: '0 0 16px 0',
            }}>
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {quickActions.map(({ icon, label, to, bg, color }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    background: bg,
                    borderRadius: '16px',
                    padding: '16px 10px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
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

          {/* Emergency Banner */}
          <div style={{
            background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)',
            borderRadius: '20px',
            padding: '22px 20px',
            textAlign: 'center',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              Emergency Line
            </p>
            <p style={{
              color: 'white',
              fontWeight: '800',
              fontSize: '18px',
              margin: '0 0 4px 0',
            }}>
              🚨  +250 791 169 631
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '11px',
              margin: 0,
              fontWeight: '500',
            }}>
              Available 24/7
            </p>
          </div>

          {/* Hospital Summary */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '20px',
            border: '1.5px solid var(--gray-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
              Hospital Status
            </h2>
            {[
              { label: 'ICU Capacity',  value: '85%', color: '#dc2626',      bg: 'rgba(220,38,38,0.08)'   },
              { label: 'OPD Waiting',   value: '12',  color: 'var(--orange)', bg: 'rgba(245,166,35,0.1)'  },
              { label: 'Staff On Duty', value: '34',  color: '#16a34a',      bg: 'rgba(22,163,74,0.08)'   },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: bg,
                borderRadius: '12px',
              }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-600)' }}>{label}</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color }}>{value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;