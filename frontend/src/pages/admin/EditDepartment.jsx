import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../../services/api';

const EditDepartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    icon: '🏥',
    head: '',
    doctors: 0,
    patients: 0,
    beds: 0,
    available: 0,
    status: 'Active',
    description: ''
  });

  const iconOptions = ['❤️', '👶', '🧠', '🦴', '🚨', '🔬', '🌸', '⚕️', '🏥', '👁️', '🩺', '💊'];

  // Fetch department data on load
  useEffect(() => {
    fetchDepartment();
  }, [id]);

  const fetchDepartment = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/departments/${id}`);
      const dept = response.data;
      setFormData({
        name: dept.name || '',
        icon: dept.icon || '🏥',
        head: dept.head || '',
        doctors: dept.doctors || 0,
        patients: dept.patients || 0,
        beds: dept.beds || 0,
        available: dept.available || 0,
        status: dept.status || 'Active',
        description: dept.description || ''
      });
    } catch (err) {
      console.error('Error fetching department:', err);
      setError('Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await API.put(`/departments/${id}`, formData);
      navigate('/departments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department');
      setSubmitting(false);
    }
  };

  // Calculate occupancy
  const occupancy = formData.beds > 0 
    ? Math.round((formData.beds - formData.available) / formData.beds * 100) 
    : 0;
  const isCritical = occupancy >= 80;

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          border: '1.5px solid var(--gray-200)',
          padding: '60px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏥</div>
          <p style={{ color: 'var(--gray-400)', fontWeight: '500' }}>Loading department data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        border: '1.5px solid var(--gray-200)',
        padding: '32px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
              Edit Department
            </h1>
            <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '5px' }}>
              Update department information
            </p>
          </div>
          <Link to="/departments" style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1.5px solid var(--gray-200)',
            textDecoration: 'none',
            color: 'var(--gray-600)',
            fontSize: '13px',
            fontWeight: '600',
          }}>
            Cancel
          </Link>
        </div>

        {/* Preview Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--blue-muted) 0%, rgba(61,77,183,0.03) 100%)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid var(--gray-200)',
        }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gray-400)', marginBottom: '12px', textTransform: 'uppercase' }}>
            Preview
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px',
              background: isCritical ? 'rgba(220,38,38,0.1)' : 'var(--blue-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px',
            }}>
              {formData.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
                {formData.name || 'Department Name'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
                Head: {formData.head || '—'}
              </p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <span style={{
                fontSize: '12px', fontWeight: '700',
                padding: '4px 12px', borderRadius: '20px',
                background: isCritical ? 'rgba(220,38,38,0.1)' : 'rgba(22,163,74,0.1)',
                color: isCritical ? '#dc2626' : '#16a34a',
              }}>
                {occupancy}% Occupied
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.08)',
            border: '1.5px solid rgba(220,38,38,0.2)',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Department Name */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', display: 'block', marginBottom: '6px' }}>
                Department Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Cardiology"
                className="input-field"
              />
            </div>

            {/* Icon */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', display: 'block', marginBottom: '6px' }}>
                Icon
              </label>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="input-field"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon} {icon === '❤️' ? 'Heart' : icon === '👶' ? 'Baby' : icon === '🧠' ? 'Brain' : icon === '🦴' ? 'Bone' : icon === '🚨' ? 'Emergency' : icon === '🔬' ? 'Lab' : icon === '🌸' ? 'Women' : icon === '⚕️' ? 'Surgery' : 'Default'}</option>
                ))}
              </select>
            </div>

            {/* Head of Department */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', display: 'block', marginBottom: '6px' }}>
                Head of Department
              </label>
              <input
                type="text"
                name="head"
                value={formData.head}
                onChange={handleChange}
                placeholder="e.g., Dr. Sarah Johnson"
                className="input-field"
              />
            </div>

            {/* Status */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', display: 'block', marginBottom: '6px' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Active">Active</option>
                <option value="Critical">Critical</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Doctors Count */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', display: 'block', marginBottom: '6px' }}>
                Number of Doctors
              </label>
              <input
                type="number"
                name="doctors"
                value={formData.doctors}
                onChange={handleChange}
                min="0"
                className="input-field"
              />
            </div>

            {/* Patients Count */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', display: 'block', marginBottom: '6px' }}>
                Current Patients
              </label>
              <input
                type="number"
                name="patients"
                value={formData.patients}
                onChange={handleChange}
                min="0"
                className="input-field"
              />
            </div>

            {/* Total Beds */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', display: 'block', marginBottom: '6px' }}>
                Total Beds
              </label>
              <input
                type="number"
                name="beds"
                value={formData.beds}
                onChange={handleChange}
                min="0"
                className="input-field"
              />
            </div>

            {/* Available Beds */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', display: 'block', marginBottom: '6px' }}>
                Available Beds
              </label>
              <input
                type="number"
                name="available"
                value={formData.available}
                onChange={handleChange}
                min="0"
                max={formData.beds}
                className="input-field"
              />
              {formData.available > formData.beds && (
                <p style={{ fontSize: '10px', color: '#dc2626', marginTop: '4px' }}>
                  Available beds cannot exceed total beds
                </p>
              )}
            </div>

            {/* Description */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', display: 'block', marginBottom: '6px' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Department description..."
                className="input-field"
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button
              type="submit"
              disabled={submitting || formData.available > formData.beds}
              className="btn-primary"
              style={{ 
                padding: '12px 24px', 
                fontSize: '14px',
                opacity: (submitting || formData.available > formData.beds) ? 0.6 : 1,
                cursor: (submitting || formData.available > formData.beds) ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Saving...' : '💾 Save Changes'}
            </button>
            <Link
              to="/departments"
              className="btn-secondary"
              style={{ textDecoration: 'none', padding: '12px 24px', fontSize: '14px', display: 'inline-block' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartment;