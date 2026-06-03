import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const navLinks = {
  admin: [
    { label: 'Dashboard',    path: '/dashboard',    icon: '📊' },
    { label: 'Doctors',      path: '/doctors',      icon: '🩺' },
    { label: 'Patients',     path: '/patients',     icon: '👥' },
    { label: 'Departments',  path: '/departments',  icon: '🏢' },
    { label: 'Appointments', path: '/appointments', icon: '📅' },
    { label: 'Reports',      path: '/reports',      icon: '📈' },
  ],
  receptionist: [
    { label: 'Dashboard',    path: '/dashboard',        icon: '📊' },
    { label: 'Register',     path: '/register-patient', icon: '📝' },
    { label: 'Payments',     path: '/payments',         icon: '💳' },
    { label: 'Appointments', path: '/appointments',     icon: '📅' },
  ],
  doctor: [
    { label: 'Dashboard',     path: '/dashboard',           icon: '📊' },
    { label: 'Appointments',  path: '/doctor/appointments', icon: '📅' },
    { label: 'Records',       path: '/medical-records',     icon: '📋' },
    { label: 'Prescriptions', path: '/prescriptions',       icon: '💊' },
  ],
  patient: [
    { label: 'Dashboard', path: '/dashboard',       icon: '📊' },
    { label: 'Book',      path: '/book-appointment', icon: '📅' },
    { label: 'History',   path: '/medical-history',  icon: '📋' },
    { label: 'Bills',     path: '/my-bills',          icon: '💳' },
  ],
};

const Navbar = ({ scrolled = false }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;
  const links = navLinks[user?.role] || navLinks.admin;

  return (
    <>
      <style>{`
        .nav-pill {
          width: 100%;
          max-width: 1100px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px 0 22px;
          border-radius: 40px;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(12px);
          box-shadow: ${scrolled ? '0 8px 24px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.06)'};
          border: 1.5px solid rgba(255,255,255,0.9);
          transition: box-shadow 0.28s ease;
          gap: 8px;
        }
        .nav-desktop-links { display: flex; gap: 2px; align-items: center; flex: 1; justify-content: center; }
        .nav-link-item {
          padding: 6px 11px; border-radius: 10px; font-size: 12.5px;
          font-weight: 600; color: #4b5563; text-decoration: none;
          white-space: nowrap; transition: all 0.15s;
        }
        .nav-link-item:hover { background: rgba(0,0,0,0.05); color: #111827; }
        .nav-link-item.active { background: rgba(245,158,11,0.12); color: var(--orange); }
        .nav-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .nav-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: #1e3a8a; border: 2px solid #e5e7eb;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 13px; font-weight: 700; flex-shrink: 0;
        }
        .nav-user-info { display: flex; flex-direction: column; gap: 2px; }
        .nav-user-name { font-size: 13px; font-weight: 700; color: #1f2937; line-height: 1; }
        .nav-user-role {
          font-size: 10px; font-weight: 700; color: var(--orange);
          background: rgba(245,166,35,0.15); padding: 2px 7px;
          border-radius: 20px; line-height: 1.5; text-transform: capitalize;
          width: fit-content;
        }
        .nav-logout {
          padding: 7px 16px; border-radius: 40px; border: none;
          cursor: pointer; font-size: 12px; font-weight: 700;
          background: var(--orange); color: white; font-family: inherit;
          flex-shrink: 0; transition: all 0.2s;
        }
        .nav-logout:hover { background: var(--orange-dark); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(245,166,35,0.35); }
        .nav-hamburger {
          display: none; background: none;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          width: 38px; height: 38px; align-items: center;
          justify-content: center; cursor: pointer; font-size: 20px;
          color: #4b5563; flex-shrink: 0; transition: all 0.15s;
        }
        .nav-hamburger:hover { background: #f3f4f6; border-color: #d1d5db; }
        .nav-mobile-menu {
          position: absolute; top: calc(100% - 4px);
          left: 16px; right: 16px; margin-top: 8px;
          background: white; border-radius: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 20px 50px rgba(0,0,0,0.12);
          padding: 10px; z-index: 1000;
          animation: slideDown 0.18s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 12px; font-size: 14px;
          font-weight: 500; color: #374151; text-decoration: none;
          transition: all 0.15s;
        }
        .mobile-nav-link:hover { background: #f9fafb; }
        .mobile-nav-link.active { background: rgba(245,158,11,0.1); color: var(--orange); font-weight: 700; }
        .mobile-nav-link .link-icon { font-size: 18px; width: 22px; text-align: center; }
        .mobile-divider { height: 1px; background: #f3f4f6; margin: 8px 0; }
        .mobile-user-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; }
        .mobile-logout-btn {
          width: 100%; padding: 12px; border-radius: 12px;
          border: none; cursor: pointer; font-size: 14px;
          font-weight: 700; background: var(--orange); color: white;
          font-family: inherit; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 4px;
        }
        .mobile-logout-btn:hover { background: var(--orange-dark); }
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-right .nav-user-info,
          .nav-right .nav-avatar,
          .nav-logout { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-pill { height: 54px; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: scrolled ? '8px 16px' : '14px 16px 0',
        transition: 'padding 0.28s ease',
        position: 'relative',
      }}>
        <div className="nav-pill">

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: '#1e3a8a', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: '17px' }}>🏥</span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#1e3a8a', letterSpacing: '-0.3px' }}>
              Medi<span style={{ color: 'var(--orange)' }}>Care+</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop-links">
            {links.map(({ label, path }) => (
              <Link
                key={path} to={path}
                className={`nav-link-item${isActive(path) ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="nav-right">
            {user && (
              <>
                <div className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <div className="nav-user-info">
                  <span className="nav-user-name">{user.name}</span>
                  <span className="nav-user-role">{user.role}</span>
                </div>
              </>
            )}
            <button className="nav-logout" onClick={handleLogout}>Logout</button>
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>

        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="nav-mobile-menu">
            {links.map(({ label, path, icon }) => (
              <Link
                key={path} to={path}
                onClick={() => setMenuOpen(false)}
                className={`mobile-nav-link${isActive(path) ? ' active' : ''}`}
              >
                <span className="link-icon">{icon}</span>
                {label}
              </Link>
            ))}
            <div className="mobile-divider" />
            {user && (
              <div className="mobile-user-row">
                <div className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="nav-user-name">{user.name}</div>
                  <div className="nav-user-role" style={{ display: 'inline-block', marginTop: '3px' }}>{user.role}</div>
                </div>
              </div>
            )}
            <button className="mobile-logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
