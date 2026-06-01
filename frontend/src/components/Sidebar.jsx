import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const menuItems = {
  admin: [
    { icon: '📊', label: 'Dashboard',    path: '/dashboard' },
    { icon: '👨‍⚕️', label: 'Doctors',      path: '/doctors' },
    { icon: '👥', label: 'Patients',     path: '/patients' },
    { icon: '🏥', label: 'Departments',  path: '/departments' },
    { icon: '📅', label: 'Appointments', path: '/appointments' },
    { icon: '📈', label: 'Reports',      path: '/reports' },
  ],
  receptionist: [
    { icon: '📊', label: 'Dashboard',        path: '/dashboard' },
    { icon: '👤', label: 'Register Patient', path: '/register-patient' },
    { icon: '💰', label: 'Payments',         path: '/payments' },
    { icon: '📅', label: 'Appointments',     path: '/appointments' },
  ],
  doctor: [
    { icon: '📊', label: 'Dashboard',       path: '/dashboard' },
    { icon: '📅', label: 'Appointments',    path: '/doctor/appointments' },
    { icon: '📋', label: 'Medical Records', path: '/medical-records' },
    { icon: '💊', label: 'Prescriptions',   path: '/prescriptions' },
  ],
  patient: [
    { icon: '📊', label: 'Dashboard',        path: '/dashboard' },
    { icon: '📅', label: 'Book Appointment', path: '/book-appointment' },
    { icon: '📖', label: 'Medical History',  path: '/medical-history' },
    { icon: '💰', label: 'My Bills',         path: '/my-bills' },
  ],
};

const roleColors = {
  admin:        { bg: 'rgba(61,77,183,0.12)',  color: '#3D4DB7' },
  receptionist: { bg: 'rgba(245,166,35,0.15)', color: '#E09000' },
  doctor:       { bg: 'rgba(61,77,183,0.12)',  color: '#3D4DB7' },
  patient:      { bg: 'rgba(245,166,35,0.15)', color: '#E09000' },
};

const Sidebar = ({ collapsed = false, onToggle = () => {} }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const items = menuItems[user?.role] || menuItems.admin;
  const roleStyle = roleColors[user?.role] || roleColors.admin;

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // On mobile, collapse sidebar by default
  const isCollapsed = isMobile ? true : collapsed;

  return (
    <>
      {/* Mobile overlay — click to close sidebar */}
      {isMobile && !isCollapsed && (
        <div
          onClick={() => onToggle()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 39,
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Sidebar container */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: isCollapsed ? '72px' : '280px',
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRight: '1px solid var(--gray-200)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 40,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingTop: isMobile ? '76px' : '16px',
          paddingBottom: '16px',
        }}
      >

        {/* Toggle button — visible on desktop when not collapsed */}
        {!isMobile && (
          <button
            onClick={() => onToggle()}
            style={{
              position: 'absolute',
              top: '16px',
              right: '-12px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'white',
              border: '1px solid var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 50,
              transition: 'all 0.2s ease',
              fontSize: '12px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--blue)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'var(--blue)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#1f2937';
              e.currentTarget.style.borderColor = 'var(--gray-200)';
            }}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        )}

        {/* User profile card at top */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isCollapsed ? '0' : '12px',
            padding: isCollapsed ? '8px' : '14px 16px',
            marginBottom: '12px',
            marginX: isCollapsed ? '4px' : '0',
            background: 'var(--blue-muted)',
            borderRadius: '14px',
            transition: 'padding 0.3s ease, gap 0.3s ease',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            minHeight: '60px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--blue) 0%, #2E3A9A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: 'white',
              fontWeight: '700',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(61,77,183,0.25)',
            }}
            title={user?.name}
          >
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>

          {!isCollapsed && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--gray-900)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  margin: 0,
                }}
              >
                {user?.name || 'User'}
              </p>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: roleStyle.bg,
                  color: roleStyle.color,
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '4px',
                }}
              >
                {user?.role || 'guest'}
              </span>
            </div>
          )}
        </div>

        {/* Section label */}
        {!isCollapsed && (
          <p
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--gray-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '0 16px',
              marginBottom: '10px',
              marginTop: '8px',
            }}
          >
            Main Menu
          </p>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', paddingX: isCollapsed ? '4px' : '0' }}>
          {items.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: isCollapsed ? '0' : '12px',
                padding: isCollapsed ? '8px' : '10px 14px',
                margin: isCollapsed ? '0 4px' : '0 8px',
                borderRadius: '12px',
                fontSize: isCollapsed ? '18px' : '14px',
                fontWeight: isActive ? '700' : '600',
                color: isActive ? 'white' : 'var(--gray-700)',
                background: isActive
                  ? 'linear-gradient(135deg, var(--blue) 0%, #2E3A9A 100%)'
                  : 'transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                boxShadow: isActive ? '0 4px 12px rgba(61,77,183,0.3)' : 'none',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              })}
              title={item.label}
              onMouseEnter={e => {
                if (!e.currentTarget.className.includes('active')) {
                  e.currentTarget.style.background = 'rgba(61,77,183,0.08)';
                  e.currentTarget.style.color = 'var(--blue)';
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.className.includes('active')) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--gray-700)';
                }
              }}
            >
              <span style={{ fontSize: isCollapsed ? '18px' : '16px', lineHeight: 1, flexShrink: 0 }}>
                {item.icon}
              </span>
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'var(--gray-200)',
            margin: isCollapsed ? '8px 4px' : '12px 8px',
            transition: 'margin 0.3s ease',
          }}
        />

        {/* Emergency quick-access */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3D4DB7 0%, #2E3A9A 100%)',
            borderRadius: '14px',
            padding: isCollapsed ? '8px' : '14px',
            margin: isCollapsed ? '0 4px' : '0 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCollapsed ? 'center' : 'stretch',
            transition: 'padding 0.3s ease',
            minHeight: isCollapsed ? '50px' : 'auto',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
          }}
        >
          {!isCollapsed && (
            <>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>
                Emergency
              </p>
              <p
                style={{
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '10px',
                  margin: '6px 0 10px 0',
                }}
              >
                🚨 24/7 Hotline
              </p>
            </>
          )}
          <a
            href="tel:+250791169631"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              background: 'var(--orange)',
              color: 'white',
              borderRadius: isCollapsed ? '50%' : '30px',
              padding: isCollapsed ? '8px' : '8px 12px',
              width: isCollapsed ? '36px' : 'auto',
              height: isCollapsed ? '36px' : 'auto',
              fontSize: '12px',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(245,166,35,0.3)',
              textAlign: 'center',
            }}
            title="Emergency Hotline"
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--orange-dark)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(245,166,35,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--orange)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,166,35,0.3)';
            }}
          >
            {isCollapsed ? '🚨' : '📞 +250 791 169 631'}
          </a>
        </div>

        {/* Bottom settings/logout section */}
        {!isCollapsed && (
          <>
            <div style={{ height: '1px', background: 'var(--gray-200)', margin: '12px 8px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingX: '8px' }}>
              <button
                onClick={() => navigate('/settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  margin: '0 8px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--gray-700)',
                  background: 'transparent',
                  border: 'none',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(61,77,183,0.08)';
                  e.currentTarget.style.color = 'var(--blue)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--gray-700)';
                }}
              >
                <span style={{ fontSize: '16px' }}>⚙️</span>
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  margin: '0 8px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#dc2626',
                  background: 'rgba(220,38,38,0.08)',
                  border: 'none',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(220,38,38,0.15)';
                  e.currentTarget.style.color = '#991b1b';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(220,38,38,0.08)';
                  e.currentTarget.style.color = '#dc2626';
                }}
              >
                <span style={{ fontSize: '16px' }}>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </>
        )}

        {/* Collapsed state logout icon */}
        {isCollapsed && (
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              margin: '0 4px',
              borderRadius: '12px',
              fontSize: '16px',
              background: 'rgba(220,38,38,0.08)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Logout"
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.08)';
            }}
          >
            🚪
          </button>
        )}

      </aside>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        aside::-webkit-scrollbar {
          width: 6px;
        }

        aside::-webkit-scrollbar-track {
          background: transparent;
        }

        aside::-webkit-scrollbar-thumb {
          background: var(--gray-300);
          border-radius: 3px;
        }

        aside::-webkit-scrollbar-thumb:hover {
          background: var(--gray-400);
        }
      `}</style>
    </>
  );
};

export default Sidebar;