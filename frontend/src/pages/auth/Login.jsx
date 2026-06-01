import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// ── Role Config ───────────────────────────────────────────────────────────────

const roles = [
  { value: 'admin',        label: 'Admin',        icon: '👨‍💼', demo: 'admin@medicare.com',     color: '#7c3aed', bg: 'rgba(124,58,237,0.08)'  },
  { value: 'doctor',       label: 'Doctor',       icon: '👨‍⚕️', demo: 'doctor@medicare.com',    color: '#dc2626', bg: 'rgba(220,38,38,0.08)'   },
  { value: 'receptionist', label: 'Receptionist', icon: '💼',  demo: 'reception@medicare.com', color: '#3D4DB7', bg: 'rgba(61,77,183,0.08)'   },
  { value: 'patient',      label: 'Patient',      icon: '👤',  demo: 'patient@medicare.com',   color: '#16a34a', bg: 'rgba(22,163,74,0.08)'   },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputBase = {
  width: '100%', 
  padding: '12px 16px', 
  borderRadius: '12px',
  fontSize: '14px', 
  fontWeight: '500', 
  color: '#1f2937',
  outline: 'none', 
  boxSizing: 'border-box', 
  fontFamily: 'inherit',
  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
};

const FocusInput = ({ type, placeholder, value, onChange, icon }) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', 
        left: '16px', 
        top: '50%', 
        transform: 'translateY(-50%)',
        fontSize: '16px', 
        pointerEvents: 'none',
      }}>
        {icon}
      </span>
      <input
        type={type === 'password' && showPassword ? 'text' : type}
        required
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputBase,
          paddingLeft: '48px',
          paddingRight: type === 'password' ? '48px' : '16px',
          border: `1.5px solid ${focused ? '#3D4DB7' : '#e5e7eb'}`,
          background: focused ? 'rgba(61,77,183,0.04)' : '#f9fafb',
          boxShadow: focused ? '0 0 0 3px rgba(61,77,183,0.1)' : 'none',
        }}
      />
      
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            pointerEvents: 'auto',
            padding: '4px',
          }}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Login = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('admin');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const selectedRole = roles.find(r => r.value === role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Direct API call - NO setTimeout!
    const result = await login(email, password, role);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid credentials. Please check your email and password.');
    }
  };

  const fillDemo = () => {
    setEmail(selectedRole.demo);
    setPassword('123456');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f9fafb 0%, rgba(61,77,183,0.05) 100%)',
      padding: '20px',
      fontFamily: 'inherit',
    }}>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(61,77,183,0.12)',
        border: '1px solid #e5e7eb',
        padding: '48px 36px',
      }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3D4DB7 0%, #2a3278 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(61,77,183,0.25)',
          }}>
            🏥
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1f2937',
            margin: '0 0 8px',
          }}>
            Medi<span style={{ color: '#ea580c' }}>Care+</span>
          </h1>

          <p style={{
            fontSize: '13px',
            color: '#6b7280',
            fontWeight: '500',
            margin: 0,
          }}>
            Smart Hospital Management System
          </p>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#4b5563',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'block',
            marginBottom: '12px',
          }}>
            Sign in as
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {roles.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => { setRole(r.value); setError(''); }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: `2px solid ${role === r.value ? r.color : '#e5e7eb'}`,
                  background: role === r.value ? r.bg : 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: role === r.value ? '700' : '600',
                  color: role === r.value ? r.color : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <span style={{ fontSize: '14px' }}>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.08)',
            border: '1.5px solid rgba(220,38,38,0.2)',
            color: '#991b1b',
            padding: '12px 14px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              display: 'block',
              marginBottom: '6px',
            }}>
              Email Address
            </label>
            <FocusInput
              type="email"
              icon="✉️"
              placeholder={selectedRole?.demo}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              display: 'block',
              marginBottom: '6px',
            }}>
              Password
            </label>
            <FocusInput
              type="password"
              icon="🔒"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '13px 16px',
              borderRadius: '12px',
              border: 'none',
              background: loading ? '#d1d5db' : 'linear-gradient(135deg, #3D4DB7 0%, #2a3278 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span style={{ fontSize: '16px' }}>→</span>
              </>
            )}
          </button>
        </form>

        <div style={{
          background: '#f9fafb',
          border: '1.5px solid #e5e7eb',
          borderRadius: '14px',
          padding: '14px 16px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: '800',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}>
                Demo Credentials
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
              }}>
                {selectedRole?.demo} · <span style={{ color: '#9ca3af' }}>123456</span>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              style={{
                padding: '7px 16px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '700',
                background: 'rgba(61,77,183,0.08)',
                color: '#3D4DB7',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              Auto-fill
            </button>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '11px',
          color: '#9ca3af',
          fontWeight: '500',
          margin: 0,
        }}>
          🔒 Secured with 256-bit encryption · v2.0
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;