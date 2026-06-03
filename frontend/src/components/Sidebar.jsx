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

  const sidebarStyles = {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: isCollapsed ? '68px' : '260px',
    background: 'var(--color-background-primary, #fff)',
    borderRight: '0.5px solid var(--color-border-tertiary, #e5e7eb)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
    zIndex: 40,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingTop: isMobile ? '72px' : '14px',
    paddingBottom: '16px',
    gap: '2px',
  };

  return (
    <>
      <style>{`
        .sb-link {
          display: flex;
          align-items: center;
          gap: ${isCollapsed ? '0' : '10px'};
          padding: ${isCollapsed ? '11px' : '10px 12px'};
          margin: 0 6px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 400;
          color: var(--color-text-secondary, #6b7280);
          text-decoration: none;
          transition: all 0.15s ease;
          justify-content: ${isCollapsed ? 'center' : 'flex-start'};
          white-space: nowrap;
          overflow: hidden;
        }
        .sb-link:hover {
          background: var(--color-background-secondary, #f3f4f6);
          color: var(--color-text-primary, #111);
        }
        .sb-link.active {
          background: #E6F1FB;
          color: #0C447C;
          font-weight: 500;
        }
        .sb-link.active i { color: #185FA5; }
        .sb-link i { font-size: 18px; flex-shrink: 0; }
        .sb-btn {
          display: flex;
          align-items: center;
          gap: ${isCollapsed ? '0' : '10px'};
          padding: ${isCollapsed ? '11px' : '10px 12px'};
          margin: 0 6px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 400;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          width: calc(100% - 12px);
          transition: all 0.15s ease;
          justify-content: ${isCollapsed ? 'center' : 'flex-start'};
        }
        .sb-btn i { font-size: 18px; flex-shrink: 0; }
        .sb-btn:hover { background: var(--color-background-secondary, #f3f4f6); }
        .sb-toggle {
          position: absolute;
          top: 18px;
          right: -11px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--color-background-primary, #fff);
          border: 0.5px solid var(--color-border-secondary, #d1d5db);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 50;
          color: var(--color-text-secondary);
          font-size: 13px;
          transition: all 0.15s;
        }
        .sb-toggle:hover {
          background: #1e3a8a;
          color: #fff;
          border-color: #1e3a8a;
        }
        .sb-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 39;
          animation: sbFade 0.2s ease;
        }
        @keyframes sbFade { from{opacity:0} to{opacity:1} }
        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-track { background: transparent; }
        aside::-webkit-scrollbar-thumb { background: var(--color-border-secondary, #d1d5db); border-radius: 4px; }
      `}</style>

      {isMobile && !isCollapsed && (
        <div className="sb-overlay" onClick={onToggle} />
      )}

      <aside style={sidebarStyles}>

        {/* Desktop collapse toggle */}
        {!isMobile && (
          <button className="sb-toggle" onClick={onToggle} title={isCollapsed ? 'Expand' : 'Collapse'}>
            <i className={`ti ${isCollapsed ? 'ti-chevron-right' : 'ti-chevron-left'}`} aria-hidden="true" />
          </button>
        )}

        {/* User card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isCollapsed ? 0 : '10px',
          padding: isCollapsed ? '10px 6px' : '12px',
          margin: '0 6px 6px',
          background: 'var(--color-background-secondary, #f9fafb)',
          borderRadius: '12px',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          transition: 'all 0.28s ease',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: '#1e3a8a', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontSize: '15px',
            fontWeight: '500', flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          {!isCollapsed && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <p style={{
                fontSize: '13px', fontWeight: '500',
                color: 'var(--color-text-primary, #111)',
                whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis', margin: 0,
              }}>
                {user?.name || 'User'}
              </p>
              <span style={{
                fontSize: '11px', fontWeight: '400',
                color: '#0C447C', background: '#E6F1FB',
                padding: '2px 8px', borderRadius: '20px',
                display: 'inline-block', marginTop: '3px',
                textTransform: 'capitalize',
              }}>
                {user?.role || 'guest'}
              </span>
            </div>
          )}
        </div>

        {/* Section label */}
        {!isCollapsed && (
          <p style={{
            fontSize: '11px', fontWeight: '500',
            color: 'var(--color-text-tertiary, #9ca3af)',
            textTransform: 'uppercase', letterSpacing: '0.6px',
            padding: '4px 18px 6px', margin: 0,
          }}>
            Main menu
          </p>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <i className={`ti ${item.icon}`} aria-hidden="true" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div style={{ height: '0.5px', background: 'var(--color-border-tertiary, #e5e7eb)', margin: '8px 10px' }} />

        {/* Emergency card */}
        <div style={{
          background: '#1e3a8a', borderRadius: '12px',
          padding: isCollapsed ? '10px 6px' : '12px 14px',
          margin: '0 6px', display: 'flex', flexDirection: 'column',
          alignItems: isCollapsed ? 'center' : 'stretch',
          transition: 'padding 0.28s ease',
        }}>
          {!isCollapsed && (
            <>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px' }}>Emergency</p>
              <p style={{ color: '#fff', fontSize: '12px', fontWeight: '500', margin: '0 0 10px' }}>24/7 Hotline</p>
            </>
          )}
          
            href="tel:+250791169631"
            title="Emergency Hotline"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', background: '#f5a623', color: '#fff',
              borderRadius: isCollapsed ? '50%' : '30px',
              padding: isCollapsed ? '0' : '8px 12px',
              width: isCollapsed ? '38px' : 'auto',
              height: isCollapsed ? '38px' : 'auto',
              fontSize: '12px', fontWeight: '500', textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <i className="ti ti-phone" style={{ fontSize: '14px' }} aria-hidden="true" />
            {!isCollapsed && '+250 791 169 631'}
          </a>
        </div>

        {/* Divider */}
        <div style={{ height: '0.5px', background: 'var(--color-border-tertiary, #e5e7eb)', margin: '8px 10px' }} />

        {/* Settings */}
        <button
          className="sb-btn"
          onClick={() => navigate('/settings')}
          title={isCollapsed ? 'Settings' : undefined}
          style={{ color: 'var(--color-text-secondary, #6b7280)' }}
        >
          <i className="ti ti-settings" aria-hidden="true" />
          {!isCollapsed && 'Settings'}
        </button>

        {/* Logout */}
        <button
          className="sb-btn"
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          style={{
            color: 'var(--color-text-danger, #dc2626)',
            background: 'rgba(220,38,38,0.07)',
          }}
        >
          <i className="ti ti-logout" aria-hidden="true" />
          {!isCollapsed && 'Logout'}
        </button>

      </aside>
    </>
  );
};

export default Sidebar;
