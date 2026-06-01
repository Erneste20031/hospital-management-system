import React, { useContext } from 'react';
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
    { label: 'Dashboard', path: '/dashboard'      },
    { label: 'Book',      path: '/book-appointment' },
    { label: 'History',   path: '/medical-history'  },
    { label: 'Bills',     path: '/my-bills'          },
  ],
};

// scrolled is passed in from Layout so Navbar never needs its own listener
const Navbar = ({ scrolled = false }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;
  const links = navLinks[user?.role] || navLinks.admin;

  return (
    // Outer strip — always sits at the top of the hero div (which is fixed)
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: scrolled ? '8px 12px' : '12px 12px 0',
      transition: 'padding 0.28s cubic-bezier(0.4,0,0.2,1)',
    }}>

      {/* Pill — ALWAYS WHITE */}
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px 0 20px',
        borderRadius: '40px',
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(12px)',
        boxShadow: scrolled
          ? '0 8px 24px rgba(0,0,0,0.12)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        border: '1.5px solid rgba(255,255,255,0.9)',
        transition: 'box-shadow 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: '20px' }}>🏥</span>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#1e3a8a' }}>
            Medi<span style={{ color: 'var(--orange)' }}>Care+</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {links.map(({ label, path }) => {
            const active = isActive(path);
            return (
              <Link key={path} to={path} style={{
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: active ? '700' : '600',
                color: active ? 'var(--orange)' : '#4b5563',
                background: active ? 'rgba(245,158,11,0.12)' : 'transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* User + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Avatar */}
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'var(--blue)',
                border: '2px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '13px', fontWeight: '800', flexShrink: 0,
                transition: 'background 0.28s ease',
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              {/* Name + role — always visible */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', lineHeight: 1 }}>
                  {user.name}
                </span>
                <span style={{
                  fontSize: '10px', fontWeight: '700',
                  color: 'var(--orange)', background: 'rgba(245,166,35,0.15)',
                  padding: '2px 7px', borderRadius: '20px',
                  lineHeight: 1.4, textTransform: 'capitalize', alignSelf: 'flex-start',
                }}>
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* Logout */}
          <button onClick={handleLogout} style={{
            padding: '7px 16px', borderRadius: '40px', border: 'none',
            cursor: 'pointer', fontSize: '12px', fontWeight: '700',
            background: 'var(--orange)', color: 'white',
            fontFamily: 'inherit', flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,166,35,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--orange)';      e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'none'; }}
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Navbar;