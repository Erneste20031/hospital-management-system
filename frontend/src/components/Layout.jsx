import React, { useContext, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const heroContent = {
  admin:        { title: 'Admin',    highlight: 'Dashboard',  subtitle: 'Manage your hospital operations from one place.', emoji: '🏥' },
  doctor:       { title: 'Doctor',   highlight: 'Portal',     subtitle: 'View your appointments, records and prescriptions.', emoji: '🩺' },
  patient:      { title: 'Your',     highlight: 'Health Hub', subtitle: 'Book appointments and track your medical history.', emoji: '💊' },
  receptionist: { title: 'Welcome,', highlight: '',           subtitle: 'Manage patient registrations and payments efficiently.', emoji: '👋' },
};

const SCROLL_THRESHOLD = 50;
const TRANSITION = '0.32s cubic-bezier(0.4,0,0.2,1)';

const Layout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [scrolled,          setScrolled]          = useState(false);
  const [loading,           setLoading]           = useState(true);
  const [stats,             setStats]             = useState({ totalPatients:0, totalDoctors:0, todayAppointments:0, pendingBills:0 });
  const [doctorStats,       setDoctorStats]       = useState({ todayAppointments:0, myPatients:0, pendingRecords:0, prescriptions:0 });
  const [patientStats,      setPatientStats]      = useState({ upcomingAppointments:0, medicalRecords:0, activePrescriptions:0, unpaidBills:0 });
  const [receptionistStats, setReceptionistStats] = useState({ registeredToday:0, appointmentsToday:0, paymentsPending:0, roomsAvailable:3 });

  const scrolledRef = useRef(false);
  const rafRef      = useRef(null);

  useEffect(() => { fetchDashboardStats(); }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      if (user?.role === 'admin') {
        const [statsRes, billsRes] = await Promise.all([API.get('/stats'), API.get('/billing')]);
        setStats({
          totalPatients:     statsRes.data.totalPatients     || 0,
          totalDoctors:      statsRes.data.totalDoctors      || 0,
          todayAppointments: statsRes.data.todayAppointments || 0,
          pendingBills:      billsRes.data?.filter(b => b.status === 'Unpaid').length || 0,
        });
      } else if (user?.role === 'doctor') {
        const [apptRes, medRes] = await Promise.all([API.get('/appointments'), API.get('/medical/records')]);
        const today = new Date().toISOString().split('T')[0];
        setDoctorStats({
          todayAppointments: apptRes.data?.filter(a => a.date === today).length || 0,
          myPatients:        medRes.data?.length || 0,
          pendingRecords:    medRes.data?.filter(r => r.status === 'Follow-up').length || 0,
          prescriptions:     medRes.data?.filter(r => r.prescription).length || 0,
        });
      } else if (user?.role === 'patient') {
        const [apptRes, medRes, billRes] = await Promise.all([API.get('/appointments'), API.get('/medical/records'), API.get('/billing/my-bills')]);
        const today = new Date().toISOString().split('T')[0];
        setPatientStats({
          upcomingAppointments: apptRes.data?.filter(a => a.date >= today && a.status !== 'Cancelled').length || 0,
          medicalRecords:       medRes.data?.length || 0,
          activePrescriptions:  medRes.data?.filter(r => r.status === 'Active').length || 0,
          unpaidBills:          billRes.data?.filter(b => b.status === 'Unpaid').length || 0,
        });
      } else if (user?.role === 'receptionist') {
        const [apptRes, patRes, billRes] = await Promise.all([API.get('/appointments'), API.get('/patients'), API.get('/billing')]);
        const today = new Date().toISOString().split('T')[0];
        setReceptionistStats({
          registeredToday:   patRes.data?.filter(p => p.created_at?.split('T')[0] === today).length || 0,
          appointmentsToday: apptRes.data?.filter(a => a.date === today).length || 0,
          paymentsPending:   billRes.data?.filter(b => b.status === 'Unpaid').length || 0,
          roomsAvailable:    3,
        });
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHeroStats = () => {
    if (user?.role === 'admin') return [
      { icon:'👥', value: stats.totalPatients.toLocaleString(), label:'Patients' },
      { icon:'🩺', value: stats.totalDoctors,                   label:'Doctors'  },
      { icon:'📅', value: stats.todayAppointments,              label:"Today"    },
      { icon:'💰', value: stats.pendingBills,                   label:'Pending'  },
    ];
    if (user?.role === 'doctor') return [
      { icon:'📅', value: doctorStats.todayAppointments, label:"Today"    },
      { icon:'👥', value: doctorStats.myPatients,        label:'Patients' },
      { icon:'📋', value: doctorStats.pendingRecords,    label:'Pending'  },
      { icon:'💊', value: doctorStats.prescriptions,     label:'Scripts'  },
    ];
    if (user?.role === 'patient') return [
      { icon:'📅', value: patientStats.upcomingAppointments, label:'Upcoming'  },
      { icon:'📋', value: patientStats.medicalRecords,       label:'Records'   },
      { icon:'💊', value: patientStats.activePrescriptions,  label:'Scripts'   },
      { icon:'💰', value: patientStats.unpaidBills,          label:'Bills'     },
    ];
    if (user?.role === 'receptionist') return [
      { icon:'👥', value: receptionistStats.registeredToday,   label:'Registered' },
      { icon:'📅', value: receptionistStats.appointmentsToday, label:'Appts'      },
      { icon:'💰', value: receptionistStats.paymentsPending,   label:'Pending'    },
      { icon:'🏥', value: receptionistStats.roomsAvailable,    label:'Rooms'      },
    ];
    return [];
  };

  const heroStats = getHeroStats();
  const hero      = heroContent[user?.role] || heroContent.admin;
  const isMobile  = typeof window !== 'undefined' && window.innerWidth < 480;

  const HERO_FULL      = isMobile ? 210 : 272;
  const HERO_COLLAPSED = 66;
  const heroHeight     = scrolled ? HERO_COLLAPSED : HERO_FULL;

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const next = window.scrollY > SCROLL_THRESHOLD;
        if (next !== scrolledRef.current) { scrolledRef.current = next; setScrolled(next); }
        rafRef.current = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    scrolledRef.current = false;
    setScrolled(false);
  }, [location.pathname]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { overflow-y: scroll; margin: 0; font-family: system-ui, -apple-system, sans-serif; }

        .layout-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f1f5f9;
        }

        /* ────────────────────────────────
           HERO BANNER
        ──────────────────────────────── */
        .hero-banner {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          overflow: hidden;
          will-change: height;
          transition: height ${TRANSITION};
          /* Rich blue gradient */
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
          /* Subtle dot pattern overlay */
          background-image:
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(245,166,35,0.08) 0%, transparent 40%),
            linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
          box-shadow: 0 4px 32px rgba(30,58,138,0.35);
        }

        /* Decorative circles in hero bg */
        .hero-deco {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.06;
        }
        .hero-deco-1 {
          width: 320px; height: 320px;
          background: white;
          top: -120px; right: -60px;
        }
        .hero-deco-2 {
          width: 180px; height: 180px;
          background: #f5a623;
          bottom: -80px; left: 10%;
        }

        /* ────────────────────────────────
           HERO BODY
        ──────────────────────────────── */
        .hero-body {
          max-width: 1100px;
          margin: 0 auto;
          padding: 10px 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          transition: opacity 0.2s ease, transform 0.2s ease;
          position: relative;
          z-index: 2;
        }

        .hero-left { flex: 1; min-width: 0; }

        .hero-greeting {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin: 0 0 4px;
        }

        .hero-title {
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          margin: 0;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hero-title span { color: #f5a623; }

        .hero-subtitle {
          color: rgba(255,255,255,0.65);
          font-size: 13px;
          margin: 6px 0 0;
          line-height: 1.5;
        }

        /* ────────────────────────────────
           STAT PILLS
        ──────────────────────────────── */
        .hero-stats {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .stat-pill {
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 16px;
          padding: 10px 14px;
          min-width: 76px;
          text-align: center;
          backdrop-filter: blur(8px);
          transition: background 0.2s, transform 0.2s;
          cursor: default;
        }
        .stat-pill:hover {
          background: rgba(255,255,255,0.16);
          transform: translateY(-2px);
        }
        .stat-pill-icon  { font-size: 15px; line-height: 1; }
        .stat-pill-value { color: #fff; font-weight: 700; font-size: 17px; line-height: 1.2; margin-top: 3px; }
        .stat-pill-label { color: rgba(255,255,255,0.6); font-size: 10px; margin-top: 2px; white-space: nowrap; }

        /* ────────────────────────────────
           CURVE BLEND
        ──────────────────────────────── */
        .hero-curve {
          position: absolute; bottom: -1px; left: 0;
          width: 100%; height: 56px; display: block;
          pointer-events: none; z-index: 3;
        }

        /* ────────────────────────────────
           SCROLL PROGRESS BAR
        ──────────────────────────────── */
        .scroll-bar {
          position: fixed;
          top: 0; left: 0;
          height: 3px;
          background: linear-gradient(90deg, #f5a623, #f59e0b);
          z-index: 9999;
          transition: width 0.1s linear;
          border-radius: 0 2px 2px 0;
        }

        /* ────────────────────────────────
           MAIN CONTENT
        ──────────────────────────────── */
        .layout-main {
          flex: 1;
          padding: 28px 20px 64px;
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ────────────────────────────────
           BACK-TO-TOP BUTTON
        ──────────────────────────────── */
        .back-to-top {
          position: fixed;
          bottom: 24px; right: 20px;
          width: 42px; height: 42px;
          border-radius: 50%;
          background: #1e3a8a;
          color: white; border: none;
          cursor: pointer; z-index: 100;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 16px rgba(30,58,138,0.35);
          transition: all 0.25s ease;
          opacity: 0; pointer-events: none;
        }
        .back-to-top.visible {
          opacity: 1; pointer-events: auto;
        }
        .back-to-top:hover {
          background: #1d4ed8;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(30,58,138,0.4);
        }

        /* ────────────────────────────────
           MOBILE ≤ 480px
        ──────────────────────────────── */
        @media (max-width: 480px) {
          .hero-body        { padding: 6px 14px 0; gap: 10px; flex-wrap: wrap; }
          .hero-greeting    { font-size: 10px; }
          .hero-title       { font-size: 18px; white-space: normal; }
          .hero-subtitle    { font-size: 11.5px; margin-top: 4px; }
          .hero-stats       { gap: 6px; width: 100%; justify-content: space-between; }
          .stat-pill        { padding: 8px 6px; min-width: 0; flex: 1; border-radius: 12px; }
          .stat-pill-icon   { font-size: 13px; }
          .stat-pill-value  { font-size: 14px; }
          .stat-pill-label  { font-size: 9px; }
          .layout-main      { padding: 16px 12px 52px; }
          .back-to-top      { bottom: 16px; right: 14px; width: 38px; height: 38px; font-size: 16px; }
        }

        /* ── Tablet 481–768px ── */
        @media (min-width: 481px) and (max-width: 768px) {
          .hero-title   { font-size: 22px; }
          .layout-main  { padding: 22px 18px 56px; }
          .stat-pill    { padding: 9px 10px; }
        }
      `}</style>

      <div className="layout-root">

        {/* ── Scroll progress bar ── */}
        <ScrollProgressBar />

        {/* ── Fixed hero banner ── */}
        <div className="hero-banner" style={{ height: `${heroHeight}px` }}>

          {/* Decorative bg circles */}
          <div className="hero-deco hero-deco-1" />
          <div className="hero-deco hero-deco-2" />

          {/* Navbar */}
          <Navbar scrolled={scrolled} />

          {/* Hero body — fades on scroll */}
          <div
            className="hero-body"
            style={{
              opacity:       scrolled ? 0 : 1,
              transform:     scrolled ? 'translateY(-6px)' : 'translateY(0)',
              pointerEvents: scrolled ? 'none' : 'auto',
            }}
          >
            {/* Left */}
            <div className="hero-left">
              <p className="hero-greeting">
                {new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}
              </p>
              <h1 className="hero-title">
                {user?.role === 'receptionist' ? (
                  <>{hero.title} <span>{user?.name?.split(' ')[0] || 'User'} {hero.emoji}</span></>
                ) : (
                  <>{hero.title} <span>{hero.highlight}</span></>
                )}
              </h1>
              <p className="hero-subtitle">{hero.subtitle}</p>
            </div>

            {/* Right — stat pills */}
            <div className="hero-stats">
              {heroStats.map((s, i) => (
                <div key={i} className="stat-pill">
                  <div className="stat-pill-icon">{s.icon}</div>
                  <div className="stat-pill-value">{loading ? '–' : s.value}</div>
                  <div className="stat-pill-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Curve blend into page */}
          <svg className="hero-curve" viewBox="0 0 1440 56" preserveAspectRatio="none">
            <path
              d="M0,28 C180,60 360,0 540,28 C720,56 900,8 1080,32 C1260,56 1380,16 1440,28 L1440,56 L0,56 Z"
              fill="#f1f5f9"
            />
          </svg>
        </div>

        {/* ── Spacer ── */}
        <div style={{ height:`${heroHeight}px`, flexShrink:0, transition:`height ${TRANSITION}` }} />

        {/* ── Page content ── */}
        <main className="layout-main">
          <Outlet />
        </main>

        <Footer />

        {/* ── Back to top button ── */}
        <BackToTop scrolled={scrolled} />
      </div>
    </>
  );
};

/* ── Scroll progress bar component ── */
const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const el  = document.documentElement;
      const pct = (window.scrollY / (el.scrollHeight - el.clientHeight)) * 100;
      setProgress(isNaN(pct) ? 0 : Math.min(pct, 100));
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <div
      className="scroll-bar"
      style={{ width: `${progress}%` }}
    />
  );
};

/* ── Back to top component ── */
const BackToTop = ({ scrolled }) => (
  <button
    className={`back-to-top${scrolled ? ' visible' : ''}`}
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    title="Back to top"
    aria-label="Back to top"
  >
    ↑
  </button>
);

export default Layout;
