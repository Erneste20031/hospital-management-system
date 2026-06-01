import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const appointmentTypes = [
  { value: 'Checkup', label: 'General Checkup', icon: '🩺' },
  { value: 'Follow-up', label: 'Follow-up Visit', icon: '🔄' },
  { value: 'Consultation', label: 'Consultation', icon: '💬' },
  { value: 'Emergency', label: 'Urgent / Emergency', icon: '🚨' },
];

const steps = ['Department', 'Doctor', 'Date & Time', 'Details'];

const StepBar = ({ current }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '32px' }}>
    {steps.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: done ? 'var(--blue)' : active ? 'var(--blue)' : 'var(--gray-100)',
              color: done || active ? 'white' : 'var(--gray-400)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: done ? '14px' : '13px', fontWeight: '800',
              border: active ? '3px solid rgba(61,77,183,0.25)' : '3px solid transparent',
            }}>
              {done ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', color: active ? 'var(--blue)' : done ? 'var(--gray-600)' : 'var(--gray-400)' }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ height: '2px', flex: 2, marginBottom: '22px', background: done ? 'var(--blue)' : 'var(--gray-200)' }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const BookAppointment = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [step, setStep] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [dept, setDept] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [details, setDetails] = useState({ type: '', reason: '', notes: '' });
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch departments on load
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await API.get('/departments');
      setDepartments(response.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors when department is selected
  const fetchDoctorsByDepartment = async (departmentName) => {
    try {
      const response = await API.get(`/doctors/department/${encodeURIComponent(departmentName)}`);
      setDoctors(response.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setDoctors([]);
    }
  };

  const handleDeptSelect = async (selectedDept) => {
    setDept(selectedDept);
    setDoctor(null);
    await fetchDoctorsByDepartment(selectedDept.name);
  };

  const canNext = () => {
    if (step === 0) return !!dept;
    if (step === 1) return !!doctor;
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return !!details.type;
    return false;
  };

  const handleNext = () => {
    if (canNext()) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleDetailChange = (key, val) => setDetails(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!user) {
      setError('Please login to book an appointment');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const appointmentData = {
        departmentName: dept?.name,
        doctorId: doctor?.id,
        doctorName: doctor?.name,
        patientName: user?.name,
        date: selectedDate,
        time: selectedTime,
        type: details.type,
        reason: details.reason,
        notes: details.notes
      };
      
      console.log('Submitting appointment:', appointmentData);
      const response = await API.post('/appointments', appointmentData);
      console.log('Appointment response:', response.data);
      
      setConfirmed(true);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getNext14Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      days.push({
        iso: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        num: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
        isWeekend: isWeekend
      });
    }
    return days;
  };

  const days = getNext14Days();
  const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

  if (loading && departments.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading departments...</div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', border: '1.5px solid var(--gray-200)' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>Appointment Confirmed!</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '20px' }}>Your appointment has been successfully booked.</p>
          <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '16px', textAlign: 'left', marginBottom: '24px' }}>
            <p><strong>Department:</strong> {dept?.name}</p>
            <p><strong>Doctor:</strong> {doctor?.name}</p>
            <p><strong>Date:</strong> {selectedDate}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Type:</strong> {details.type}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => window.location.reload()} className="btn-primary" style={{ flex: 1 }}>Book Another</button>
            <Link to="/dashboard" className="btn-secondary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>Go to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>Book Appointment</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '5px' }}>Schedule your visit with our specialists</p>
        </div>
        <Link to="/dashboard" style={{ fontSize: '13px', fontWeight: '700', textDecoration: 'none', background: 'var(--gray-100)', padding: '10px 18px', borderRadius: '12px', color: 'var(--gray-600)' }}>
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid #dc2626', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1.5px solid var(--gray-200)' }}>
          <StepBar current={step} />

          {/* Step 1: Department */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Choose a Department</h2>
              <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '22px' }}>Select the medical specialty you need</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                {departments.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleDeptSelect(d)}
                    style={{
                      padding: '18px 14px', borderRadius: '16px', border: `2px solid ${dept?.id === d.id ? '#3D4DB7' : 'var(--gray-200)'}`,
                      background: dept?.id === d.id ? 'rgba(61,77,183,0.08)' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.18s ease'
                    }}
                    onMouseEnter={e => { if (dept?.id !== d.id) e.currentTarget.style.borderColor = '#3D4DB7'; }}
                    onMouseLeave={e => { if (dept?.id !== d.id) e.currentTarget.style.borderColor = 'var(--gray-200)'; }}
                  >
                    <div style={{ fontSize: '26px' }}>{d.icon || '🏥'}</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', marginTop: '10px' }}>{d.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>{d.doctors || 0} doctors</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Doctor */}
          {step === 1 && dept && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Choose a Doctor</h2>
              <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '22px' }}>{dept.icon || '🏥'} {dept.name} specialists</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {doctors.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>No doctors found in this department</p>
                ) : (
                  doctors.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => setDoctor(doc)}
                      style={{
                        padding: '16px 20px', borderRadius: '16px', border: `2px solid ${doctor?.id === doc.id ? '#3D4DB7' : 'var(--gray-200)'}`,
                        background: doctor?.id === doc.id ? 'rgba(61,77,183,0.08)' : 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px'
                      }}
                    >
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '50%', background: doctor?.id === doc.id ? '#3D4DB7' : 'var(--gray-200)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800'
                      }}>
                        {doc.name?.charAt(0) || 'D'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: '800' }}>{doc.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{doc.specialization}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>⭐ {doc.rating || 4.5} • {doc.experience || '0'} yrs exp</div>
                      </div>
                      {doctor?.id === doc.id && <div style={{ fontSize: '20px', color: '#3D4DB7' }}>✓</div>}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 2 && doctor && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Pick Date & Time</h2>
              <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '22px' }}>Available slots for {doctor.name}</p>

              <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '10px', minWidth: 'max-content' }}>
                  {days.map(d => {
                    const isActive = selectedDate === d.iso;
                    const disabled = d.isWeekend;
                    return (
                      <button
                        key={d.iso}
                        onClick={() => !disabled && setSelectedDate(d.iso)}
                        disabled={disabled}
                        style={{
                          minWidth: '70px', padding: '12px 8px', borderRadius: '14px', textAlign: 'center',
                          border: `2px solid ${isActive ? '#3D4DB7' : 'var(--gray-200)'}`,
                          background: isActive ? '#3D4DB7' : disabled ? 'var(--gray-50)' : 'white',
                          color: isActive ? 'white' : disabled ? 'var(--gray-400)' : '#374151',
                          cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1
                        }}
                      >
                        <div style={{ fontSize: '10px', fontWeight: '700' }}>{d.day}</div>
                        <div style={{ fontSize: '18px', fontWeight: '800' }}>{d.num}</div>
                        <div style={{ fontSize: '10px' }}>{d.month}</div>
                        {d.isToday && <div style={{ fontSize: '9px', fontWeight: '700', marginTop: '2px' }}>TODAY</div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Select Time</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        style={{
                          padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '700',
                          border: `2px solid ${selectedTime === time ? '#3D4DB7' : 'var(--gray-200)'}`,
                          background: selectedTime === time ? '#3D4DB7' : 'white',
                          color: selectedTime === time ? 'white' : '#374151',
                          cursor: 'pointer'
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Details */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Appointment Details</h2>
              <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '22px' }}>Almost done — a few more details</p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Appointment Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {appointmentTypes.map(t => (
                    <button
                      key={t.value}
                      onClick={() => handleDetailChange('type', t.value)}
                      style={{
                        padding: '12px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                        border: `2px solid ${details.type === t.value ? '#3D4DB7' : 'var(--gray-200)'}`,
                        background: details.type === t.value ? 'rgba(61,77,183,0.08)' : 'white', cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{t.icon}</span>
                      <span style={{ fontSize: '12px', fontWeight: '700' }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Reason / Symptoms</label>
                <textarea rows="3" className="input-field" style={{ width: '100%' }} placeholder="Describe your symptoms..." value={details.reason} onChange={e => handleDetailChange('reason', e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Additional Notes (optional)</label>
                <input type="text" className="input-field" style={{ width: '100%' }} placeholder="Any allergies, current medications..." value={details.notes} onChange={e => handleDetailChange('notes', e.target.value)} />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--gray-200)' }}>
            <button onClick={handleBack} disabled={step === 0} style={{ padding: '11px 22px', borderRadius: '12px', border: '2px solid var(--gray-200)', background: 'white', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1 }}>
              ← Back
            </button>
            {step < 3 ? (
              <button onClick={handleNext} disabled={!canNext()} className="btn-primary" style={{ opacity: canNext() ? 1 : 0.5, cursor: canNext() ? 'pointer' : 'not-allowed' }}>
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canNext() || submitting} className="btn-primary" style={{ opacity: canNext() && !submitting ? 1 : 0.5, cursor: canNext() && !submitting ? 'pointer' : 'not-allowed' }}>
                {submitting ? '⏳ Booking...' : '✅ Confirm Booking'}
              </button>
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        {step > 0 && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '22px', border: '1.5px solid var(--gray-200)', position: 'sticky', top: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>Booking Summary</h3>
            {dept && <p style={{ fontSize: '13px', marginBottom: '8px' }}><strong>Department:</strong> {dept.name}</p>}
            {doctor && <p style={{ fontSize: '13px', marginBottom: '8px' }}><strong>Doctor:</strong> {doctor.name}</p>}
            {selectedDate && <p style={{ fontSize: '13px', marginBottom: '8px' }}><strong>Date:</strong> {selectedDate}</p>}
            {selectedTime && <p style={{ fontSize: '13px', marginBottom: '8px' }}><strong>Time:</strong> {selectedTime}</p>}
            {details.type && <p style={{ fontSize: '13px' }}><strong>Type:</strong> {details.type}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;