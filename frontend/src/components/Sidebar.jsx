import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const menuItems = {
  admin: [
    { icon: 'ti-layout-dashboard', label: 'Dashboard',    path: '/dashboard' },
    { icon: 'ti-stethoscope',      label: 'Doctors',      path: '/doctors' },
    { icon: 'ti-users',            label: 'Patients',     path: '/patients' },
    { icon: 'ti-building',         label: 'Departments',  path: '/departments' },
    { icon: 'ti-calendar',         label: 'Appointments', path: '/appointments' },
    { icon: 'ti-chart-bar',        label: 'Reports',      path: '/reports' },
  ],
  receptionist: [
    { icon: 'ti-layout-dashboard', label: 'Dashboard',        path: '/dashboard' },
    { icon: 'ti-user-plus',        label: 'Register Patient', path: '/register-patient' },
    { icon: 'ti-credit-card',      label: 'Payments',         path: '/payments' },
    { icon: 'ti-calendar',         label: 'Appointments',     path: '/appointments' },
  ],
  doctor: [
    { icon: 'ti-layout-dashboard', label: 'Dashboard',       path: '/dashboard' },
    { icon: 'ti-calendar',         label: 'Appointments',    path: '/doctor/appointments' },
    { icon: 'ti-clipboard-list',   label: 'Medical Records', path: '/medical-records' },
    { icon: 'ti-pill',             label: 'Prescriptions',   path: '/prescriptions' },
  ],
  patient: [
    { icon: 'ti-layout-dashboard', label: 'Dashboard',        path: '/dashboard' },
    { icon: 'ti-calendar-plus',    label: 'Book Appointment', path: '/book-appointment' },
    { icon: 'ti-book',             label: 'Medical History',  path: '/medical-history' },
    { icon: 'ti-receipt',          label: 'My Bills',         path: '/my-bills' },
  ],
};

const Sidebar = ({ collapsed = false, onToggle = () => {} }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const items = menuItems[user?.role] || menuItems.admin;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isCollapsed = isMobile ? true : collapsed;

  return (
    <>
      <style>{`
        .sidebar-wrap {
          position: fixed;
          left: 0; top: 0;
          height: 100vh;
          width: ${isCollapsed ? '64px' : '240px'};
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          transition: width 0.28s cubic-bezier(0.4,0,0.2,1);
          z-index: 40;
          overflow-y: auto;
          overflow-x: hidden;
          padding: ${isMobile ? '72px 8px 16px' : '16px 8px'};
          gap: 2px;
        }
        .sidebar-wrap::-webkit-scrollbar { width: 4px; }
        .sidebar-wrap::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

        .sb-user-card {
          display: flex;
          align-items: center;
          gap: ${isCollapsed ? '0' : '10px'};
          padding: ${isCollapsed ? '10px 4px' : '12px'};
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          margin-bottom: 12px;
          justify-content: ${isCollapsed ? 'center' : 'flex-start'};
          transition: all 0.28s ease;
          flex-shrink: 0;
        }
        .sb-avatar {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: #1e3a8a;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 17px; font-weight: 500;
          flex-shrink: 0;
        }
        .sb-username {
          font-size: 14px; font-weight: 600;
          color: #111827; line-height: 1.3;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-role-badge {
          font-size: 11px; font-weight: 500;
          color: #1d4ed8; background: #eff6ff;
          padding: 2px 9px; border-radius: 20px;
          display: inline-block; margin-top: 4px;
          text-transform: capitalize;
        }
        .sb-section-label {
          font-size: 11px; font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase; letter-spacing: 0.7px;
          padding: 6px 12px 4px;
          display: ${isCollapsed ? 'none' : 'block'};
          flex-shrink: 0;
        }
        .sb-nav-link {
          display: flex;
          align-items: center;
          gap: ${isCollapsed ? '0' : '11px'};
          padding: ${isCollapsed ? '12px 4px' : '11px 12px'};
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #4b5563;
          text-decoration: none;
          transition: all 0.15s ease;
          justify-content: ${isCollapsed ? 'center' : 'flex-start'};
          white-space: nowrap;
          overflow: hidden;
          flex-shrink: 0;
        }
        .sb-nav-link i {
          font-size: 19px;
          flex-shrink: 0;
          width: ${isCollapsed ? 'auto' : '22px'};
          text-align: center;
        }
        .sb-nav-link:hover {
          background: #f3f4f6;
          color: #1e3a8a;
        }
        .sb-nav-link.active {
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
        }
        .sb-nav-link.active i { color: #2563eb; }

        .sb-divider {
          height: 1px;
          background: #f3f4f6;
          margin: 8px 4px;
          flex-shrink: 0;
        }
        .sb-emergency {
          background: #1e3a8a;
          border-radius: 12px;
          padding: ${isCollapsed ? '10px 4px' : '14px'};
          margin: 2px 0;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: ${isCollapsed ? 'center' : 'stretch'};
          transition: padding 0.28s ease;
        }
        .sb-emerg-label {
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,0.55);
          text-transform: uppercase; letter-spacing: 0.5px;
          margin: 0 0 3px; display: ${isCollapsed ? 'none' : 'block'};
        }
        .sb-emerg-title {
          font-size: 13px; font-weight: 600;
          color: #fff; margin: 0 0 10px;
          display: ${isCollapsed ? 'none' : 'flex'};
          align-items: center; gap: 5px;
        }
        .sb-emerg-btn {
          display: flex; align-items: center;
          justify-content: center; gap: 6px;
          background: #f5a623; color: #fff;
          border-radius: ${isCollapsed ? '50%' : '30px'};
          padding: ${isCollapsed ? '0' : '9px 14px'};
          width: ${isCollapsed ? '38px' : '100%'};
          height: ${isCollapsed ? '38px' : 'auto'};
          font-size: 13px; font-weight: 600;
          text-decoration: none; border: none;
          cursor: pointer; font-family: inherit;
          transition: all 0.2s;
        }
        .sb-emerg-btn:hover { background: #e09415; }
        .sb-emerg-btn i { font-size: 15px; }

        .sb-bottom-btn {
          display: flex; align-items: center;
          gap: ${isCollapsed ? '0' : '11px'};
          padding: ${isCollapsed ? '12px 4px' : '11px 12px'};
          border-radius: 10px;
          font-size: 14px; font-weight: 500;
          background: none; border: none;
          cursor: pointer; font-family: inherit;
          width: 100%;
          transition: all 0.15s ease;
          justify-content: ${isCollapsed ? 'center' : 'flex-start'};
          flex-shrink: 0;
        }
        .sb-bottom-btn i {
          font-size: 19px; flex-shrink: 0;
          width: ${isCollapsed ? 'auto' : '22px'};
          text-align: center;
        }
        .sb-settings-btn { color: #4b5563; }
        .sb-settings-btn:hover { background: #f3f4f6; color: #1e3a8a; }
        .sb-logout-btn {
          color: #dc2626;
          background: rgba(220,38,38,0.07);
        }
        .sb-logout-btn:hover { background: rgba(220,38,38,0.14); }

        .sb-toggle-btn {
          position: absolute;
          top: 20px; right: -11px;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #e5e7eb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 50;
          color: #6b7280; font-size: 12px;
          transition: all 0.15s;
        }
        .sb-toggle-btn:hover { background: #1e3a8a; color: #fff; border-color: #1e3a8a; }
        .sb-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 39;
          animation: sbFadeIn 0.2s ease;
        }
        @keyframes sbFadeIn { from{opacity:0} to{opacity:1} }
      `}</style>

      {/* Overlay on mobile */}
      {isMobile && !isCollapsed && (
        <div className="sb-overlay" onClick={onToggle} />
      )}

      <aside className="sidebar-wrap">

        {/* Desktop collapse toggle */}
        {!isMobile && (
          <button className="sb-toggle-btn" onClick={onToggle} title={isCollapsed ? 'Expand' : 'Collapse'}>
            <i className={`ti ${isCollapsed ? 'ti-chevron-right' : 'ti-chevron-left'}`} aria-hidden="true" />
          </button>
        )}

        {/* ── User card ── */}
        <div className="sb-user-card">
          <div className="sb-avatar">{user?.name?.[0]?.toUpperCase() || '?'}</div>
          {!isCollapsed && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div className="sb-username">{user?.name || 'User'}</div>
              <span className="sb-role-badge">{user?.role || 'guest'}</span>
            </div>
          )}
        </div>

        {/* ── Main menu label ── */}
        <div className="sb-section-label">Main menu</div>

        {/* ── Nav links ── */}
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sb-nav-link${isActive ? ' active' : ''}`}
            title={isCollapsed ? item.label : undefined}
          >
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            {!isCollapsed && item.label}
          </NavLink>
        ))}

        {/* ── Divider ── */}
        <div className="sb-divider" />

        {/* ── Emergency card ── */}
        <div className="sb-emergency">
          <p className="sb-emerg-label">Emergency</p>
          <p className="sb-emerg-title">
            <i className="ti ti-alarm" style={{ fontSize: '14px' }} aria-hidden="true" />
            24/7 Hotline
          </p>
          <a href="tel:+250791169631" className="sb-emerg-btn" title="Emergency Hotline">
            <i className="ti ti-phone" aria-hidden="true" />
            {!isCollapsed && '+250 791 169 631'}
          </a>
        </div>

        {/* ── Divider ── */}
        <div className="sb-divider" />

        {/* ── Settings ── */}
        <button
          className="sb-bottom-btn sb-settings-btn"
          onClick={() => navigate('/settings')}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <i className="ti ti-settings" aria-hidden="true" />
          {!isCollapsed && 'Settings'}
        </button>

        {/* ── Logout ── */}
        <button
          className="sb-bottom-btn sb-logout-btn"
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <i className="ti ti-logout" aria-hidden="true" />
          {!isCollapsed && 'Logout'}
        </button>

      </aside>
    </>
  );
};

export default Sidebar;
