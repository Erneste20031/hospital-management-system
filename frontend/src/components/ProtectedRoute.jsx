import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(true);

  // Delay showing loader for snappy UX (don't flash loader for quick loads)
  useEffect(() => {
    if (!loading) {
      setShowLoader(false);
    } else {
      const timer = setTimeout(() => setShowLoader(true), 300);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // ────────────────────────────────────────────────────────────────
  // LOADING STATE — only show after 300ms delay
  // ────────────────────────────────────────────────────────────────
  if (loading && showLoader) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, var(--blue) 0%, #2E3A9A 100%)',
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          {/* Animated spinner */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: '4px solid rgba(255,255,255,0.25)',
              borderTopColor: 'white',
              marginX: 'auto',
              animation: 'spin 1s linear infinite',
              marginBottom: '24px',
            }}
          />

          {/* Loading text with pulse animation */}
          <p
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              margin: 0,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            Loading your workspace...
          </p>

          {/* Subtext */}
          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.7)',
              marginTop: '8px',
              margin: '8px 0 0 0',
            }}
          >
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // NOT AUTHENTICATED — redirect to login
  // ────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: 'Please log in to access this page' }}
        replace
      />
    );
  }

  // ────────────────────────────────────────────────────────────────
  // AUTHENTICATED BUT NO PERMISSION — show access denied
  // ────────────────────────────────────────────────────────────────
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'var(--gray-50)',
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: '420px',
            padding: '32px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          }}
        >
          {/* Icon */}
          <div
            style={{
              fontSize: '56px',
              marginBottom: '16px',
              animation: 'shake 0.5s ease-in-out',
            }}
          >
            🚫
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: 'var(--gray-900)',
              margin: '0 0 12px 0',
            }}
          >
            Access Denied
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '14px',
              color: 'var(--gray-600)',
              margin: '0 0 24px 0',
              lineHeight: 1.6,
            }}
          >
            You don't have permission to access this page. Your current role is{' '}
            <span style={{ fontWeight: '700', textTransform: 'capitalize', color: 'var(--blue)' }}>
              {user.role}
            </span>
            .
          </p>

          {/* Allowed roles info */}
          {allowedRoles && allowedRoles.length > 0 && (
            <div
              style={{
                background: 'rgba(61,77,183,0.08)',
                border: '1px solid rgba(61,77,183,0.2)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '24px',
                fontSize: '12px',
                color: 'var(--gray-700)',
              }}
            >
              <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: 'var(--blue)' }}>
                Allowed roles:
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {allowedRoles.map(role => (
                  <span
                    key={role}
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: 'white',
                      border: '1px solid rgba(61,77,183,0.3)',
                      borderRadius: '20px',
                      textTransform: 'capitalize',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: 'var(--blue)',
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                color: 'white',
                background: 'linear-gradient(135deg, var(--blue) 0%, #2E3A9A 100%)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(61,77,183,0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(61,77,183,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(61,77,183,0.3)';
              }}
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => window.location.href = '/login?logout=true'}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--blue)',
                background: 'rgba(61,77,183,0.08)',
                border: '1.5px solid rgba(61,77,183,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(61,77,183,0.15)';
                e.currentTarget.style.borderColor = 'rgba(61,77,183,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(61,77,183,0.08)';
                e.currentTarget.style.borderColor = 'rgba(61,77,183,0.2)';
              }}
            >
              Sign in with Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // AUTHENTICATED & AUTHORIZED — render children
  // ────────────────────────────────────────────────────────────────
  return children;
};

export default ProtectedRoute;

// Add keyframe animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: scale(1) rotate(0deg);
    }
    10%, 20% {
      transform: scale(1.1) rotate(-5deg);
    }
    30%, 50% {
      transform: scale(1.1) rotate(5deg);
    }
    40%, 60% {
      transform: scale(1.1) rotate(-5deg);
    }
    70% {
      transform: scale(1.1) rotate(5deg);
    }
    80% {
      transform: scale(1) rotate(0deg);
    }
  }
`;
if (!document.querySelector('style[data-protected-route]')) {
  style.setAttribute('data-protected-route', 'true');
  document.head.appendChild(style);
}