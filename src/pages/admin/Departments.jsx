import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const accentColors = [
  'var(--blue)', 'var(--orange)', '#7c3aed', '#0891b2',
  '#dc2626',     '#059669',       '#d97706',  '#2563eb',
];

const Departments = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState('');

  // Fetch departments from API
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
      setError('Failed to load departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = departments.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.head?.toLowerCase().includes(search.toLowerCase())
  );

  const totalBeds     = departments.reduce((s, d) => s + (d.beds || 0), 0);
  const totalAvail    = departments.reduce((s, d) => s + (d.available || 0), 0);
  const totalDoctors  = departments.reduce((s, d) => s + (d.doctors || 0), 0);
  const totalPatients = departments.reduce((s, d) => s + (d.patients || 0), 0);

  const summaryStats = [
    { label: 'Departments',      value: departments.length, icon: '🏥', orange: false },
    { label: 'Total Doctors',    value: totalDoctors,       icon: '👨‍⚕️', orange: false },
    { label: 'Total Patients',   value: totalPatients,      icon: '👥', orange: true  },
    { label: 'Available Beds',   value: totalAvail,         icon: '🛏️', orange: true  },
  ];

  // Handle delete department
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} department?`)) {
      try {
        await API.delete(`/departments/${id}`);
        fetchDepartments(); // Refresh the list
      } catch (err) {
        console.error('Error deleting department:', err);
        alert('Failed to delete department');
      }
    }
  };

  // Handle edit department
  const handleEdit = (id) => {
    navigate(`/departments/edit/${id}`);
  };

  // ── Loading Skeleton ──
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '14px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '18px', height: '90px',
            border: '1.5px solid var(--gray-200)',
            animation: 'pulse 1.5s infinite',
            opacity: 0.6,
          }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '18px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '20px', height: '260px',
            border: '1.5px solid var(--gray-200)',
            animation: 'pulse 1.5s infinite',
            opacity: 0.6,
          }} />
        ))}
      </div>
    </div>
  );

  // ── Error State ──
  if (error) return (
    <div style={{
      textAlign: 'center', padding: '60px 20px',
      background: 'white', borderRadius: '20px',
      border: '1.5px solid #fecaca',
    }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
      <p style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626' }}>{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary"
        style={{ marginTop: '16px', fontSize: '13px' }}
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
            Hospital <span style={{ color: 'var(--orange)' }}>Departments</span>
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '5px', fontWeight: '500' }}>
            🏥 Manage departments, beds and staff
          </p>
        </div>
        <button 
          className="btn-primary" 
          style={{ fontSize: '13px', padding: '10px 22px' }}
          onClick={() => navigate('/departments/new')}
        >
          + Add Department
        </button>
      </div>

      {/* ── Summary Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '14px' }}>
        {summaryStats.map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '18px',
            padding: '18px 16px', border: '1.5px solid var(--gray-200)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: '4px', borderRadius: '18px 18px 0 0',
              background: s.orange ? 'var(--orange)' : 'var(--blue)',
            }} />
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--gray-900)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-400)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'white', border: '1.5px solid var(--gray-200)',
        borderRadius: '40px', padding: '8px 16px',
        maxWidth: '380px',
      }}>
        <span style={{ fontSize: '14px' }}>🔍</span>
        <input
          type="text"
          placeholder="Search department or head doctor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontSize: '13px', fontFamily: 'inherit',
            color: 'var(--gray-900)', flex: 1,
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            border: 'none', background: 'none', cursor: 'pointer',
            color: 'var(--gray-400)', fontSize: '14px', padding: 0,
          }}>✕</button>
        )}
      </div>

      {/* ── Department Cards ── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'white', borderRadius: '20px',
          border: '1.5px solid var(--gray-200)',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-900)' }}>No departments found</p>
          <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '4px' }}>Try a different search term</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '18px' }}>
          {filtered.map((dept, i) => {
            const beds = dept.beds || 0;
            const available = dept.available || 0;
            const occupancy = beds > 0 ? Math.round((beds - available) / beds * 100) : 0;
            const isCritical = occupancy >= 80;
            const accent = dept.color || accentColors[i % accentColors.length];

            return (
              <div
                key={dept.id}
                style={{
                  background: 'white', borderRadius: '20px',
                  padding: '22px', border: '1.5px solid var(--gray-200)',
                  transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(61,77,183,0.12)';
                  e.currentTarget.style.borderColor = accent;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--gray-200)';
                }}
              >
                {/* Accent bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '4px', borderRadius: '20px 20px 0 0',
                  background: accent,
                }} />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px',
                      background: `${accent}18`,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '22px',
                    }}>
                      {dept.icon || '🏥'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
                        {dept.name}
                      </h3>
                      <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: '2px 0 0', fontWeight: '500' }}>
                        Head: {dept.head || '—'}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: '700',
                    padding: '4px 10px', borderRadius: '20px',
                    background: dept.status === 'Critical' ? 'rgba(220,38,38,0.1)' : 'rgba(22,163,74,0.1)',
                    color: dept.status === 'Critical' ? '#dc2626' : '#16a34a',
                  }}>
                    {dept.status || 'Active'}
                  </span>
                </div>

                {/* Stats row */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px', marginBottom: '16px',
                }}>
                  {[
                    { label: 'Doctors',  value: dept.doctors || 0,  icon: '👨‍⚕️' },
                    { label: 'Patients', value: dept.patients || 0, icon: '👥'  },
                    { label: 'Beds',     value: dept.beds || 0,     icon: '🛏️' },
                  ].map(({ label, value, icon }) => (
                    <div key={label} style={{
                      background: 'var(--gray-50)', borderRadius: '12px',
                      padding: '10px 8px', textAlign: 'center',
                      border: '1px solid var(--gray-200)',
                    }}>
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>{icon}</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--gray-900)', lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gray-400)', marginTop: '2px' }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Bed availability */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-600)' }}>
                      Bed Occupancy
                    </span>
                    <span style={{
                      fontSize: '12px', fontWeight: '800',
                      color: isCritical ? '#dc2626' : occupancy >= 60 ? '#d97706' : '#16a34a',
                    }}>
                      {occupancy}%
                      {isCritical && ' ⚠️'}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{
                    width: '100%', height: '8px',
                    background: 'var(--gray-200)', borderRadius: '20px', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: '20px',
                      width: `${occupancy}%`,
                      background: isCritical
                        ? 'linear-gradient(90deg, #dc2626, #ef4444)'
                        : occupancy >= 60
                        ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                        : `linear-gradient(90deg, ${accent}, ${accent}aa)`,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500' }}>
                      {beds - available} occupied
                    </span>
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>
                      {available} available
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleEdit(dept.id)}
                    style={{
                      flex: 1, padding: '9px', borderRadius: '12px',
                      border: 'none', cursor: 'pointer',
                      background: accent, color: 'white',
                      fontSize: '12px', fontWeight: '700',
                      fontFamily: 'inherit', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleEdit(dept.id)}
                    style={{
                      flex: 1, padding: '9px', borderRadius: '12px',
                      border: '1.5px solid var(--gray-200)', cursor: 'pointer',
                      background: 'white', color: 'var(--gray-600)',
                      fontSize: '12px', fontWeight: '700',
                      fontFamily: 'inherit', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = accent;
                      e.currentTarget.style.color = accent;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--gray-200)';
                      e.currentTarget.style.color = 'var(--gray-600)';
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(dept.id, dept.name)}
                    style={{
                      padding: '9px 12px', borderRadius: '12px',
                      border: '1.5px solid rgba(220,38,38,0.2)', cursor: 'pointer',
                      background: 'rgba(220,38,38,0.06)', color: '#dc2626',
                      fontSize: '12px', fontWeight: '700',
                      fontFamily: 'inherit', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.06)'}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Departments;