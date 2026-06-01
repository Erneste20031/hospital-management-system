import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';

const AddDepartment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('/departments', formData);
      navigate('/departments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add department');
      setLoading(false);
    }
  };

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
              Add New Department
            </h1>
            <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '5px' }}>
              Create a new hospital department
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
                className="input-field"
              />
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
              disabled={loading}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '14px' }}
            >
              {loading ? 'Creating...' : '+ Create Department'}
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

export default AddDepartment;