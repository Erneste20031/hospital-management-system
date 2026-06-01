import React, { useContext, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

// ── Hero content per role ─────────────────────────────────────────────────────

const heroContent = {
  admin: {
    title: 'Admin', highlight: 'Dashboard',
    subtitle: 'Manage your hospital operations from one place.',
  },
  doctor: {
    title: 'Doctor', highlight: 'Portal',
    subtitle: 'View your appointments, records and prescriptions.',
  },
  patient: {
    title: 'Your', highlight: 'Health Hub',
    subtitle: 'Book appointments and track your medical history.',
  },
  receptionist: {
    title: 'Welcome,', highlight: '',
    subtitle: 'Manage patient registrations and payments efficiently.',
  },
};

// ── Constants ─────────────────────────────────────────────────────────────────

const HERO_FULL       = 300;
const HERO_COLLAPSED  = 76;
const SCROLL_THRESHOLD = 60;
const TRANSITION = '0.28s cubic-bezier(0.4,0,0.2,1)';

// ── Layout ────────────────────────────────────────────────────────────────────

const Layout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    pendingBills: 0,
    revenue: 0
  });
  const [doctorStats, setDoctorStats] = useState({
    todayAppointments: 0,
    myPatients: 0,
    pendingRecords: 0,
    prescriptions: 0
  });
  const [patientStats, setPatientStats] = useState({
    upcomingAppointments: 0,
    medicalRecords: 0,
    activePrescriptions: 0,
    unpaidBills: 0
  });
  const [receptionistStats, setReceptionistStats] = useState({
    registeredToday: 0,
    appointmentsToday: 0,
    paymentsPending: 0,
    roomsAvailable: 3
  });
  const [loading, setLoading] = useState(true);

  const scrolledRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'admin') {
        // Fetch admin stats
        const statsRes = await API.get('/stats');
        
        // Fetch pending bills count
        const billsRes = await API.get('/billing');
        const pendingBills = billsRes.data?.filter(bill => bill.status === 'Unpaid').length || 0;
        
        setStats({
          totalPatients: statsRes.data.totalPatients || 0,
          totalDoctors: statsRes.data.totalDoctors || 0,
          todayAppointments: statsRes.data.todayAppointments || 0,
          pendingBills: pendingBills,
          revenue: statsRes.data.revenue || 0
        });
      } 
      else if (user?.role === 'doctor') {
        // Fetch doctor stats
        const appointmentsRes = await API.get('/appointments');
        const medicalRes = await API.get('/medical/records');
        
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = appointmentsRes.data?.filter(a => a.date === today).length || 0;
        const myPatients = medicalRes.data?.length || 0;
        const prescriptions = medicalRes.data?.filter(r => r.prescription).length || 0;
        
        setDoctorStats({
          todayAppointments: todayAppts,
          myPatients: myPatients,
          pendingRecords: medicalRes.data?.filter(r => r.status === 'Follow-up').length || 0,
          prescriptions: prescriptions
        });
      }
      else if (user?.role === 'patient') {
        // Fetch patient stats
        const appointmentsRes = await API.get('/appointments');
        const medicalRes = await API.get('/medical/records');
        const billsRes = await API.get('/billing/my-bills');
        
        const today = new Date().toISOString().split('T')[0];
        const upcoming = appointmentsRes.data?.filter(a => a.date >= today && a.status !== 'Cancelled').length || 0;
        const medicalRecords = medicalRes.data?.length || 0;
        const activePrescriptions = medicalRes.data?.filter(r => r.status === 'Active').length || 0;
        const unpaidBills = billsRes.data?.filter(b => b.status === 'Unpaid').length || 0;
        
        setPatientStats({
          upcomingAppointments: upcoming,
          medicalRecords: medicalRecords,
          activePrescriptions: activePrescriptions,
          unpaidBills: unpaidBills
        });
      }
      else if (user?.role === 'receptionist') {
        // Fetch receptionist stats
        const appointmentsRes = await API.get('/appointments');
        const patientsRes = await API.get('/patients');
        const billsRes = await API.get('/billing');
        
        const today = new Date().toISOString().split('T')[0];
        const registeredToday = patientsRes.data?.filter(p => p.created_at?.split('T')[0] === today).length || 0;
        const appointmentsToday = appointmentsRes.data?.filter(a => a.date === today).length || 0;
        const pendingPayments = billsRes.data?.filter(b => b.status === 'Unpaid').length || 0;
        
        setReceptionistStats({
          registeredToday: registeredToday,
          appointmentsToday: appointmentsToday,
          paymentsPending: pendingPayments,
          roomsAvailable: 3
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get stats based on role
  const getHeroStats = () => {
    if (user?.role === 'admin') {
      return [
        { icon: '👥', value: stats.totalPatients.toLocaleString(), label: 'Total Patients' },
        { icon: '👨‍⚕️', value: stats.totalDoctors, label: 'Total Doctors' },
        { icon: '📅', value: stats.todayAppointments, label: "Today's Appts" },
        { icon: '💰', value: stats.pendingBills, label: 'Pending Bills' },
      ];
    } 
    else if (user?.role === 'doctor') {
      return [
        { icon: '📅', value: doctorStats.todayAppointments, label: "Today's Appointments" },
        { icon: '👥', value: doctorStats.myPatients, label: 'My Patients' },
        { icon: '📋', value: doctorStats.pendingRecords, label: 'Pending Records' },
        { icon: '💊', value: doctorStats.prescriptions, label: 'Prescriptions' },
      ];
    }
    else if (user?.role === 'patient') {
      return [
        { icon: '📅', value: patientStats.upcomingAppointments, label: 'Upcoming Appointments' },
        { icon: '📋', value: patientStats.medicalRecords, label: 'Medical Records' },
        { icon: '💊', value: patientStats.activePrescriptions, label: 'Active Prescriptions' },
        { icon: '💰', value: patientStats.unpaidBills, label: 'Unpaid Bills' },
      ];
    }
    else if (user?.role === 'receptionist') {
      return [
        { icon: '👥', value: receptionistStats.registeredToday, label: 'Registered Today' },
        { icon: '📅', value: receptionistStats.appointmentsToday, label: 'Appointments Today' },
        { icon: '💰', value: receptionistStats.paymentsPending, label: 'Payments Pending' },
        { icon: '🏥', value: receptionistStats.roomsAvailable, label: 'Rooms Available' },
      ];
    }
    return [
      { icon: '👥', value: '0', label: 'Total Patients' },
      { icon: '👨‍⚕️', value: '0', label: 'Total Doctors' },
      { icon: '📅', value: '0', label: "Today's Appts" },
      { icon: '💰', value: '0', label: 'Pending Bills' },
    ];
  };

  const heroStats = getHeroStats();
  const hero = heroContent[user?.role] || heroContent.admin;
  const heroHeight = scrolled ? HERO_COLLAPSED : HERO_FULL;

  // Optimized scroll listener with RAF — smooth, no jank
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      
      rafRef.current = requestAnimationFrame(() => {
        const next = window.scrollY > SCROLL_THRESHOLD;
        if (next !== scrolledRef.current) {
          scrolledRef.current = next;
          setScrolled(next);
        }
        rafRef.current = null;
      });
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Reset on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    scrolledRef.current = false;
    setScrolled(false);
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gray-50)' }}>

      {/* Fixed hero */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        background: 'var(--blue)',
        height: `${heroHeight}px`,
        transition: `height ${TRANSITION}`,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        willChange: 'height',
        contain: 'layout style paint',
      }}>

        {/* Navbar — receives scrolled, owns no scroll listener */}
        <Navbar scrolled={scrolled} />

        {/* Hero body fades out as it collapses */}
        <div style={{
          opacity: scrolled ? 0 : 1,
          transition: 'opacity 0.18s ease',
          pointerEvents: scrolled ? 'none' : 'auto',
        }}>
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '12px 20px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '24px',
            flexWrap: 'wrap',
          }}>
            <div>
              <h1 style={{ fontSize: '34px', fontWeight: '800', color: 'white', margin: 0, lineHeight: 1.2 }}>
                {user?.role === 'receptionist' ? (
                  <>{hero.title} <span style={{ color: 'var(--orange)' }}>{user?.name?.split(' ')[0] || 'User'} 👋</span></>
                ) : (
                  <>{hero.title} <span style={{ color: 'var(--orange)' }}>{hero.highlight}</span></>
                )}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginTop: '6px' }}>
                {hero.subtitle}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
              {heroStats.map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: '16px',
                  padding: '10px 16px',
                  minWidth: '88px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.15)',
                  willChange: 'transform',
                }}>
                  <div style={{ fontSize: '18px' }}>{s.icon}</div>
                  <div style={{ color: 'white', fontWeight: '800', fontSize: '16px', lineHeight: 1.2 }}>{loading ? '...' : s.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Curve blending into page background */}
          <svg viewBox="0 0 1440 80" style={{
            position: 'absolute', bottom: -1, left: 0,
            width: '100%', height: '70px', display: 'block',
            pointerEvents: 'none',
            willChange: 'opacity',
          }} preserveAspectRatio="none">
            <path
              d="M0,40 C240,90 480,0 720,45 C960,90 1200,20 1440,55 L1440,80 L0,80 Z"
              fill="var(--gray-50)"
            />
          </svg>
        </div>
      </div>

      {/* Spacer — mirrors hero height so content sits below the fixed banner */}
      <div style={{
        height: `${heroHeight}px`,
        flexShrink: 0,
        transition: `height ${TRANSITION}`,
        willChange: 'height',
      }} />

      {/* Page content */}
      <main style={{
        flex: 1,
        padding: '28px 12px 56px',
        maxWidth: '1100px',
        width: '100%',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
        contain: 'layout style',
      }}>
        <Outlet />
      </main>

      <Footer />

      <style>{`
        body {
          overflow-y: scroll;
        }
      `}</style>
    </div>
  );
};

export default Layout;