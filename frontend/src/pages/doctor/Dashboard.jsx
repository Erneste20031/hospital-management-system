import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import appointmentService from '../../services/appointmentsService';
import doctorService from '../../services/doctorService';
import { AuthContext } from '../../context/AuthContext';

const statusConfig = {
  'Waiting':     { cls: 'status-pending'   },
  'In Progress': { cls: 'status-active'    },
  'Scheduled':   { cls: 'status-completed' },
  'Done':        { cls: 'status-completed' },
};

const typeColors = {
  'Checkup':      { bg: '#eff6ff',              color: '#1d4ed8' },
  'Follow-up':    { bg: 'rgba(245,166,35,0.12)', color: '#92640a' },
  'Consultation': { bg: 'rgba(147,51,234,0.1)',  color: '#7c3aed' },
  'Emergency':    { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626' },
};

const avatarColors = ['#1e3a8a','#7c3aed','#0891b2','#059669','#dc2626'];

const quickActions = [
  { icon:'📋', label:'Medical Records', to:'/medical-records',     bg:'#eff6ff',              color:'#1d4ed8' },
  { icon:'💊', label:'Prescriptions',   to:'/prescriptions',       bg:'rgba(245,166,35,0.12)',color:'#92640a' },
  { icon:'📅', label:'Appointments',    to:'/doctor/appointments', bg:'rgba(147,51,234,0.1)', color:'#7c3aed' },
  { icon:'👤', label:'My Profile',      to:'/profile',             bg:'rgba(22,163,74,0.08)', color:'#16a34a' },
];

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [status,       setStatus]       = useState('Available');

  useEffect(() => { if (user?.status) setStatus(user.status); }, [user]);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getTodayByDoctor();
      setAppointments(res.data.map((apt, i) => ({ ...apt, token: apt.token || `A${101+i}` })));
    } catch (err) {
      console.error(err);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTodayAppointments(); }, []);

  const handleStartAppointment = async (id) => {
    try {
      await appointmentService.updateStatus(id, 'In Progress');
      await fetchTodayAppointments();
    } catch { alert('Failed to start appointment'); }
  };

  const toggleAvailability = async () => {
    if (!user?.doctorId) return;
    const next = status === 'Available' ? 'Busy' : 'Available';
    try {
      await doctorService.updateStatus(user.doctorId, next);
      setStatus(next);
    } catch { alert('Failed to update status.'); }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday:'long', year:'numeric', month:'long', day:'numeric',
  });

  const stats = [
    { title:"Today's Patients", value: appointments.length.toString(),                                          icon:'👥', change:'+3',   positive:true,  orange:false },
    { title:'Total Patients',   value: (user?.patients_count||1247).toString(),                                 icon:'📊', change:'+45',  positive:true,  orange:false },
    { title:'Pending Reports',  value: appointments.filter(a=>a.status==='Waiting').length.toString(),          icon:'📋', change:'-2',   positive:false, orange:true  },
    { title:'My Rating',        value: (user?.rating||4.8).toString(),                                          icon:'⭐', change:'+0.2', positive:true,  orange:true  },
  ];

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px' }}>
        {[...Array(4)].map((_,i) => (
          <div key={i} style={{ background:'white', borderRadius:'16px', height:'90px', border:'1px solid #e5e7eb', opacity:0.6 }} />
        ))}
      </div>
      <div style={{ background:'white', borderRadius:'16px', height:'300px', border:'1px solid #e5e7eb', opacity:0.6 }} />
    </div>
  );

  if (error) return (
    <div style={{ textAlign:'center', padding:'48px 20px', background:'white', borderRadius:'16px', border:'1px solid #fecaca' }}>
      <div style={{ fontSize:'36px', marginBottom:'12px' }}>⚠️</div>
      <p style={{ fontSize:'15px', fontWeight:'600', color:'#dc2626' }}>{error}</p>
      <button onClick={()=>window.location.reload()} style={{ marginTop:'16px', padding:'9px 20px', borderRadius:'30px', border:'none', background:'#1e3a8a', color:'white', fontWeight:'600', cursor:'pointer', fontSize:'13px', fontFamily:'inherit' }}>
        Try Again
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        .doc-dash { display:flex; flex-direction:column; gap:20px; }

        /* Page header */
        .doc-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
        .doc-title  { font-size:22px; font-weight:700; color:#111827; margin:0; }
        .doc-title span { color:#f5a623; }
        .doc-date   { color:#9ca3af; font-size:13px; margin:4px 0 0; }
        .doc-new-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:10px 18px; border-radius:30px;
          background:#1e3a8a; color:white;
          font-size:13px; font-weight:600;
          text-decoration:none; border:none;
          cursor:pointer; font-family:inherit;
          transition:all 0.2s; white-space:nowrap;
          flex-shrink:0;
        }
        .doc-new-btn:hover { background:#163069; transform:translateY(-1px); }

        /* Stat cards */
        .stats-grid {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:12px;
        }
        .stat-card {
          background:white; border-radius:16px;
          padding:18px 16px; border:1px solid #e5e7eb;
          position:relative; overflow:hidden;
          transition:all 0.2s ease;
        }
        .stat-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.08); }
        .stat-top-bar { position:absolute; top:0; left:0; right:0; height:3px; border-radius:16px 16px 0 0; }
        .stat-icon-box { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; margin-bottom:12px; }
        .stat-value { font-size:24px; font-weight:700; color:#111827; line-height:1; margin-bottom:3px; }
        .stat-title { font-size:12px; font-weight:500; color:#6b7280; margin-bottom:8px; }
        .stat-badge { display:inline-flex; align-items:center; gap:3px; font-size:11px; font-weight:600; padding:2px 8px; border-radius:20px; }

        /* Two-col layout */
        .two-col { display:grid; grid-template-columns:1fr 280px; gap:16px; }

        /* Schedule card */
        .schedule-card { background:white; border-radius:16px; padding:20px; border:1px solid #e5e7eb; }
        .card-header   { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:8px; }
        .card-title    { font-size:15px; font-weight:700; color:#111827; margin:0; }
        .card-sub      { font-size:12px; color:#9ca3af; margin:3px 0 0; }
        .view-all-btn  { font-size:12px; font-weight:600; color:#1d4ed8; text-decoration:none; background:#eff6ff; padding:5px 12px; border-radius:20px; white-space:nowrap; }

        /* Appointment row */
        .appt-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:12px 14px; border-radius:12px;
          border:1px solid #e5e7eb; background:#f9fafb;
          transition:all 0.15s; gap:10px;
        }
        .appt-row:hover { border-color:#1e3a8a; background:#f0f4ff; }
        .appt-row.active-row { border-color:#1e3a8a; background:#f0f4ff; }
        .appt-left  { display:flex; align-items:center; gap:10px; min-width:0; }
        .appt-token { width:42px; height:42px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; }
        .appt-token-label { font-size:8px; font-weight:700; opacity:0.8; color:white; line-height:1; }
        .appt-token-val   { font-size:11px; font-weight:700; color:white; line-height:1.2; }
        .appt-name  { font-size:14px; font-weight:600; color:#111827; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .appt-meta  { display:flex; align-items:center; gap:6px; margin-top:3px; flex-wrap:wrap; }
        .appt-age   { font-size:11px; color:#9ca3af; }
        .appt-type  { font-size:11px; font-weight:600; padding:2px 8px; border-radius:20px; }
        .appt-right { display:flex; flex-direction:column; align-items:flex-end; gap:5px; flex-shrink:0; }
        .appt-time  { font-size:12px; font-weight:600; color:#374151; white-space:nowrap; }
        .start-btn  {
          font-size:11px; font-weight:600; background:#1e3a8a;
          color:white; border:none; border-radius:8px;
          padding:4px 10px; cursor:pointer; font-family:inherit;
          transition:background 0.15s;
        }
        .start-btn:hover { background:#163069; }

        /* Right col */
        .right-col { display:flex; flex-direction:column; gap:14px; }
        .right-card { background:white; border-radius:16px; padding:18px; border:1px solid #e5e7eb; }

        /* Quick actions grid */
        .qa-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .qa-item  {
          border-radius:12px; padding:14px 8px; text-align:center;
          text-decoration:none; display:flex; flex-direction:column;
          align-items:center; gap:6px; border:1px solid transparent;
          transition:all 0.15s;
        }
        .qa-item:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.08); }
        .qa-icon  { font-size:20px; line-height:1; }
        .qa-label { font-size:11px; font-weight:600; line-height:1.3; }

        /* Summary rows */
        .summary-row { display:flex; justify-content:space-between; align-items:center; padding:9px 12px; border-radius:10px; }
        .summary-label { font-size:13px; font-weight:500; color:#374151; }
        .summary-val   { font-size:16px; font-weight:700; }

        /* Status card */
        .status-card { background:#1e3a8a; border-radius:16px; padding:20px; text-align:center; }
        .status-label { color:rgba(255,255,255,0.6); font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px; }
        .status-val   { color:white; font-size:16px; font-weight:700; margin:0 0 14px; }
        .toggle-btn   {
          padding:9px 22px; border-radius:30px;
          border:1.5px solid rgba(255,255,255,0.4);
          background:rgba(255,255,255,0.12);
          color:white; font-size:13px; font-weight:600;
          cursor:pointer; font-family:inherit; transition:all 0.2s;
        }
        .toggle-btn:hover { background:rgba(255,255,255,0.22); }

        /* Status badges */
        .s-badge { display:inline-flex; align-items:center; font-size:11px; font-weight:600; padding:3px 9px; border-radius:20px; }
        .s-pending   { background:rgba(245,166,35,0.15); color:#92640a; }
        .s-active    { background:rgba(22,163,74,0.1);   color:#16a34a; }
        .s-completed { background:#eff6ff;               color:#1d4ed8; }

        /* ── Tablet ── */
        @media (max-width:900px) {
          .stats-grid { grid-template-columns:repeat(2,1fr); }
          .two-col    { grid-template-columns:1fr; }
          .right-col  { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
          .doc-title  { font-size:19px; }
        }

        /* ── Mobile ── */
        @media (max-width:540px) {
          .stats-grid  { grid-template-columns:repeat(2,1fr); gap:10px; }
          .stat-card   { padding:14px 12px; }
          .stat-value  { font-size:20px; }
          .stat-title  { font-size:11px; }
          .two-col     { grid-template-columns:1fr; }
          .right-col   { display:flex; flex-direction:column; gap:12px; }
          .schedule-card { padding:16px; }
          .appt-row    { padding:10px 12px; }
          .appt-name   { font-size:13px; }
          .appt-token  { width:36px; height:36px; }
          .doc-title   { font-size:17px; }
          .right-card  { padding:14px; }
          .qa-grid     { gap:6px; }
          .qa-item     { padding:12px 6px; }
        }
      `}</style>

      <div className="doc-dash">

        {/* ── Header ── */}
        <div className="doc-header">
          <div>
            <h1 className="doc-title">
              Good morning, <span>
                {user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Dr. Sarah'} 👋
              </span>
            </h1>
            <p className="doc-date">📅 {today}</p>
          </div>
          <Link to="/doctor/appointments" className="doc-new-btn">
            + New Appointment
          </Link>
        </div>

        {/* ── Stat cards ── */}
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-top-bar" style={{ background: s.orange ? '#f5a623' : '#1e3a8a' }} />
              <div className="stat-icon-box" style={{ background: s.orange ? 'rgba(245,166,35,0.12)' : '#eff6ff' }}>
                {s.icon}
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-title">{s.title}</div>
              <span className="stat-badge" style={{
                color:       s.positive ? '#16a34a' : '#dc2626',
                background:  s.positive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
              }}>
                {s.positive ? '▲' : '▼'} {s.change} this week
              </span>
            </div>
          ))}
        </div>

        {/* ── Two-col ── */}
        <div className="two-col">

          {/* Today's schedule */}
          <div className="schedule-card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Today's Schedule</h2>
                <p className="card-sub">{appointments.length} appointments today</p>
              </div>
              <Link to="/doctor/appointments" className="view-all-btn">View All →</Link>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {appointments.map((apt, i) => (
                <div
                  key={apt.id}
                  className={`appt-row${apt.status === 'In Progress' ? ' active-row' : ''}`}
                >
                  <div className="appt-left">
                    <div className="appt-token" style={{ background: avatarColors[i % avatarColors.length] }}>
                      <span className="appt-token-label">TOKEN</span>
                      <span className="appt-token-val">{apt.token}</span>
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p className="appt-name">{apt.patient}</p>
                      <div className="appt-meta">
                        <span className="appt-age">{apt.age} yrs</span>
                        <span style={{ color:'#e5e7eb' }}>•</span>
                        <span className="appt-type" style={{
                          background: typeColors[apt.type]?.bg || '#f3f4f6',
                          color:      typeColors[apt.type]?.color || '#6b7280',
                        }}>
                          {apt.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="appt-right">
                    <span className="appt-time">🕐 {apt.time}</span>
                    <span className={`s-badge s-${
                      apt.status === 'Waiting' ? 'pending' :
                      apt.status === 'In Progress' ? 'active' : 'completed'
                    }`}>
                      {apt.status}
                    </span>
                    {apt.status === 'Waiting' && (
                      <button className="start-btn" onClick={() => handleStartAppointment(apt.id)}>
                        Start →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="right-col">

            {/* Quick actions */}
            <div className="right-card">
              <h3 className="card-title" style={{ marginBottom:'14px' }}>Quick Actions</h3>
              <div className="qa-grid">
                {quickActions.map(({ icon, label, to, bg, color }) => (
                  <Link key={to} to={to} className="qa-item" style={{ background: bg }}>
                    <span className="qa-icon">{icon}</span>
                    <span className="qa-label" style={{ color }}>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Today's summary */}
            <div className="right-card">
              <h3 className="card-title" style={{ marginBottom:'12px' }}>Today's Summary</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {[
                  { label:'Waiting',     value: appointments.filter(a=>a.status==='Waiting').length,     color:'#92640a', bg:'rgba(245,166,35,0.1)'  },
                  { label:'In Progress', value: appointments.filter(a=>a.status==='In Progress').length, color:'#16a34a', bg:'rgba(22,163,74,0.08)'  },
                  { label:'Scheduled',   value: appointments.filter(a=>a.status==='Scheduled').length,   color:'#1d4ed8', bg:'#eff6ff'               },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className="summary-row" style={{ background: bg }}>
                    <span className="summary-label">{label}</span>
                    <span className="summary-val" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="status-card">
              <p className="status-label">Your Status</p>
              <p className="status-val">{status === 'Available' ? '🟢' : '🔴'} {status}</p>
              <button className="toggle-btn" onClick={toggleAvailability}>
                {status === 'Available' ? 'Set Unavailable' : 'Set Available'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default DoctorDashboard;
