import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const navLinks = {
  admin: [
    { label: 'Dashboard',    path: '/dashboard'    },
    { label: 'Doctors',      path: '/doctors'      },
    { label: 'Patients',     path: '/patients'     },
    { label: 'Departments',  path: '/departments'  },
    { label: 'Appointments', path: '/appointments' },
    { label: 'Reports',      path: '/reports'      },
  ],
  receptionist: [
    { label: 'Dashboard',    path: '/dashboard'        },
    { label: 'Register',     path: '/register-patient' },
    { label: 'Payments',     path: '/payments'         },
    { label: 'Appointments', path: '/appointments'     },
  ],
  doctor: [
    { label: 'Dashboard',     path: '/dashboard'           },
    { label: 'Appointments',  path: '/doctor/appointments' },
    { label: 'Records',       path: '/medical-records'     },
    { label: 'Prescriptions', path: '/prescriptions'       },
  ],
  patient: [
    { label: 'Dashboard', path: '/dashboard'        },
    { label: 'Book',      path: '/book-appointment' },
    { label: 'History',   path: '/medical-history'  },
    { label: 'Bills',     path: '/my-bills'          },
  ],
};

const Navbar = ({ scrolled = false }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;
  const links = navLinks[user?.role] || navLinks.admin;

  return (
    <>
      <style>{`
        /* ── Navbar pill ── */
        .nav-outer {
          display: flex;
          justify-content: center;
          padding: ${scrolled ? '8px 16px' : '14px 16px 0'};
          transition: padding 0.28s ease;
          position: relative;
          z-index: 60;
        }
        .nav-pill {
          width: 100%;
          max-width: 1100px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px 0 18px;
          border-radius: 40px;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(12px);
          box-shadow: ${scrolled ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.07)'};
          border: 1.5px solid rgba(255,255,255,0.9);
          transition: box-shadow 0.28s ease;
          gap: 8px;
        }

        /* ── Logo ── */
        .nav-logo {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; flex-shrink: 0;
        }
        .nav-logo-box {
          width: 30px; height: 30px; border-radius: 8px;
          background: #1e3a8a;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .nav-logo-text {
          font-size: 15px; font-weight: 700; color: #1e3a8a;
        }
        .nav-logo-text span { color: #f5a623; }

        /* ── Desktop links (center) ── */
        .nav-links {
          display: flex; gap: 2px; align-items: center; flex: 1; justify-content: center;
        }
        .nav-link {
          padding: 6px 11px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          color: #4b5563; text-decoration: none;
          white-space: nowrap; transition: all 0.15s;
        }
        .nav-link:hover  { background: #f3f4f6; color: #111; }
        .nav-link.active { background: #eff6ff; color: #1d4ed8; font-weight: 600; }

        /* ── Right section ── */
        .nav-right {
          display: flex; align-items: center; gap: 8px; flex-shrink: 0;
        }
        .nav-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: #1e3a8a; border: 2px solid #e5e7eb;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 13px; font-weight: 600; flex-shrink: 0;
        }
        .nav-user-name  { font-size: 13px; font-weight: 600; color: #111827; line-height: 1; }
        .nav-user-role  {
          font-size: 10px; font-weight: 600; color: #f5a623;
          background: rgba(245,166,35,0.13); padding: 2px 7px;
          border-radius: 20px; display: block; margin-top: 2px;
          text-transform: capitalize;
        }
        .nav-logout {
          padding: 7px 14px; border-radius: 30px; border: none;
          background: #f5a623; color: white;
          font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          transition: all 0.2s; flex-shrink: 0;
        }
        .nav-logout:hover { background: #e09415; transform: translateY(-1px); }

        /* ── Hamburger button ── */
        .nav-hamburger {
          display: none;
          background: none;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          width: 40px; height: 40px;
          align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: all 0.15s;
        }
        .nav-hamburger:hover { background: #f3f4f6; }
        .ham-icon {
          display: flex; flex-direction: column;
          gap: 5px; padding: 2px;
        }
        .ham-line {
          width: 20px; height: 2px;
          background: #374151; border-radius: 2px;
          transition: all 0.25s ease;
          transform-origin: center;
        }
        .ham-line.open-1 { transform: translateY(7px) rotate(45deg); }
        .ham-line.open-2 { opacity: 0; transform: scaleX(0); }
        .ham-line.open-3 { transform: translateY(-7px) rotate(-45deg); }

        /* ── Dark overlay ── */
        .drawer-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 998;
          animation: overlayIn 0.25s ease;
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Drawer panel ── */
        .drawer-panel {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: 72%;
          max-width: 300px;
          background: #0f1b35;
          z-index: 999;
          display: flex;
          flex-direction: column;
          animation: drawerIn 0.28s cubic-bezier(0.4,0,0.2,1);
          overflow-y: auto;
        }
        @keyframes drawerIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0);    }
        }

        /* ── Drawer header ── */
        .drawer-header {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .drawer-close {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 18px; font-weight: 400;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .drawer-close:hover { background: rgba(255,255,255,0.15); }

        /* ── Drawer user card ── */
        .drawer-user {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .drawer-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: #f5a623;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 18px; font-weight: 700;
          flex-shrink: 0;
        }
        .drawer-user-name {
          font-size: 15px; font-weight: 700; color: white; line-height: 1.3;
        }
        .drawer-user-role {
          font-size: 12px; color: rgba(255,255,255,0.55);
          text-transform: capitalize; margin-top: 2px;
        }

        /* ── Drawer nav links ── */
        .drawer-nav {
          flex: 1; padding: 12px 12px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .drawer-link {
          display: flex; align-items: center;
          padding: 15px 16px;
          border-radius: 12px;
          font-size: 16px; font-weight: 500;
          color: rgba(255,255,255,0.82);
          text-decoration: none;
          transition: all 0.15s;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .drawer-link:last-child { border-bottom: none; }
        .drawer-link:hover  { background: rgba(255,255,255,0.07); color: white; }
        .drawer-link.active {
          background: rgba(245,166,35,0.15);
          color: #f5a623; font-weight: 600;
        }

        /* ── Drawer bottom ── */
        .drawer-bottom {
          padding: 16px 20px 32px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex; flex-direction: column; gap: 10px;
        }
        .drawer-logout {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px; border-radius: 12px;
          background: rgba(220,38,38,0.15);
          border: 1px solid rgba(220,38,38,0.25);
          color: #fca5a5; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          transition: all 0.15s; width: 100%;
        }
        .drawer-logout:hover { background: rgba(220,38,38,0.25); color: white; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .nav-links                         { display: none !important; }
          .nav-right .nav-avatar,
          .nav-right .nav-user-name,
          .nav-right .nav-user-role,
          .nav-right div,
          .nav-logout                        { display: none !important; }
          .nav-hamburger                     { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
          .drawer-overlay,
          .drawer-panel  { display: none !important; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <div className="nav-outer">
        <div className="nav-pill">

          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-box">🏥</div>
            <span className="nav-logo-text">
              Medi<span>Care+</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links">
            {links.map(({ label, path }) => (
              <Link
                key={path} to={path}
                className={`nav-link${isActive(path) ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right — user info + logout (desktop) / hamburger (mobile) */}
          <div className="nav-right">
            {user && (
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div className="nav-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="nav-user-name">{user.name}</div>
                  <span className="nav-user-role">{user.role}</span>
                </div>
              </div>
            )}
            <button className="nav-logout" onClick={handleLogout}>Logout</button>

            {/* Hamburger */}
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <div className="ham-icon">
                <div className={`ham-line${menuOpen ? ' open-1' : ''}`} />
                <div className={`ham-line${menuOpen ? ' open-2' : ''}`} />
                <div className={`ham-line${menuOpen ? ' open-3' : ''}`} />
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <>
          {/* Overlay — click to close */}
          <div className="drawer-overlay" onClick={() => setMenuOpen(false)} />

          {/* Drawer */}
          <div className="drawer-panel">

            {/* Header */}
            <div className="drawer-header">
              <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
                <div className="nav-logo-box">🏥</div>
                <span style={{ fontSize:'15px', fontWeight:'700', color:'white' }}>
                  Medi<span style={{ color:'#f5a623' }}>Care+</span>
                </span>
              </Link>
              <button className="drawer-close" onClick={() => setMenuOpen(false)}>✕</button>
            </div>

            {/* User info */}
            {user && (
              <div className="drawer-user">
                <div className="drawer-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="drawer-user-name">{user.name}</div>
                  <div className="drawer-user-role">{user.role}</div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="drawer-nav">
              {links.map(({ label, path }) => (
                <Link
                  key={path} to={path}
                  className={`drawer-link${isActive(path) ? ' active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Bottom — logout */}
            <div className="drawer-bottom">
              <button className="drawer-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>

          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
