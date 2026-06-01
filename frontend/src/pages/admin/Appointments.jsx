import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const statusConfig = {
  'Scheduled':   { cls: 'status-pending',   label: 'Scheduled',    color: '#92640a'  },
  'Confirmed':   { cls: 'status-active',    label: 'Confirmed',    color: '#166534'  },
  'Completed':   { cls: 'status-completed', label: 'Completed',    color: 'var(--blue)' },
  'Cancelled':   { cls: 'status-cancelled', label: 'Cancelled',    color: '#991b1b'  },
  'In Progress': { cls: 'status-pending',   label: 'In Progress',  color: '#92640a'  },
};

const typeColors = {
  'Checkup':      { bg: 'var(--blue-muted)',          color: 'var(--blue)'  },
  'Follow-up':    { bg: 'rgba(245,166,35,0.12)',      color: '#92640a'      },
  'Consultation': { bg: 'rgba(147,51,234,0.1)',       color: '#7c3aed'      },
  'Emergency':    { bg: 'rgba(220,38,38,0.1)',        color: '#dc2626'      },
};

const avatarColors = ['#3D4DB7','#7c3aed','#0891b2','#059669','#dc2626','#d97706','#2563eb','#0891b2'];

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await API.get('/appointments');
      // Ensure response.data is an array
      const appointmentsData = Array.isArray(response.data) ? response.data : [];
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await API.patch(`/appointments/${id}/status`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Failed to update appointment status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this appointment?')) {
      await updateAppointmentStatus(id, 'Cancelled');
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('Mark as completed?')) {
      await updateAppointmentStatus(id, 'Completed');
    }
  };

  const handleViewDetails = (apt) => {
    alert(`Patient: ${apt.patientName}\nDoctor: ${apt.doctorName}\nDate: ${apt.date}\nTime: ${apt.time}\nStatus: ${apt.status}`);
  };

  // Safely filter appointments
  const filtered = (Array.isArray(appointments) ? appointments : []).filter(a => {
    const matchSearch = 
      (a.patientName || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.doctorName || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.departmentName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchDate = !dateFilter || a.date === dateFilter;
    return matchSearch && matchStatus && matchDate;
  });

  const today = new Date().toISOString().split('T')[0];
  
  const summaryStats = [
    { label: 'Total Today',  value: (Array.isArray(appointments) ? appointments.filter(a => a.date === today).length : 0), icon: '📅', orange: false },
    { label: 'Confirmed',    value: (Array.isArray(appointments) ? appointments.filter(a => a.status === 'Confirmed').length : 0), icon: '✅', orange: false },
    { label: 'Completed',    value: (Array.isArray(appointments) ? appointments.filter(a => a.status === 'Completed').length : 0), icon: '🏁', orange: false },
    { label: 'Cancelled',    value: (Array.isArray(appointments) ? appointments.filter(a => a.status === 'Cancelled').length : 0), icon: '❌', orange: true  },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1.5px solid #fecaca' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
        <p style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626' }}>{error}</p>
        <button onClick={fetchAppointments} className="btn-primary" style={{ marginTop: '16px', fontSize: '13px' }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
            Appointments
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '5px', fontWeight: '500' }}>
            Manage all hospital appointments
          </p>
        </div>
        <button className="btn-primary" style={{ fontSize: '13px', padding: '10px 22px' }}>+ New Appointment</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '14px' }}>
        {summaryStats.map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '18px',
            padding: '18px 16px', border: '1.5px solid var(--gray-200)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              borderRadius: '18px 18px 0 0', background: s.orange ? 'var(--orange)' : 'var(--blue)',
            }} />
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--gray-900)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-400)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: 'white', borderRadius: '20px', padding: '18px 20px',
        border: '1.5px solid var(--gray-200)', display: 'flex', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--gray-50)',
          border: '1.5px solid var(--gray-200)', borderRadius: '40px', padding: '8px 16px',
          flex: 1, minWidth: '200px',
        }}>
          <span style={{ fontSize: '14px' }}>🔍</span>
          <input type="text" placeholder="Search patient, doctor..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', flex: 1 }} />
        </div>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: '40px', border: '1.5px solid var(--gray-200)', fontSize: '13px' }} />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Scheduled', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{
              padding: '7px 14px', borderRadius: '40px', border: '1.5px solid',
              borderColor: statusFilter === f ? 'var(--blue)' : 'var(--gray-200)',
              background: statusFilter === f ? 'var(--blue)' : 'white',
              color: statusFilter === f ? 'white' : 'var(--gray-600)',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer'
            }}>{f}</button>
          ))}
        </div>
        <span style={{ fontSize: '12px', marginLeft: 'auto' }}>{filtered.length} of {appointments.length} appointments</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1.5px solid var(--gray-200)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
          <p>No appointments found</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid var(--gray-200)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1.5px solid var(--gray-200)' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700' }}>Patient</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700' }}>Doctor</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700' }}>Department</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700' }}>Date & Time</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700' }}>Type</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt, i) => (
                  <tr key={apt.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: avatarColors[i % avatarColors.length], color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800'
                        }}>{apt.patientName?.[0] || 'P'}</div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>{apt.patientName}</p>
                          <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: 0 }}>ID: #{apt.id}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}><p style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>{apt.doctorName}</p></td>
                    <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', background: 'var(--blue-muted)', color: 'var(--blue)' }}>{apt.departmentName || 'General'}</span></td>
                    <td style={{ padding: '14px 16px' }}><p style={{ fontSize: '12px', fontWeight: '700', margin: 0 }}>📅 {apt.date}</p><p style={{ fontSize: '11px', margin: '2px 0 0' }}>🕐 {apt.time}</p></td>
                    <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: typeColors[apt.type]?.bg || 'var(--gray-100)', color: typeColors[apt.type]?.color || 'var(--gray-600)' }}>{apt.type || 'Checkup'}</span></td>
                    <td style={{ padding: '14px 16px' }}><span className={`status-badge ${statusConfig[apt.status]?.cls || 'status-pending'}`}>{apt.status || 'Scheduled'}</span></td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleViewDetails(apt)} style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--blue)', color: 'white', fontSize: '11px', border: 'none', cursor: 'pointer' }}>View</button>
                        {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                          <>
                            <button onClick={() => updateAppointmentStatus(apt.id, 'Completed')} style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(22,163,74,0.1)', color: '#16a34a', fontSize: '11px', border: 'none', cursor: 'pointer' }}>Complete</button>
                            <button onClick={() => handleCancel(apt.id)} style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(220,38,38,0.1)', color: '#dc2626', fontSize: '11px', border: 'none', cursor: 'pointer' }}>Cancel</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;