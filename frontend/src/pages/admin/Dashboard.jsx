import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const statCards = (stats) => [
  { title:'Total Patients',       value: stats.totalPatients.toLocaleString(), icon:'👥',  change:'+12%', positive:true,  link:'/patients',     orange:false },
  { title:'Total Doctors',        value: stats.totalDoctors,                   icon:'🩺',  change:'+5%',  positive:true,  link:'/doctors',      orange:true  },
  { title:"Today's Appointments", value: stats.todayAppointments,              icon:'📅',  change:'+8%',  positive:true,  link:'/appointments', orange:false },
  { title:'Pending Bills',        value: stats.pendingBills,                   icon:'💰',  change:'-3%',  positive:false, link:'/billing',      orange:true  },
  { title:'Revenue (MTD)',        value:`$${stats.revenue.toLocaleString()}`,  icon:'💵',  change:'+18%', positive:true,  link:'/reports',      orange:false },
  { title:'Bed Occupancy',        value:`${stats.bedOccupancy}%`,              icon:'🛏️', change:'+2%',  positive:true,  link:'/departments',  orange:true  },
];

const quickActions = [
  { icon:'➕', label:'Register Patient', to:'/register-patient', bg:'#eff6ff',              color:'#1d4ed8' },
  { icon:'🩺', label:'Add Doctor',       to:'/doctors/new',      bg:'rgba(245,166,35,0.12)',color:'#92640a' },
  { icon:'📅', label:'Schedule Appt',   to:'/appointments/new', bg:'#eff6ff',              color:'#1d4ed8' },
  { icon:'📊', label:'View Reports',    to:'/reports',          bg:'rgba(245,166,35,0.12)',color:'#92640a' },
];

const statusCls = {
  'Completed':   'status-completed',
  'In Progress': 'status-pending',
  'Scheduled':   'status-active',
  'Cancelled':   'status-cancelled',
};

const avatarColors = ['#1e3a8a','#7c3aed','#0891b2','#059669','#dc2626'];

const today = new Date().toLocaleDateString('en-US', {
  weekday:'long', year:'numeric', month:'long', day:'numeric',
});

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients:0, totalDoctors:0, todayAppointments:0,
    pendingBills:0, revenue:0, bedOccupancy:78,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, apptRes] = await Promise.all([
        API.get('/stats'),
        API.get('/appointments'),
      ]);
      setStats({
        totalPatients:     statsRes.data.totalPatients     || 0,
        totalDoctors:      statsRes.data.totalDoctors      || 0,
        todayAppointments: statsRes.data.todayAppointments || 0,
        pendingBills:      statsRes.data.pendingBills      || 0,
        revenue:           statsRes.data.revenue           || 0,
        bedOccupancy:      78,
      });
      setAppointments(apptRes.data?.slice(0, 5) || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'320px' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'40px', marginBottom:'12px' }}>🏥</div>
        <p style={{ color:'#94a3b8', fontWeight:'500', fontSize:'14px' }}>Loading dashboard...</p>
      </div>
    </div>
  );

  const cards = statCards(stats);

  return (
    <>
      <style>{`
        .adm-dash { display:flex; flex-direction:column; gap:20px; }

        /* ── Page header ── */
        .adm-header {
          display:flex; justify-content:space-between;
          align-items:center; flex-wrap:wrap; gap:12px;
        }
        .adm-title      { font-size:22px; font-weight:700; color:#0f172a; margin:0; }
        .adm-title span { color:#f5a623; }
        .adm-date       { font-size:13px; color:#94a3b8; margin:4px 0 0; }

        /* ── Stat grid ── */
        .stats-grid {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:12px;
        }
        .stat-item {
          background:white; border-radius:16px;
          padding:16px; border:1px solid #e2e8f0;
          position:relative; overflow:hidden;
          transition:all 0.2s ease;
          text-decoration:none; display:block;
        }
        .stat-item:hover {
          transform:translateY(-3px);
          box-shadow:0 8px 24px rgba(0,0,0,0.09);
        }
        .stat-top { position:absolute; top:0; left:0; right:0; height:3px; border-radius:16px 16px 0 0; }
        .stat-icon-box {
          width:42px; height:42px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          font-size:18px; margin-bottom:12px;
        }
        .stat-val   { font-size:22px; font-weight:700; color:#0f172a; line-height:1; margin-bottom:3px; }
        .stat-lbl   { font-size:12px; font-weight:500; color:#94a3b8; margin-bottom:8px; }
        .stat-badge { display:inline-flex; align-items:center; gap:3px; font-size:11px; font-weight:600; padding:2px 8px; border-radius:20px; }

        /* ── Two column ── */
        .two-col { display:grid; grid-template-columns:1fr 300px; gap:16px; }

        /* ── Appointments card ── */
        .appt-card { background:white; border-radius:16px; padding:20px; border:1px solid #e2e8f0; }
        .card-hdr  { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:8px; }
        .card-ttl  { font-size:15px; font-weight:700; color:#0f172a; margin:0; }
        .card-sub  { font-size:12px; color:#94a3b8; margin:3px 0 0; }
        .view-all  { font-size:12px; font-weight:600; color:#1d4ed8; text-decoration:none; background:#eff6ff; padding:5px 12px; border-radius:20px; white-space:nowrap; }

        /* ── Appointment row ── */
        .appt-row  {
          display:flex; align-items:center; justify-content:space-between;
          padding:11px 14px; background:#f8fafc; border-radius:12px;
          border:1px solid #e2e8f0; transition:all 0.15s; gap:10px;
          margin-bottom:8px;
        }
        .appt-row:last-child { margin-bottom:0; }
        .appt-row:hover { border-color:#1e3a8a; background:#f0f4ff; }
        .appt-av   { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:15px; font-weight:700; flex-shrink:0; }
        .appt-name { font-size:14px; font-weight:600; color:#0f172a; margin:0; }
        .appt-doc  { font-size:12px; color:#94a3b8; margin:2px 0 0; }
        .appt-time { font-size:12px; font-weight:600; color:#475569; margin:0 0 5px; text-align:right; }

        /* ── Right col ── */
        .right-col { display:flex; flex-direction:column; gap:14px; }
        .right-card { background:white; border-radius:16px; padding:18px; border:1px solid #e2e8f0; }

        .qa-grid  { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .qa-item  {
          border-radius:12px; padding:14px 8px; text-align:center;
          text-decoration:none; display:flex; flex-direction:column;
          align-items:center; gap:6px; border:1px solid transparent;
          transition:all 0.15s;
        }
        .qa-item:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.08); }
        .qa-icon  { font-size:20px; line-height:1; }
        .qa-lbl   { font-size:11px; font-weight:600; line-height:1.3; }

        .emerg-card {
          background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%);
          border-radius:16px; padding:20px; text-align:center;
        }
        .emerg-label { color:rgba(255,255,255,0.55); font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px; }
        .emerg-num   { color:white; font-size:17px; font-weight:700; margin:0 0 4px; }
        .emerg-sub   { color:rgba(255,255,255,0.55); font-size:11px; margin:0; }

        .status-row { display:flex; justify-content:space-between; align-items:center; padding:9px 12px; border-radius:10px; margin-bottom:8px; }
        .status-row:last-child { margin-bottom:0; }
        .status-lbl { font-size:13px; font-weight:500; color:#334155; }
        .status-val { font-size:15px; font-weight:700; }

        /* ── Tablet ≤ 900px ── */
        @media (max-width:900px) {
          .stats-grid { grid-template-columns:repeat(2,1fr); }
          .two-col    { grid-template-columns:1fr; }
          .right-col  { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
          .adm-title  { font-size:19px; }
        }

        /* ── Mobile ≤ 540px ── */
        @media (max-width:540px) {
          .adm-dash   { gap:14px; }
          .stats-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
          .stat-item  { padding:13px 12px; border-radius:14px; }
          .stat-val   { font-size:19px; }
          .stat-lbl   { font-size:11px; }
          .stat-icon-box { width:36px; height:36px; font-size:16px; margin-bottom:8px; }
          .two-col    { grid-template-columns:1fr; }
          .right-col  { display:flex; flex-direction:column; gap:12px; }
          .appt-card  { padding:14px; }
          .appt-row   { padding:9px 11px; }
          .appt-name  { font-size:13px; }
          .appt-av    { width:34px; height:34px; font-size:13px; }
          .right-card { padding:14px; }
          .adm-title  { font-size:17px; }
          .emerg-num  { font-size:15px; }
        }

        /* ── Small phones ≤ 380px ── */
        @media (max-width:380px) {
          .stats-grid { gap:8px; }
          .stat-val   { font-size:17px; }
          .stat-badge { display:none; }
        }
      `}</style>

      <div className="adm-dash">

        {/* ── Header ── */}
        <div className="adm-header">
          <div>
            <h1 className="adm-title">Hospital <span>Overview</span></h1>
            <p className="adm-date">📅 {today}</p>
          </div>
          <Link to="/reports" className="btn-primary" style={{ textDecoration:'none', fontSize:'13px' }}>
            + Generate Report
          </Link>
        </div>

        {/* ── Stat cards ── */}
        <div className="stats-grid">
          {cards.map((card, i) => (
            <Link key={i} to={card.link} className="stat-item">
              <div className="stat-top" style={{ background: card.orange ? '#f5a623' : '#1e3a8a' }} />
              <div className="stat-icon-box" style={{ background: card.orange ? 'rgba(245,166,35,0.12)' : '#eff6ff' }}>
                {card.icon}
              </div>
              <div className="stat-val">{card.value}</div>
              <div className="stat-lbl">{card.title}</div>
              <span className="stat-badge" style={{
                color:      card.positive ? '#16a34a' : '#dc2626',
                background: card.positive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
              }}>
                {card.positive ? '▲' : '▼'} {card.change}
              </span>
            </Link>
          ))}
        </div>

        {/* ── Two column ── */}
        <div className="two-col">

          {/* Recent appointments */}
          <div className="appt-card">
            <div className="card-hdr">
              <div>
                <h2 className="card-ttl">Recent Appointments</h2>
                <p className="card-sub">Today's schedule overview</p>
              </div>
              <Link to="/appointments" className="view-all">View All →</Link>
            </div>

            {appointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <div className="empty-state-title">No appointments yet</div>
              </div>
            ) : (
              appointments.map((apt, i) => (
                <div key={apt.id} className="appt-row">
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', minWidth:0 }}>
                    <div className="appt-av" style={{ background: avatarColors[i % avatarColors.length] }}>
                      {apt.patient_name?.[0] || 'P'}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p className="appt-name">{apt.patient_name || 'Unknown'}</p>
                      <p className="appt-doc">{apt.doctor_name || 'Unknown Doctor'}</p>
                    </div>
                  </div>
                  <div style={{ flexShrink:0, textAlign:'right' }}>
                    <p className="appt-time">🕐 {apt.time}</p>
                    <span className={`status-badge ${statusCls[apt.status] || 'status-pending'}`}>
                      {apt.status || 'Scheduled'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right column */}
          <div className="right-col">

            {/* Quick actions */}
            <div className="right-card">
              <h3 className="card-ttl" style={{ marginBottom:'14px' }}>Quick Actions</h3>
              <div className="qa-grid">
                {quickActions.map(({ icon, label, to, bg, color }) => (
                  <Link key={to} to={to} className="qa-item" style={{ background:bg }}>
                    <span className="qa-icon">{icon}</span>
                    <span className="qa-lbl" style={{ color }}>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Emergency */}
            <div className="emerg-card">
              <p className="emerg-label">Emergency Line</p>
              <p className="emerg-num">🚨 +250 791 169 631</p>
              <p className="emerg-sub">Available 24/7</p>
            </div>

            {/* Hospital status */}
            <div className="right-card">
              <h3 className="card-ttl" style={{ marginBottom:'12px' }}>Hospital Status</h3>
              {[
                { label:'ICU Capacity',  value:'85%', color:'#dc2626', bg:'rgba(220,38,38,0.07)'  },
                { label:'OPD Waiting',   value:'12',  color:'#f5a623', bg:'rgba(245,166,35,0.1)'  },
                { label:'Staff On Duty', value:'34',  color:'#16a34a', bg:'rgba(22,163,74,0.08)'  },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="status-row" style={{ background:bg }}>
                  <span className="status-lbl">{label}</span>
                  <span className="status-val" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;
