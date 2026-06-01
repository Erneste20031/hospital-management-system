import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';

const avatarColors = ['#3D4DB7', '#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706'];

const bloodGroupColor = {
  'O+': { bg: '#fef2f2', color: '#dc2626' },
  'O-': { bg: '#fef2f2', color: '#dc2626' },
  'A+': { bg: '#eff6ff', color: '#2563eb' },
  'A-': { bg: '#eff6ff', color: '#2563eb' },
  'B+': { bg: '#f0fdf4', color: '#16a34a' },
  'B-': { bg: '#f0fdf4', color: '#16a34a' },
  'AB+':{ bg: '#fdf4ff', color: '#9333ea' },
  'AB-':{ bg: '#fdf4ff', color: '#9333ea' },
};

const emptyEditForm = {
  firstName: '', lastName: '', age: '', gender: 'Male',
  phone: '', email: '', address: '', bloodGroup: 'O+', status: 'Active',
};

const Patients = () => {
  const navigate = useNavigate();
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // EXACTLY 3 items per page

  // Modal state
  const [viewing, setViewing] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyEditForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPatients(); }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, genderFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await API.get('/patients');
      setAllPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (p) => setViewing(p);

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      firstName: p.first_name || '',
      lastName: p.last_name || '',
      age: p.age || '',
      gender: p.gender || 'Male',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      bloodGroup: p.blood_group || 'O+',
      status: p.status || 'Active',
    });
  };

  const handleDelete = async (p) => {
    const name = `${p.first_name || ''} ${p.last_name || ''}`.trim();
    if (!window.confirm(`Delete patient "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/patients/${p.id}`);
      setAllPatients(prev => prev.filter(x => x.id !== p.id));
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete patient');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/patients/${editingId}`, form);
      await fetchPatients();
      setEditingId(null);
      setForm(emptyEditForm);
    } catch (error) {
      console.error('Save error:', error);
      alert(error.response?.data?.message || 'Failed to save patient');
    } finally {
      setSaving(false);
    }
  };

  // 1. First, filter the data
  const filtered = allPatients.filter(p => {
    const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) ||
                        (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.phone || '').includes(search);
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchGender = genderFilter === 'All' || p.gender === genderFilter;
    return matchSearch && matchStatus && matchGender;
  });

  // 2. Then, calculate pagination based on the filtered data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const stats = [
    { label: 'Total Patients',   value: allPatients.length,                                       icon: '👥',  orange: false },
    { label: 'Active Patients',  value: allPatients.filter(p => p.status === 'Active').length,    icon: '✅',  orange: false },
    { label: 'Inactive',         value: allPatients.filter(p => p.status === 'Inactive').length,  icon: '⏸️', orange: true  },
    { label: 'New This Month',   value: allPatients.filter(p => {
      if (!p.created_at) return false;
      const d = new Date(p.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length, icon: '🆕', orange: true  },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>👥</div>
          <p style={{ color: 'var(--gray-400)', fontWeight: '500' }}>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
            All <span style={{ color: 'var(--orange)' }}>Patients</span>
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '5px', fontWeight: '500' }}>
            👥 View and manage all patient records
          </p>
        </div>
        <Link to="/register-patient" className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px', padding: '10px 22px' }}>
          + Register Patient
        </Link>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '18px', padding: '18px 16px', border: '1.5px solid var(--gray-200)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', borderRadius: '18px 18px 0 0', background: s.orange ? 'var(--orange)' : 'var(--blue)' }} />
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--gray-900)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-400)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '18px 20px', border: '1.5px solid var(--gray-200)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)', borderRadius: '40px', padding: '8px 16px', flex: 1, minWidth: '220px' }}>
          <span style={{ fontSize: '14px' }}>🔍</span>
          <input type="text" placeholder="Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', fontFamily: 'inherit', color: 'var(--gray-900)', flex: 1 }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '14px', padding: 0 }}>✕</button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Active', 'Inactive'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{
              padding: '7px 16px', borderRadius: '40px', border: '1.5px solid',
              borderColor: statusFilter === f ? 'var(--blue)' : 'var(--gray-200)',
              background: statusFilter === f ? 'var(--blue)' : 'white',
              color: statusFilter === f ? 'white' : 'var(--gray-600)',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
            }}>{f}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Male', 'Female'].map(f => (
            <button key={f} onClick={() => setGenderFilter(f)} style={{
              padding: '7px 16px', borderRadius: '40px', border: '1.5px solid',
              borderColor: genderFilter === f ? 'var(--orange)' : 'var(--gray-200)',
              background: genderFilter === f ? 'var(--orange)' : 'white',
              color: genderFilter === f ? 'white' : 'var(--gray-600)',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1.5px solid var(--gray-200)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-900)' }}>No patients found</p>
          <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '4px' }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid var(--gray-200)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '1.5px solid var(--gray-200)' }}>
                {['Patient', 'Contact', 'Age / Gender', 'Blood Group', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* USING currentPatients INSTEAD OF filtered HERE */}
              {currentPatients.map((p, i) => {
                const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown';
                const initial = fullName[0] || 'P';
                return (
                  <tr key={p.id} style={{ borderBottom: i < currentPatients.length - 1 ? '1px solid var(--gray-200)' : 'none', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(61,77,183,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: avatarColors[i % avatarColors.length], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', flexShrink: 0 }}>{initial}</div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>{fullName}</p>
                          <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: 0, marginTop: '2px' }}>ID: #{String(p.id).padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-600)', margin: 0 }}>{p.phone || '—'}</p>
                      <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: 0, marginTop: '2px' }}>{p.email || '—'}</p>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: p.gender === 'Female' ? '#9333ea' : 'var(--blue)', background: p.gender === 'Female' ? '#fdf4ff' : 'var(--blue-muted)', padding: '4px 10px', borderRadius: '20px' }}>
                        {p.gender === 'Female' ? '♀' : '♂'} {p.age || '—'} yrs
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', background: bloodGroupColor[p.blood_group]?.bg || '#fef2f2', color: bloodGroupColor[p.blood_group]?.color || '#dc2626', padding: '4px 10px', borderRadius: '20px' }}>
                        🩸 {p.blood_group || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`status-badge ${p.status === 'Active' ? 'status-active' : 'status-cancelled'}`}>{p.status || 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleView(p)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--blue)', color: 'white', fontSize: '11px', fontWeight: '700', fontFamily: 'inherit' }}>View</button>
                        <button onClick={() => handleEdit(p)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid var(--gray-200)', cursor: 'pointer', background: 'white', color: 'var(--gray-600)', fontSize: '11px', fontWeight: '700', fontFamily: 'inherit' }}>Edit</button>
                        <button onClick={() => handleDelete(p)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #fee2e2', cursor: 'pointer', background: '#fef2f2', color: '#dc2626', fontSize: '11px', fontWeight: '700', fontFamily: 'inherit' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* REAL FUNCTIONAL PAGINATION */}
      {filtered.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500' }}>
            Showing <strong>{indexOfFirstItem + 1}</strong> - <strong>{Math.min(indexOfLastItem, filtered.length)}</strong> of <strong>{filtered.length}</strong> patients
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Previous Button */}
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
              disabled={currentPage === 1}
              style={{
                width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid var(--gray-200)',
                background: currentPage === 1 ? 'var(--gray-50)' : 'white',
                color: currentPage === 1 ? 'var(--gray-400)' : 'var(--gray-600)',
                fontSize: '12px', fontWeight: '700', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>←</button>

            {/* Dynamic Page Numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              const isActive = currentPage === pageNumber;
              return (
                <button 
                  key={pageNumber} 
                  onClick={() => setCurrentPage(pageNumber)} 
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid',
                    borderColor: isActive ? 'var(--blue)' : 'var(--gray-200)',
                    background: isActive ? 'var(--blue)' : 'white',
                    color: isActive ? 'white' : 'var(--gray-600)',
                    fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {pageNumber}
                </button>
              );
            })}

            {/* Next Button */}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
              disabled={currentPage === totalPages || totalPages === 0}
              style={{
                width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid var(--gray-200)',
                background: currentPage === totalPages || totalPages === 0 ? 'var(--gray-50)' : 'white',
                color: currentPage === totalPages || totalPages === 0 ? 'var(--gray-400)' : 'var(--gray-600)',
                fontSize: '12px', fontWeight: '700', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', 
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>→</button>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewing && (
        <div onClick={() => setViewing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '500px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--gray-900)' }}>Patient Details</h2>
              <button onClick={() => setViewing(null)} style={{ border: 'none', background: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            {[
              ['Name', `${viewing.first_name || ''} ${viewing.last_name || ''}`.trim()],
              ['Email', viewing.email],
              ['Phone', viewing.phone],
              ['Alt Phone', viewing.alt_phone],
              ['DOB', viewing.dob],
              ['Age', viewing.age],
              ['Gender', viewing.gender],
              ['Blood Group', viewing.blood_group],
              ['Address', viewing.address],
              ['City', viewing.city],
              ['Emergency Contact', viewing.emergency_contact],
              ['Emergency Phone', viewing.emergency_phone],
              ['Allergies', viewing.allergies],
              ['Conditions', viewing.conditions],
              ['Department', viewing.department],
              ['Insurance', viewing.insurance_provider],
              ['Insurance #', viewing.insurance_number],
              ['Status', viewing.status],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '13px' }}>
                <span style={{ fontWeight: '700', color: 'var(--gray-600)', width: '140px', flexShrink: 0 }}>{k}:</span>
                <span style={{ color: 'var(--gray-900)' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div onClick={() => setEditingId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={handleSave} onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '520px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Edit Patient</h2>
              <button type="button" onClick={() => setEditingId(null)} style={{ border: 'none', background: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                ['firstName', 'First Name', 'text'],
                ['lastName', 'Last Name', 'text'],
                ['age', 'Age', 'number'],
                ['phone', 'Phone', 'text'],
                ['email', 'Email', 'email'],
              ].map(([k, label, type]) => (
                <div key={k}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)' }}>{label}</label>
                  <input type={type} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--gray-200)', fontSize: '13px', marginTop: '4px', fontFamily: 'inherit' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)' }}>Gender</label>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--gray-200)', fontSize: '13px', marginTop: '4px', fontFamily: 'inherit' }}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)' }}>Blood Group</label>
                <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--gray-200)', fontSize: '13px', marginTop: '4px', fontFamily: 'inherit' }}>
                  {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)' }}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--gray-200)', fontSize: '13px', marginTop: '4px', fontFamily: 'inherit' }}>
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)' }}>Address</label>
                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--gray-200)', fontSize: '13px', marginTop: '4px', fontFamily: 'inherit' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditingId(null)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1.5px solid var(--gray-200)', background: 'white', color: 'var(--gray-600)', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: 'var(--blue)', color: 'white', fontWeight: '700', fontSize: '13px', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'inherit' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Patients;