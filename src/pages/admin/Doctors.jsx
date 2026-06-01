import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const avatarColors = ['#3D4DB7', '#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706'];

const statusConfig = {
  'Available': { cls: 'status-active',    dot: '#16a34a' },
  'Busy':      { cls: 'status-pending',   dot: '#F5A623' },
  'On Leave':  { cls: 'status-cancelled', dot: '#dc2626' },
};

const emptyForm = {
  name: '', email: '', specialization: '', qualification: '',
  experience: '', phone: '', department: '', status: 'Available', rating: 4.5,
};

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{
          fontSize: '11px',
          color: i < full || (i === full && half) ? '#F5A623' : '#d1d5db',
        }}>★</span>
      ))}
      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gray-600)', marginLeft: '3px' }}>
        {rating}
      </span>
    </span>
  );
};

const getInitial = (name) => {
  if (!name) return 'D';
  const parts = name.replace(/^Dr\.?\s+/i, '').trim().split(/\s+/);
  return (parts[0]?.[0] || 'D').toUpperCase();
};

const Doctors = () => {
  const navigate = useNavigate();
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);   // null = add, number = edit
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Profile modal
  const [profileDoctor, setProfileDoctor] = useState(null);

  const filters = ['All', 'Available', 'Busy', 'On Leave'];

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/doctors');
      setAllDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (doctor) => {
    setEditingId(doctor.id);
    setForm({
      name: doctor.name || '',
      email: doctor.email || '',
      specialization: doctor.specialization || '',
      qualification: doctor.qualification || '',
      experience: doctor.experience || '',
      phone: doctor.phone || '',
      department: doctor.department || '',
      status: doctor.status || 'Available',
      rating: doctor.rating || 4.5,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        // Update — backend PUT /:id takes only doctor fields (not name/email)
        const { specialization, qualification, experience, phone, department, status, rating } = form;
        await API.put(`/doctors/${editingId}`, { specialization, qualification, experience, phone, department, status, rating });
      } else {
        await API.post('/doctors', form);
      }
      await fetchDoctors();
      closeModal();
    } catch (err) {
      console.error('Save doctor error:', err);
      alert(err.response?.data?.message || 'Failed to save doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doctor) => {
    if (!window.confirm(`Delete ${doctor.name}? This cannot be undone.`)) return;
    try {
      await API.delete(`/doctors/${doctor.id}`);
      await fetchDoctors();
    } catch (err) {
      console.error('Delete doctor error:', err);
      alert(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const handleSchedule = (doctor) => {
    // Jump to appointments page filtered by this doctor
    navigate(`/admin/appointments?doctorId=${doctor.id}`);
  };

  const filtered = allDoctors.filter(d => {
    const matchSearch = d.name?.toLowerCase().includes(search.toLowerCase()) ||
                        d.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || d.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = [
    { label: 'Total Doctors',  value: allDoctors.length,                                          icon: '👨‍⚕️', orange: false },
    { label: 'Available Now',  value: allDoctors.filter(d => d.status === 'Available').length,   icon: '✅',   orange: false },
    { label: 'Currently Busy', value: allDoctors.filter(d => d.status === 'Busy').length,        icon: '🔴',   orange: true  },
    { label: 'On Leave',       value: allDoctors.filter(d => d.status === 'On Leave').length,    icon: '🏖️',  orange: true  },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>👨‍⚕️</div>
          <p style={{ color: 'var(--gray-400)', fontWeight: '500' }}>Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
            Our <span style={{ color: 'var(--orange)' }}>Doctors</span>
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '5px', fontWeight: '500' }}>
            👨‍⚕️ Manage hospital doctors and specialists
          </p>
        </div>
        <button className="btn-primary" style={{ fontSize: '13px', padding: '10px 22px' }} onClick={openAdd}>
          + Add New Doctor
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '18px', padding: '18px 16px',
            border: '1.5px solid var(--gray-200)', position: 'relative', overflow: 'hidden',
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

      {/* Search + Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'white', border: '1.5px solid var(--gray-200)',
          borderRadius: '40px', padding: '8px 16px', flex: 1, maxWidth: '340px',
        }}>
          <span style={{ fontSize: '14px', color: 'var(--gray-400)' }}>🔍</span>
          <input
            type="text" placeholder="Search by name or specialization..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', fontFamily: 'inherit', color: 'var(--gray-900)', flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '7px 16px', borderRadius: '40px', border: '1.5px solid',
                borderColor: filter === f ? 'var(--blue)' : 'var(--gray-200)',
                background: filter === f ? 'var(--blue)' : 'white',
                color: filter === f ? 'white' : 'var(--gray-600)',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1.5px solid var(--gray-200)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-900)' }}>No doctors found</p>
          <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '4px' }}>Try adjusting your search or filter</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          {filtered.map((doctor, i) => (
            <div key={doctor.id} style={{
              background: 'white', borderRadius: '20px', padding: '22px',
              border: '1.5px solid var(--gray-200)', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                borderRadius: '20px 20px 0 0',
                background: i % 2 === 0 ? 'var(--blue)' : 'var(--orange)',
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: avatarColors[i % avatarColors.length],
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: '800', flexShrink: 0,
                  }}>{getInitial(doctor.name)}</div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>{doctor.name}</h3>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--blue)', margin: '2px 0 0' }}>{doctor.specialization}</p>
                  </div>
                </div>
                <span className={`status-badge ${statusConfig[doctor.status]?.cls || 'status-active'}`}>
                  {doctor.status || 'Available'}
                </span>
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
                padding: '14px', background: 'var(--gray-50)', borderRadius: '14px', marginBottom: '14px',
              }}>
                {[
                  { icon: '🏥', text: doctor.department },
                  { icon: '🎓', text: `${doctor.qualification || ''} · ${doctor.experience || ''}` },
                  { icon: '📧', text: doctor.email },
                  { icon: '📞', text: doctor.phone },
                ].map(({ icon, text }, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: '12px', color: 'var(--gray-600)', fontWeight: '500' }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* Stats row — removed `patients` (not in DB) */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-around',
                padding: '10px 14px',
                background: i % 2 === 0 ? 'var(--blue-muted)' : 'rgba(245,166,35,0.08)',
                borderRadius: '12px', marginBottom: '14px',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <StarRating rating={doctor.rating || 4.5} />
                  <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gray-400)', marginTop: '2px' }}>Rating</div>
                </div>
                <div style={{ width: '1px', height: '28px', background: 'var(--gray-200)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--gray-900)' }}>
                    {String(doctor.experience || '').split(' ')[0] || '0'}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gray-400)' }}>Yrs Exp</div>
                </div>
              </div>

              {/* Actions — all wired */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleSchedule(doctor)} style={{
                  flex: 1, padding: '9px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  background: 'var(--blue)', color: 'white', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit',
                }}>📅 Schedule</button>
                <button onClick={() => setProfileDoctor(doctor)} style={{
                  flex: 1, padding: '9px', borderRadius: '12px',
                  border: '1.5px solid var(--gray-200)', cursor: 'pointer',
                  background: 'white', color: 'var(--gray-600)', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit',
                }}>👤 Profile</button>
                <button onClick={() => openEdit(doctor)} title="Edit" style={{
                  padding: '9px 12px', borderRadius: '12px',
                  border: '1.5px solid var(--gray-200)', cursor: 'pointer',
                  background: 'white', color: 'var(--gray-600)', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit',
                }}>✏️</button>
                <button onClick={() => handleDelete(doctor)} title="Delete" style={{
                  padding: '9px 12px', borderRadius: '12px',
                  border: '1.5px solid rgba(220,38,38,0.2)', cursor: 'pointer',
                  background: 'rgba(220,38,38,0.06)', color: '#dc2626', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit',
                }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div onClick={closeModal} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleSave} style={{
            background: 'white', borderRadius: '20px', padding: '28px',
            width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h2 style={{ margin: '0 0 18px', fontSize: '20px', fontWeight: '800' }}>
              {editingId ? 'Edit Doctor' : 'Add New Doctor'}
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {!editingId && (
                <>
                  <input required placeholder="Full Name" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                  <input required type="email" placeholder="Email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                </>
              )}
              <input required placeholder="Specialization" value={form.specialization}
                onChange={e => setForm({ ...form, specialization: e.target.value })} style={inputStyle} />
              <input placeholder="Qualification (e.g. MBBS, MD)" value={form.qualification}
                onChange={e => setForm({ ...form, qualification: e.target.value })} style={inputStyle} />
              <input placeholder="Experience (e.g. 5 years)" value={form.experience}
                onChange={e => setForm({ ...form, experience: e.target.value })} style={inputStyle} />
              <input placeholder="Phone" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              <input required placeholder="Department" value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })} style={inputStyle} />
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="On Leave">On Leave</option>
              </select>
              <input type="number" step="0.1" min="0" max="5" placeholder="Rating" value={form.rating}
                onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={closeModal} style={btnSecondary}>Cancel</button>
              <button type="submit" disabled={saving} style={btnPrimary}>
                {saving ? 'Saving...' : (editingId ? 'Update' : 'Add Doctor')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profile Modal */}
      {profileDoctor && (
        <div onClick={() => setProfileDoctor(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '460px',
          }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '800' }}>{profileDoctor.name}</h2>
            <p style={{ margin: '0 0 18px', color: 'var(--blue)', fontWeight: '600' }}>{profileDoctor.specialization}</p>
            <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
              <div><b>Department:</b> {profileDoctor.department}</div>
              <div><b>Qualification:</b> {profileDoctor.qualification}</div>
              <div><b>Experience:</b> {profileDoctor.experience}</div>
              <div><b>Email:</b> {profileDoctor.email}</div>
              <div><b>Phone:</b> {profileDoctor.phone}</div>
              <div><b>Status:</b> {profileDoctor.status}</div>
              <div><b>Rating:</b> <StarRating rating={profileDoctor.rating || 4.5} /></div>
            </div>
            <button onClick={() => setProfileDoctor(null)} style={{ ...btnPrimary, marginTop: '20px', width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--gray-200)',
  fontSize: '13px', fontFamily: 'inherit', outline: 'none',
};
const btnPrimary = {
  padding: '10px 20px', borderRadius: '10px', border: 'none',
  background: 'var(--blue)', color: 'white', fontSize: '13px', fontWeight: '700',
  cursor: 'pointer', fontFamily: 'inherit',
};
const btnSecondary = {
  padding: '10px 20px', borderRadius: '10px',
  border: '1.5px solid var(--gray-200)', background: 'white',
  color: 'var(--gray-600)', fontSize: '13px', fontWeight: '700',
  cursor: 'pointer', fontFamily: 'inherit',
};

export default Doctors;
