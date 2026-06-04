import React, { useContext, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const heroContent = {
  admin:        { title: 'Admin',    highlight: 'Dashboard',  subtitle: 'Manage your hospital operations from one place.' },
  doctor:       { title: 'Doctor',   highlight: 'Portal',     subtitle: 'View your appointments, records and prescriptions.' },
  patient:      { title: 'Your',     highlight: 'Health Hub', subtitle: 'Book appointments and track your medical history.' },
  receptionist: { title: 'Welcome,', highlight: '',           subtitle: 'Manage patient registrations and payments efficiently.' },
};

const SCROLL_THRESHOLD = 60;
const TRANSITION = '0.28s cubic-bezier(0.4,0,0.2,1)';

const Layout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [scrolled, setScrolled]   = useState(false);
  const [loading,  setLoading]    = useState(true);
  const [stats,    setStats]      = useState({ totalPatients:0, totalDoctors:0, todayAppointments:0, pendingBills:0 });
  const [doctorStats,      setDoctorStats]      = useState({ todayAppointments:0, myPatients:0, pendingRecords:0, prescriptions:0 });
  const [patientStats,     setPatientStats]     = useState({ upcomingAppointments:0, medicalRecords:0, activePrescriptions:0, unpaidBills:0 });
  const [receptionistStats,setReceptionistStats]= useState({ registeredToday:0, appointmentsToday:0, paymentsPending:0, roomsAvailable:3 });

  const scrolledRef = useRef(false);
  const rafRef      = useRef(null);

  useEffect(() => { fetchDashboardStats(); }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      if (user?.role === 'admin') {
        const [statsRes, billsRes] = await Promise.all([API.get('/stats'), API.get('/billing')]);
        setStats({
          totalPatients:      statsRes.data.totalPatients      || 0,
          totalDoctors:       statsRes.data.totalDoctors       || 0,
          todayAppointments:  statsRes.data.todayAppointments  || 0,
          pendingBills:       billsRes.data?.filter(b => b.status === 'Unpaid').length || 0,
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
    if (user?.role === 'admin')        return [
      { icon:'👥', value: stats.totalPatients.toLocaleString(), label:'Total Patients' },
      { icon:'👨‍⚕️', value: stats.totalDoctors,                  label:'Total Doctors' },
      { icon:'📅', value: stats.todayAppointments,              label:"Today's Appts" },
      { icon:'💰', value: stats.pendingBills,                   label:'Pending Bills' },
    ];
    if (user?.role === 'doctor')       return [
      { icon:'📅', value: doctorStats.todayAppointments, label:"Today's Appts" },
      { icon:'👥', value: doctorStats.myPatients,        label:'My Patients' },
      { icon:'📋', value: doctorStats.pendingRecords,    label:'Pending Records' },
      { icon:'💊', value: doctorStats.prescriptions,     label:'Prescriptions' },
    ];
    if (user?.role === 'patient')      return [
      { icon:'📅', value: patientStats.upcomingAppointments, label:'Upcoming' },
      { icon:'📋', value: patientStats.medicalRecords,       label:'Records' },
      { icon:'💊', value: patientStats.activePrescriptions,  label:'Prescriptions' },
      { icon:'💰', value: patientStats.unpaidBills,          label:'Unpaid Bills' },
    ];
    if (user?.role === 'receptionist') return [
      { icon:'👥', value: receptionistStats.registeredToday,   label:'Registered Today' },
      { icon:'📅', value: receptionistStats.appointmentsToday, label:'Appts Today' },
      { icon:'💰', value: receptionistStats.paymentsPending,   label:'Pending Pay' },
      { icon:'🏥', value: receptionistStats.roomsAvailable,    label:'Rooms Free' },
    ];
    return [];
  };

  const heroStats = getHeroStats();
  const hero      = heroContent[user?.role] || heroContent.admin;

  // Hero heights — smaller on mobile
  const HERO_FULL      = typeof window !== 'undefined' && window.innerWidth < 480 ? 220 : 280;
  const HERO_COLLAPSED = 64;
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
    return () => { window.removeEventListener('scroll', onScroll); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    scrolledRef.current = false;
    setScrolled(false);
  }, [location.pathname]);

  return (
    <>
      <style>{`
        body { overflow-y: scroll; margin: 0; }

        .layout-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }

        /* ── Fixed hero banner ── */
        .hero-banner {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          background: #1e3a8a;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.10);
          will-change: height;
          transition: height ${TRANSITION};
        }

        /* ── Hero body ── */
        .hero-body {
          max-width: 1100px;
          margin: 0 auto;
          padding: 10px 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          transition: opacity 0.18s ease;
        }

        .hero-title {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0;
          line-height: 1.2;
        }
        .hero-title span { color: #f5a623; }

        .hero-subtitle {
          color: rgba(255,255,255,0.72);
          font-size: 13px;
          margin: 5px 0 0;
          line-height: 1.5;
        }

        /* ── Stat cards row ── */
        .hero-stats {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }
        .stat-card {
          background: rgba(255,255,255,0.13);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 14px;
          padding: 10px 14px;
          min-width: 80px;
          text-align: center;
        }
        .stat-icon  { font-size: 16px; line-height: 1; }
        .stat-value { color: #fff; font-weight: 700; font-size: 18px; line-height: 1.2; margin-top: 2px; }
        .stat-label { color: rgba(255,255,255,0.65); font-size: 10px; margin-top: 2px; white-space: nowrap; }

        /* ── Curve ── */
        .hero-curve {
          position: absolute; bottom: -1px; left: 0;
          width: 100%; height: 60px; display: block;
          pointer-events: none;
        }

        /* ── Main content ── */
        .layout-main {
          flex: 1;
          padding: 24px 16px 56px;
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── Mobile: phones ≤ 480px ── */
        @media (max-width: 480px) {
          .hero-body      { padding: 8px 14px 0; gap: 10px; }
          .hero-title     { font-size: 20px; }
          .hero-subtitle  { font-size: 12px; }
          .hero-stats     { gap: 6px; }
          .stat-card      { padding: 8px 10px; min-width: 68px; border-radius: 10px; }
          .stat-icon      { font-size: 14px; }
          .stat-value     { font-size: 15px; }
          .stat-label     { font-size: 9px; }
          .layout-main    { padding: 16px 12px 48px; }
        }

        /* ── Tablet ── */
        @media (min-width: 481px) and (max-width: 768px) {
          .hero-title    { font-size: 24px; }
          .layout-main   { padding: 20px 16px 52px; }
        }
      `}</style>

      <div className="layout-root">

        {/* ── Fixed hero ── */}
        <div
          className="hero-banner"
          style={{ height: `${heroHeight}px` }}
        >
          {/* Navbar pill sits inside the hero */}
          <Navbar scrolled={scrolled} />

          {/* Hero body fades away on scroll */}
          <div
            className="hero-body"
            style={{ opacity: scrolled ? 0 : 1, pointerEvents: scrolled ? 'none' : 'auto' }}
          >
            {/* Left — title + subtitle */}
            <div>
              <h1 className="hero-title">
                {user?.role === 'receptionist' ? (
                  <>{hero.title} <span>{user?.name?.split(' ')[0] || 'User'} 👋</span></>
                ) : (
                  <>{hero.title} <span>{hero.highlight}</span></>
                )}
              </h1>
              <p className="hero-subtitle">{hero.subtitle}</p>
            </div>

            {/* Right — stat cards */}
            <div className="hero-stats">
              {heroStats.map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{loading ? '–' : s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Smooth curve blend */}
          <svg className="hero-curve" viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path
              d="M0,30 C240,70 480,0 720,35 C960,70 1200,10 1440,40 L1440,60 L0,60 Z"
              fill="#f8fafc"
            />
          </svg>
        </div>

        {/* ── Spacer mirrors hero height ── */}
        <div style={{ height: `${heroHeight}px`, flexShrink: 0, transition: `height ${TRANSITION}` }} />

        {/* ── Page content ── */}
        <main className="layout-main">
          <Outlet />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Layout;
