import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

// ── Field Components ──────────────────────────────────────────────────────────

const inputStyle = (focused, error) => ({
  width: '100%',
  padding: '11px 14px',
  borderRadius: '12px',
  border: `1.5px solid ${error ? '#dc2626' : focused ? 'var(--blue)' : 'var(--gray-200)'}`,
  background: focused ? 'var(--blue-muted)' : 'white',
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--gray-900)',
  outline: 'none',
  transition: 'all 0.15s ease',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
});

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '800',
  color: 'var(--gray-400)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const Field = ({ label, required, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label style={labelStyle}>
      {label}{required && <span style={{ color: '#dc2626', marginLeft: '3px' }}>*</span>}
    </label>
    {children}
    {error && (
      <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600', marginTop: '4px' }}>
        {error}
      </span>
    )}
  </div>
);

const TextInput = ({ label, required, error, type = 'text', placeholder, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} required={required} error={error}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={inputStyle(focused, error)}
      />
    </Field>
  );
};

const SelectInput = ({ label, required, error, options, value, onChange, placeholder }) => {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} required={required} error={error}>
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputStyle(focused, error), cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  );
};

const TextArea = ({ label, required, error, placeholder, value, onChange, rows = 3 }) => {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} required={required} error={error}>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputStyle(focused, error), resize: 'vertical', minHeight: '80px' }}
      />
    </Field>
  );
};

// ── Progress Steps ────────────────────────────────────────────────────────────

const steps = ['Personal Info', 'Contact Details', 'Medical Info'];

const StepIndicator = ({ current }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '32px' }}>
    {steps.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: i < steps.length - 1 ? 'none' : 1 }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '800',
              background: done ? 'var(--blue)' : active ? 'var(--blue)' : 'var(--gray-100)',
              color: done || active ? 'white' : 'var(--gray-400)',
              border: `2px solid ${done || active ? 'var(--blue)' : 'var(--gray-200)'}`,
              transition: 'all 0.2s ease',
            }}>
              {done ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: '10px', fontWeight: '700',
              color: active ? 'var(--blue)' : done ? 'var(--gray-900)' : 'var(--gray-400)',
              whiteSpace: 'nowrap',
            }}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: '2px', marginBottom: '22px',
              background: done ? 'var(--blue)' : 'var(--gray-200)',
              transition: 'background 0.3s ease',
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  firstName: '', lastName: '', dob: '', age: '', gender: '',
  phone: '', altPhone: '', email: '', address: '', city: '', emergencyContact: '', emergencyPhone: '',
  bloodGroup: '', allergies: '', conditions: '', dept: '', insuranceProvider: '', insuranceNumber: '',
};

const REQUIRED = ['firstName', 'lastName', 'age', 'gender', 'phone', 'dept'];

const RegisterPatient = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registeredPatientId, setRegisteredPatientId] = useState(null);
  const [apiError, setApiError] = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.firstName.trim()) e.firstName = 'First name is required';
      if (!form.lastName.trim()) e.lastName = 'Last name is required';
      if (!form.age) e.age = 'Age is required';
      if (!form.gender) e.gender = 'Please select a gender';
    }
    if (s === 1) {
      if (!form.phone.trim()) e.phone = 'Phone number is required';
    }
    if (s === 2) {
      if (!form.dept) e.dept = 'Please select a department';
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const back = () => { setErrors({}); setStep(s => s - 1); };

  const submit = async () => {
    const e = validate(2);
    if (Object.keys(e).length) { setErrors(e); return; }
    
    setSubmitting(true);
    setApiError('');
    
    try {
      const patientData = {
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob || null,
        age: parseInt(form.age),
        gender: form.gender,
        phone: form.phone,
        altPhone: form.altPhone || null,
        email: form.email || null,
        address: form.address || null,
        city: form.city || null,
        emergencyContact: form.emergencyContact || null,
        emergencyPhone: form.emergencyPhone || null,
        bloodGroup: form.bloodGroup || null,
        allergies: form.allergies || null,
        conditions: form.conditions || null,
        dept: form.dept,
        insuranceProvider: form.insuranceProvider || null,
        insuranceNumber: form.insuranceNumber || null
      };
      
      const response = await API.post('/patients', patientData);
      
      if (response.data.success) {
        setRegisteredPatientId(response.data.patientId);
        setSuccess(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setApiError(err.response?.data?.message || 'Failed to register patient. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => { 
    setForm(EMPTY_FORM); 
    setStep(0); 
    setErrors({}); 
    setSuccess(false);
    setRegisteredPatientId(null);
    setApiError('');
  };

  // ── Success State ──
  if (success) {
    const patientId = `P-${String(registeredPatientId || Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{
          background: 'white', borderRadius: '24px',
          border: '1.5px solid var(--gray-200)',
          padding: '48px 40px', textAlign: 'center',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(22,163,74,0.1)', margin: '0 auto 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px',
          }}>✅</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--gray-900)', margin: '0 0 8px' }}>
            Patient Registered!
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--gray-400)', fontWeight: '500', margin: '0 0 24px' }}>
            {form.firstName} {form.lastName} has been successfully added to the system.
          </p>

          <div style={{
            background: 'var(--gray-50)', borderRadius: '16px',
            border: '1.5px solid var(--gray-200)', padding: '20px',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
            textAlign: 'left', marginBottom: '28px',
          }}>
            {[
              ['Patient ID', patientId],
              ['Name', `${form.firstName} ${form.lastName}`],
              ['Age / Gender', `${form.age} yrs · ${form.gender}`],
              ['Department', form.dept],
              ['Phone', form.phone],
              ['Blood Group', form.bloodGroup || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gray-900)', marginTop: '2px' }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={reset} style={{
              flex: 1, padding: '12px', borderRadius: '12px',
              background: 'var(--blue-muted)', border: 'none',
              color: 'var(--blue)', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            }}>+ Register Another</button>
            <Link to="/dashboard" style={{
              flex: 1, padding: '12px', borderRadius: '12px',
              background: 'var(--blue)', border: 'none',
              color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>← Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/dashboard" style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'white', border: '1.5px solid var(--gray-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', textDecoration: 'none', flexShrink: 0,
        }}>←</Link>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
            Register New Patient
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500', marginTop: '3px' }}>
            Fill in patient details to create a new record
          </p>
        </div>
      </div>

      {/* API Error */}
      {apiError && (
        <div style={{
          background: 'rgba(220,38,38,0.08)',
          border: '1.5px solid rgba(220,38,38,0.2)',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '13px',
          fontWeight: '600',
        }}>
          ⚠️ {apiError}
        </div>
      )}

      {/* Card */}
      <div style={{
        background: 'white', borderRadius: '24px',
        border: '1.5px solid var(--gray-200)', padding: '32px',
      }}>
        <StepIndicator current={step} />

        {/* ── Step 0: Personal Info ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <TextInput label="First Name" required placeholder="e.g. Amara" value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
              <TextInput label="Last Name" required placeholder="e.g. Diallo" value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <TextInput label="Date of Birth" type="date" placeholder="" value={form.dob} onChange={set('dob')} />
              <TextInput label="Age" required type="number" placeholder="e.g. 34" value={form.age} onChange={set('age')} error={errors.age} />
            </div>
            <SelectInput
              label="Gender" required
              options={['Male', 'Female', 'Other', 'Prefer not to say']}
              placeholder="Select gender"
              value={form.gender} onChange={set('gender')} error={errors.gender}
            />
          </div>
        )}

        {/* ── Step 1: Contact Details ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <TextInput label="Phone Number" required type="tel" placeholder="+250 788 000 000" value={form.phone} onChange={set('phone')} error={errors.phone} />
              <TextInput label="Alternate Phone" type="tel" placeholder="+250 788 000 001" value={form.altPhone} onChange={set('altPhone')} />
            </div>
            <TextInput label="Email Address" type="email" placeholder="patient@email.com" value={form.email} onChange={set('email')} />
            <TextArea label="Home Address" placeholder="Street, Area…" value={form.address} onChange={set('address')} rows={2} />
            <TextInput label="City / Town" placeholder="e.g. Kigali" value={form.city} onChange={set('city')} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <TextInput label="Emergency Contact Name" placeholder="e.g. Grace Okafor" value={form.emergencyContact} onChange={set('emergencyContact')} />
              <TextInput label="Emergency Contact Phone" type="tel" placeholder="+250 788 000 002" value={form.emergencyPhone} onChange={set('emergencyPhone')} />
            </div>
          </div>
        )}

        {/* ── Step 2: Medical Info ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <SelectInput
                label="Blood Group"
                options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                placeholder="Select blood group"
                value={form.bloodGroup} onChange={set('bloodGroup')}
              />
              <SelectInput
                label="Department" required
                options={['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Ophthalmology', 'General']}
                placeholder="Select department"
                value={form.dept} onChange={set('dept')} error={errors.dept}
              />
            </div>
            <TextArea label="Known Allergies" placeholder="e.g. Penicillin, Latex, Peanuts…" value={form.allergies} onChange={set('allergies')} rows={2} />
            <TextArea label="Pre-existing Conditions" placeholder="e.g. Type 2 Diabetes, Hypertension…" value={form.conditions} onChange={set('conditions')} rows={2} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <TextInput label="Insurance Provider" placeholder="e.g. NHIF, AAR" value={form.insuranceProvider} onChange={set('insuranceProvider')} />
              <TextInput label="Insurance / Policy Number" placeholder="e.g. NHIF-0012345" value={form.insuranceNumber} onChange={set('insuranceNumber')} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
          {step > 0 && (
            <button onClick={back} style={{
              flex: '0 0 auto', padding: '12px 24px', borderRadius: '12px',
              background: 'var(--gray-100)', border: 'none',
              color: 'var(--gray-500)', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            }}>← Back</button>
          )}
          {step < 2 ? (
            <button onClick={next} style={{
              flex: 1, padding: '12px', borderRadius: '12px',
              background: 'var(--blue)', border: 'none',
              color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            }}>Continue →</button>
          ) : (
            <button onClick={submit} disabled={submitting} style={{
              flex: 1, padding: '12px', borderRadius: '12px',
              background: 'var(--blue)', border: 'none',
              color: 'white', fontSize: '13px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? '⏳ Registering...' : '✅ Register Patient'}
            </button>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500', marginTop: '16px' }}>
        Fields marked <span style={{ color: '#dc2626', fontWeight: '800' }}>*</span> are required · Patient data is handled securely
      </p>
    </div>
  );
};

export default RegisterPatient;