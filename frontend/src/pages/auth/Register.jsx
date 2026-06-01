import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ── Role Config ───────────────────────────────────────────────────────────────

const roles = [
  { value: 'patient',  label: 'Patient',  icon: '👤', color: '#16a34a', bg: 'rgba(22,163,74,0.08)',   desc: 'Book appointments & view records'  },
  { value: 'doctor',   label: 'Doctor',   icon: '👨‍⚕️', color: '#dc2626', bg: 'rgba(220,38,38,0.08)',   desc: 'Manage patients & consultations'   },
];

// ── Password strength ─────────────────────────────────────────────────────────

const getStrength = (pw) => {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak',   color: '#dc2626', width: '25%'  };
  if (score === 2) return { label: 'Fair',   color: '#d97706', width: '50%'  };
  if (score === 3) return { label: 'Good',   color: 'var(--blue)', width: '75%'  };
  return              { label: 'Strong', color: '#16a34a', width: '100%' };
};

// ── Focused Input ─────────────────────────────────────────────────────────────

const FocusInput = ({ label, required, type = 'text', placeholder, value, onChange, error, icon, hint }) => {
  const [focused, setFocused] = useState(false);
  const [show,    setShow]    = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: '800',
        color: 'var(--gray-400)', textTransform: 'uppercase',
        letterSpacing: '0.04em', marginBottom: '6px',
      }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: '3px' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '14px', pointerEvents: 'none',
          }}>{icon}</span>
        )}
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: `11px ${isPassword ? '40px' : '14px'} 11px ${icon ? '38px' : '14px'}`,
            borderRadius: '12px',
            border: `1.5px solid ${error ? '#dc2626' : focused ? 'var(--blue)' : 'var(--gray-200)'}`,
            background: focused ? 'var(--blue-muted)' : error ? 'rgba(220,38,38,0.03)' : 'var(--gray-50)',
            fontSize: '13px', fontWeight: '600', color: 'var(--gray-900)',
            outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
            transition: 'all 0.15s ease',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', color: 'var(--gray-400)', padding: '2px',
            }}
          >{show ? '🙈' : '👁️'}</button>
        )}
      </div>
      {error && <p style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600', marginTop: '4px' }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500', marginTop: '4px' }}>{hint}</p>}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const EMPTY = { name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'patient' };

const Register = () => {
  const navigate = useNavigate();
  const [form,    setForm]    = useState(EMPTY);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const strength = getStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                      e.name            = 'Full name is required';
    if (!form.email.trim())                     e.email           = 'Email is required';
    if (!form.phone.trim())                     e.phone           = 'Phone number is required';
    if (form.password.length < 6)               e.password        = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate API
    setLoading(false);
    navigate('/login');
  };

  const selectedRole = roles.find(r => r.value === form.role);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--gray-50)',
      fontFamily: 'inherit',
    }}>

      {/* ── Left Hero Panel ── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
          }}>🏥</div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
            Medi<span style={{ color: 'var(--orange)' }}>Care+</span>
          </span>
        </div>

        {/* Hero text */}
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'white', lineHeight: 1.2, margin: '0 0 16px' }}>
            Join <span style={{ color: 'var(--orange)' }}>MediCare+</span><br />
            Today
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '360px', margin: '0 0 32px' }}>
            Create your account and get instant access to appointments, medical records, and more.
          </p>

          {/* Benefits */}
          {[
            { icon: '📅', text: 'Book appointments instantly'        },
            { icon: '📋', text: 'Access your medical records anytime' },
            { icon: '💊', text: 'View prescriptions & lab results'    },
            { icon: '🔒', text: 'Secure & private — always'           },
          ].map(b => (
            <div key={b.text} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '12px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px', flexShrink: 0,
              }}>{b.icon}</div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>{b.text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '32px' }}>
          {[{ v: '500+', l: 'Patients' }, { v: '50+', l: 'Doctors' }, { v: '24/7', l: 'Support' }].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>{s.v}</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Register Panel ── */}
      <div style={{
        width: '460px',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 44px',
        borderLeft: '1.5px solid var(--gray-200)',
        overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--gray-900)', margin: '0 0 6px' }}>
            Create Account ✨
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--gray-400)', fontWeight: '500', margin: 0 }}>
            Fill in your details to get started
          </p>
        </div>

        {/* Role selector */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Register as
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {roles.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r.value }))}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `2px solid ${form.role === r.value ? r.color : 'var(--gray-200)'}`,
                  background: form.role === r.value ? r.bg : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{r.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: form.role === r.value ? r.color : 'var(--gray-700)' }}>{r.label}</div>
                <div style={{ fontSize: '10px', fontWeight: '500', color: 'var(--gray-400)', marginTop: '2px', lineHeight: 1.4 }}>{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <FocusInput label="Full Name"     required icon="👤" placeholder="e.g. Amara Diallo"       value={form.name}            onChange={set('name')}            error={errors.name} />
          <FocusInput label="Email Address" required icon="✉️" placeholder="you@example.com"         value={form.email}           onChange={set('email')}           error={errors.email} />
          <FocusInput label="Phone Number"  required icon="📱" placeholder="+254 700 000 000"         value={form.phone}           onChange={set('phone')}           error={errors.phone} />

          <div>
            <FocusInput label="Password" required type="password" icon="🔒" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} error={errors.password} />
            {strength && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password strength</span>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: strength.color }}>{strength.label}</span>
                </div>
                <div style={{ height: '4px', borderRadius: '99px', background: 'var(--gray-200)' }}>
                  <div style={{
                    height: '100%', borderRadius: '99px',
                    width: strength.width, background: strength.color,
                    transition: 'all 0.3s ease',
                  }} />
                </div>
              </div>
            )}
          </div>

          <FocusInput label="Confirm Password" required type="password" icon="🔒" placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '4px',
              padding: '13px',
              borderRadius: '12px',
              border: 'none',
              background: loading ? 'var(--gray-300)' : selectedRole?.color || 'var(--blue)',
              color: 'white',
              fontSize: '13px', fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background 0.2s ease',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.7s linear infinite',
                }} />
                Creating account…
              </>
            ) : (
              <>{selectedRole?.icon} Create {selectedRole?.label} Account</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--gray-400)', fontWeight: '500', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--blue)', fontWeight: '700', textDecoration: 'none' }}>
            Sign in →
          </Link>
        </p>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500', marginTop: '16px' }}>
          By registering, you agree to MediCare+'s Terms & Privacy Policy
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Register;