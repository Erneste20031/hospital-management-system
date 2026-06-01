import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

const typeColors = {
  Checkup:      { bg: 'var(--blue-muted)',      color: 'var(--blue)'  },
  'Follow-up':  { bg: 'rgba(245,166,35,0.12)', color: '#92640a'      },
  Consultation: { bg: 'rgba(147,51,234,0.1)',  color: '#7c3aed'      },
  Emergency:    { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626'      },
};

const fmtDate = (iso) => {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const cleanDoctorName = (name) => {
  if (!name) return 'Unknown';
  let cleanName = name.replace(/^Dr\.?\s*/i, '');
  return cleanName;
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'visits',        label: 'Visit History',   icon: '🏥' },
  { id: 'prescriptions', label: 'Prescriptions',   icon: '💊' },
  { id: 'documents',     label: 'Documents',       icon: '📁' },
];

// ── Visit Card ────────────────────────────────────────────────────────────────

const VisitCard = ({ visit }) => {
  const [expanded, setExpanded] = useState(false);

  const deptColor = visit.deptColor || '#3D4DB7';
  const deptBg = visit.deptBg || 'rgba(61,77,183,0.08)';

  return (
    <div style={{
      border: `1.5px solid ${expanded ? deptColor : 'var(--gray-200)'}`,
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'white',
      marginBottom: '12px',
    }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: expanded ? `${deptBg}` : 'white',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.2s ease',
        }}
      >
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          flexShrink: 0,
          background: deptColor,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '800',
        }}>{visit.avatar || cleanDoctorName(visit.doctorName).charAt(0) || 'D'}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--gray-900)' }}>
              {visit.diagnosis || 'Consultation'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: '500' }}>
              Dr. {cleanDoctorName(visit.doctorName)}
            </span>
            <span style={{ color: 'var(--gray-300)' }}>•</span>
            <span style={{
              fontSize: '10px', fontWeight: '700',
              background: deptBg, color: deptColor,
              padding: '2px 6px', borderRadius: '16px',
            }}>
              {visit.departmentIcon || '🏥'} {visit.departmentName || visit.department}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gray-900)' }}>
            📅 {fmtDate(visit.date)}
          </span>
          <div style={{
            fontSize: '16px', color: 'var(--gray-400)',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.25s ease',
            marginTop: '4px',
          }}>⌄</div>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 16px 16px', borderTop: `1px solid ${deptColor}22` }}>
          {visit.notes && (
            <div style={{ marginTop: '14px', padding: '12px', background: 'var(--gray-50)', borderRadius: '12px', borderLeft: `3px solid ${deptColor}` }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--gray-400)', marginBottom: '4px', letterSpacing: '0.5px' }}>
                DOCTOR'S NOTES
              </div>
              <p style={{ fontSize: '12px', color: 'var(--gray-700)', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
                {visit.notes}
              </p>
            </div>
          )}

          {visit.prescriptions && visit.prescriptions.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gray-700)', marginBottom: '8px' }}>
                💊 Prescriptions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {visit.prescriptions.map((p, i) => (
                  <div key={i} style={{
                    padding: '8px 10px', background: 'var(--gray-50)',
                    borderRadius: '10px', border: '1px solid var(--gray-200)',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gray-900)' }}>{p.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: '500', marginTop: '2px' }}>
                      {p.freq} · {p.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Prescriptions Tab ─────────────────────────────────────────────────────────

const PrescriptionsTab = ({ prescriptions }) => {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Active', 'Expired'];
  
  const visible = prescriptions.filter(p => {
    if (filter === 'All') return true;
    if (filter === 'Active') return p.status === 'Active';
    if (filter === 'Expired') return p.status === 'Expired';
    return true;
  });

  if (prescriptions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
        No prescriptions found
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
              border: `2px solid ${filter === f ? 'var(--blue)' : 'var(--gray-200)'}`,
              background: filter === f ? 'var(--blue)' : 'white',
              color: filter === f ? 'white' : 'var(--gray-600)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >{f}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visible.map(p => {
          const isActive = p.status === 'Active';
          return (
            <div key={p.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '14px',
              border: `1.5px solid ${isActive ? 'rgba(22,163,74,0.3)' : 'var(--gray-200)'}`,
              background: isActive ? 'rgba(22,163,74,0.04)' : 'var(--gray-50)',
              flexWrap: 'wrap',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                background: isActive ? 'rgba(22,163,74,0.12)' : 'var(--gray-200)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              }}>💊</div>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--gray-900)' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: '500', marginTop: '3px' }}>
                  Dr. {cleanDoctorName(p.doctor)} · {p.department}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '5px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', color: 'var(--gray-400)' }}>📅 Issued: {fmtDate(p.issued)}</span>
                  <span style={{ fontSize: '10px', color: isActive ? '#16a34a' : 'var(--gray-400)' }}>⏱ Expires: {fmtDate(p.expires)}</span>
                  {p.refills > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--blue)' }}>
                      🔄 {p.refills} refills left
                    </span>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: '10px', fontWeight: '700',
                background: isActive ? 'rgba(22,163,74,0.12)' : 'var(--gray-200)',
                color: isActive ? '#16a34a' : 'var(--gray-500)',
                padding: '3px 10px', borderRadius: '20px',
              }}>{p.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Documents Tab ─────────────────────────────────────────────────────────────

const DocumentsTab = ({ documents }) => {
  const docTypes = ['All', 'Lab Report', 'Imaging', 'Referral', 'Prescription', 'Invoice'];
  const [filter, setFilter] = useState('All');
  
  const visible = documents.filter(d => filter === 'All' || d.type === filter);

  const typeColor = {
    'Lab Report': { bg: 'rgba(61,77,183,0.08)', color: 'var(--blue)' },
    'Imaging':    { bg: 'rgba(124,58,237,0.08)', color: '#7c3aed'    },
    'Referral':   { bg: 'rgba(245,166,35,0.12)', color: '#92640a'    },
    'Prescription': { bg: 'rgba(22,163,74,0.08)', color: '#16a34a'   },
    'Invoice':    { bg: 'rgba(220,38,38,0.08)', color: '#dc2626'     },
  };

  if (documents.length === 0) {
    return (
      <div style={{ textProject: 'center', padding: '40px', color: 'var(--gray-400)' }}>
        No documents found
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {docTypes.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
              border: `2px solid ${filter === f ? 'var(--blue)' : 'var(--gray-200)'}`,
              background: filter === f ? 'var(--blue)' : 'white',
              color: filter === f ? 'white' : 'var(--gray-600)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >{f}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visible.map(doc => (
          <div key={doc.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: '14px',
            border: '1.5px solid var(--gray-200)',
            background: 'white',
            transition: 'all 0.15s ease',
            flexWrap: 'wrap',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.background = 'rgba(61,77,183,0.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'white'; }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
              background: typeColor[doc.type]?.bg || 'var(--gray-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
            }}>{doc.icon || '📄'}</div>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--gray-900)' }}>{doc.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: '500', marginTop: '3px' }}>
                Dr. {cleanDoctorName(doc.doctor)} · {fmtDate(doc.date)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontSize: '10px', fontWeight: '700',
                background: typeColor[doc.type]?.bg,
                color: typeColor[doc.type]?.color,
                padding: '2px 8px', borderRadius: '16px',
              }}>{doc.type}</span>
              <span style={{ fontSize: '10px', color: 'var(--gray-400)' }}>{doc.size}</span>
              <button style={{
                padding: '5px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '700',
                background: 'var(--blue-muted)', color: 'var(--blue)',
                border: 'none', cursor: 'pointer',
              }}>⬇ Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const MedicalHistory = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('visits');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [visits, setVisits] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchMedicalData();
  }, []);

  const fetchMedicalData = async () => {
    try {
      setLoading(true);
      const recordsRes = await API.get('/medical/records');
      const records = Array.isArray(recordsRes.data) ? recordsRes.data : [];
      
      try {
        const documentsRes = await API.get('/documents/my-documents');
        const docs = Array.isArray(documentsRes.data) ? documentsRes.data : [];
        
        const formattedDocuments = docs.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          date: doc.upload_date,
          doctor: doc.uploaded_by || 'System',
          icon: doc.type === 'Lab Report' ? '🧪' : doc.type === 'Imaging' ? '📷' : doc.type === 'Referral' ? '📄' : doc.type === 'Prescription' ? '💊' : '📁',
          size: doc.file_size || 'N/A'
        }));
        setDocuments(formattedDocuments);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setDocuments([]);
      }
      
      const formattedVisits = records.map(record => ({
        id: record.id,
        date: record.last_visit || record.created_at?.split('T')[0] || '2024-01-01',
        doctorName: record.doctor_name || record.doctorName || 'Unknown',
        avatar: (record.doctor_name || record.doctorName || 'D').charAt(0),
        departmentName: record.department || 'General',
        departmentIcon: '🏥',
        deptColor: '#3D4DB7',
        deptBg: 'rgba(61,77,183,0.08)',
        type: record.status === 'Chronic' ? 'Follow-up' : 'Checkup',
        diagnosis: record.diagnosis,
        icd: '',
        notes: record.notes,
        prescriptions: record.prescription ? [{ name: record.prescription, freq: 'As prescribed', duration: '30 days' }] : [],
        status: record.status
      }));
      
      setVisits(formattedVisits);
      
      const extractedPrescriptions = records
        .filter(r => r.prescription)
        .map((r, idx) => ({
          id: idx + 1,
          name: r.prescription,
          doctor: r.doctor_name || r.doctorName || 'Unknown',
          department: r.department || 'General',
          issued: r.last_visit || r.created_at?.split('T')[0] || '2024-01-01',
          expires: new Date(new Date(r.last_visit || '2024-01-01').setMonth(new Date(r.last_visit || '2024-01-01').getMonth() + 3)).toISOString().split('T')[0],
          freq: 'As prescribed',
          refills: r.status === 'Active' ? 2 : 0,
          status: r.status === 'Active' ? 'Active' : 'Expired'
        }));
      
      setPrescriptions(extractedPrescriptions);
      
    } catch (err) {
      console.error('Error fetching medical data:', err);
      setError('Failed to load medical history');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Visits', value: visits.length, icon: '🏥', color: 'var(--blue)' },
    { label: 'Active Prescriptions', value: prescriptions.filter(p => p.status === 'Active').length, icon: '💊', color: '#16a34a' },
    { label: 'Documents', value: documents.length, icon: '📁', color: '#7c3aed' },
    { label: 'Departments Visited', value: [...new Set(visits.map(v => v.departmentName))].length, icon: '🩺', color: '#d97706' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div>Loading medical history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '16px', border: '1.5px solid #fecaca' }}>
        <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚠️</div>
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#dc2626' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '12px', fontSize: '12px', padding: '8px 20px' }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', scrollBehavior: 'smooth' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
            Medical History
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
            Your complete health record — visits, prescriptions & documents
          </p>
        </div>
        <Link
          to="/book-appointment"
          className="btn-primary"
          style={{ textDecoration: 'none', fontSize: '12px', padding: '8px 20px', borderRadius: '30px' }}
        >
          + Book Appointment
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
        gap: '12px',
        marginBottom: '20px'
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '16px',
            padding: '14px', border: '1.5px solid var(--gray-200)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              borderRadius: '16px 16px 0 0', background: s.color,
            }} />
            <div style={{ fontSize: '18px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--gray-900)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gray-400)', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        border: '1.5px solid var(--gray-200)', 
        overflow: 'hidden' 
      }}>
        {/* Tab Bar */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1.5px solid var(--gray-200)', 
          padding: '0 16px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 16px',
                fontSize: '12px',
                fontWeight: '700',
                color: activeTab === tab.id ? 'var(--blue)' : 'var(--gray-400)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--blue)' : 'transparent'}`,
                marginBottom: '-1.5px',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ 
          padding: '16px', 
          maxHeight: '650px', 
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain'
        }}>
          {activeTab === 'visits' && (
            <div>
              {visits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                  No visit records found
                </div>
              ) : (
                visits.map(v => <VisitCard key={v.id} visit={v} />)
              )}
            </div>
          )}
          {activeTab === 'prescriptions' && <PrescriptionsTab prescriptions={prescriptions} />}
          {activeTab === 'documents' && <DocumentsTab documents={documents} />}
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;