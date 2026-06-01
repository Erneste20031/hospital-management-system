import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const reportCategories = [
  {
    id: 'patient',
    title: 'Patient Reports',
    icon: '👥',
    orange: false,
    reports: [
      { id: 'monthly-registration', label: 'Monthly Patient Registration', desc: 'New patients registered per month', endpoint: '/reports/patients/monthly' },
      { id: 'demographics',         label: 'Patient Demographics',         desc: 'Age, gender and location breakdown', endpoint: '/reports/patients/demographics' },
      { id: 'top-diagnoses',        label: 'Top Diagnoses',                desc: 'Most frequent conditions treated', endpoint: '/reports/patients/diagnoses' },
      { id: 'readmission',          label: 'Readmission Rate',             desc: 'Patients readmitted within 30 days', endpoint: '/reports/patients/readmission' },
    ],
  },
  {
    id: 'financial',
    title: 'Financial Reports',
    icon: '💰',
    orange: true,
    reports: [
      { id: 'revenue-summary',     label: 'Revenue Summary',      desc: 'Monthly and annual revenue overview', endpoint: '/reports/financial/revenue' },
      { id: 'outstanding',         label: 'Outstanding Payments', desc: 'Unpaid bills and pending invoices', endpoint: '/reports/financial/outstanding' },
      { id: 'insurance-claims',    label: 'Insurance Claims',     desc: 'Submitted and approved claims', endpoint: '/reports/financial/claims' },
      { id: 'expense-breakdown',   label: 'Expense Breakdown',    desc: 'Departmental cost analysis', endpoint: '/reports/financial/expenses' },
    ],
  },
  {
    id: 'doctor',
    title: 'Doctor Reports',
    icon: '👨‍⚕️',
    orange: false,
    reports: [
      { id: 'doctor-performance',  label: 'Doctor Performance',      desc: 'Ratings, appointments and outcomes', endpoint: '/reports/doctors/performance' },
      { id: 'appointment-stats',   label: 'Appointment Statistics',  desc: 'Scheduled, completed and cancelled', endpoint: '/reports/appointments/stats' },
      { id: 'prescriptions',       label: 'Prescription Analysis',   desc: 'Most prescribed medications', endpoint: '/reports/prescriptions' },
    ],
  },
  {
    id: 'operational',
    title: 'Operational Reports',
    icon: '🏥',
    orange: true,
    reports: [
      { id: 'bed-occupancy',       label: 'Bed Occupancy',          desc: 'Department-wise bed usage trends', endpoint: '/reports/operational/beds' },
      { id: 'department-summary',  label: 'Department Summary',     desc: 'Staff, patients and activity per dept', endpoint: '/reports/operational/departments' },
      { id: 'emergency-stats',     label: 'Emergency Statistics',   desc: 'ER visits and response times', endpoint: '/reports/operational/emergency' },
    ],
  },
];

const Reports = () => {
  const [selected,        setSelected]        = useState(null);
  const [generating,      setGenerating]      = useState(false);
  const [generated,       setGenerated]       = useState(false);
  const [generatedData,   setGeneratedData]   = useState(null);
  const [period,          setPeriod]          = useState('monthly');
  const [recentReports,   setRecentReports]   = useState([]);
  const [stats,           setStats]           = useState({ total: 0, thisMonth: 0, pending: 0, lastGenerated: 'Today' });

  // Fetch dashboard stats
  useEffect(() => {
    fetchReportStats();
    fetchRecentReports();
  }, []);

  const fetchReportStats = async () => {
    try {
      const response = await API.get('/reports/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching report stats:', err);
    }
  };

  const fetchRecentReports = async () => {
    try {
      const response = await API.get('/reports/recent');
      setRecentReports(response.data);
    } catch (err) {
      console.error('Error fetching recent reports:', err);
    }
  };

  const summaryStats = [
    { label: 'Reports Generated', value: stats.total?.toLocaleString() || '0', icon: '📋', orange: false },
    { label: 'This Month',        value: stats.thisMonth?.toString() || '0',    icon: '📅', orange: false },
    { label: 'Pending Exports',   value: stats.pending?.toString() || '0',      icon: '⏳', orange: true  },
    { label: 'Last Generated',    value: stats.lastGenerated || 'Today',        icon: '✅', orange: true  },
  ];

  const selectedReport = reportCategories
    .flatMap(c => c.reports.map(r => ({ ...r, categoryId: c.id })))
    .find(r => r.id === selected?.reportId);

  const handleGenerate = async () => {
    if (!selected) return;
    
    const report = selectedReport;
    if (!report) return;
    
    try {
      setGenerating(true);
      setGenerated(false);
      
      const response = await API.post('/reports/generate', {
        reportId: selected.reportId,
        period: period,
        endpoint: report.endpoint
      });
      
      setGeneratedData(response.data);
      setGenerated(true);
      
      // Refresh recent reports
      fetchRecentReports();
      fetchReportStats();
      
    } catch (err) {
      console.error('Error generating report:', err);
      alert(err.response?.data?.message || 'Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedData) return;
    try {
      const response = await API.post('/reports/export/pdf', {
        reportId: selected.reportId,
        period: period,
        data: generatedData
      }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport?.label}_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF');
    }
  };

  const handleDownloadExcel = async () => {
    if (!generatedData) return;
    try {
      const response = await API.post('/reports/export/excel', {
        reportId: selected.reportId,
        period: period,
        data: generatedData
      }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport?.label}_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading Excel:', err);
      alert('Failed to download Excel file');
    }
  };

  const handleRecentDownload = async (reportId) => {
    try {
      const response = await API.get(`/reports/download/${reportId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading recent report:', err);
      alert('Failed to download report');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
            Reports & <span style={{ color: 'var(--orange)' }}>Analytics</span>
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '5px', fontWeight: '500' }}>
            📊 Generate, view and export hospital reports
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleDownloadPDF}
            disabled={!generated}
            style={{
              padding: '10px 20px', borderRadius: '40px',
              border: '1.5px solid var(--gray-200)', cursor: generated ? 'pointer' : 'not-allowed',
              background: 'white', color: generated ? 'var(--gray-600)' : 'var(--gray-300)',
              fontSize: '13px', fontWeight: '700',
              fontFamily: 'inherit', transition: 'all 0.2s', opacity: generated ? 1 : 0.5,
            }}
            onMouseEnter={e => { if (generated) { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; } }}
            onMouseLeave={e => { if (generated) { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-600)'; } }}
          >
            📥 Export PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            disabled={!generated}
            style={{
              padding: '10px 20px', borderRadius: '40px',
              border: '1.5px solid var(--gray-200)', cursor: generated ? 'pointer' : 'not-allowed',
              background: 'white', color: generated ? 'var(--gray-600)' : 'var(--gray-300)',
              fontSize: '13px', fontWeight: '700',
              fontFamily: 'inherit', transition: 'all 0.2s', opacity: generated ? 1 : 0.5,
            }}
            onMouseEnter={e => { if (generated) { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)'; } }}
            onMouseLeave={e => { if (generated) { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-600)'; } }}
          >
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Summary Stats */}
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

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

        {/* Left — Report Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reportCategories.map((cat) => (
            <div key={cat.id} style={{
              background: 'white', borderRadius: '20px',
              padding: '22px', border: '1.5px solid var(--gray-200)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: cat.orange ? 'rgba(245,166,35,0.12)' : 'var(--blue-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  {cat.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
                    {cat.title}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: '2px 0 0', fontWeight: '500' }}>
                    {cat.reports.length} reports available
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cat.reports.map((report) => {
                  const isSelected = selected?.reportId === report.id;
                  return (
                    <button
                      key={report.id}
                      onClick={() => {
                        setSelected({ categoryId: cat.id, reportId: report.id });
                        setGenerated(false);
                        setGeneratedData(null);
                      }}
                      style={{
                        width: '100%', textAlign: 'left',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: '14px',
                        border: '1.5px solid',
                        borderColor: isSelected
                          ? (cat.orange ? 'var(--orange)' : 'var(--blue)')
                          : 'var(--gray-200)',
                        background: isSelected
                          ? (cat.orange ? 'rgba(245,166,35,0.06)' : 'rgba(61,77,183,0.04)')
                          : 'var(--gray-50)',
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = cat.orange ? 'var(--orange)' : 'var(--blue)';
                          e.currentTarget.style.background = cat.orange ? 'rgba(245,166,35,0.04)' : 'rgba(61,77,183,0.03)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--gray-200)';
                          e.currentTarget.style.background = 'var(--gray-50)';
                        }
                      }}
                    >
                      <div>
                        <p style={{
                          fontSize: '13px', fontWeight: '700',
                          color: isSelected
                            ? (cat.orange ? 'var(--orange)' : 'var(--blue)')
                            : 'var(--gray-900)',
                          margin: 0,
                        }}>
                          {report.label}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: '3px 0 0', fontWeight: '500' }}>
                          {report.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <span style={{
                          fontSize: '11px', fontWeight: '700',
                          color: cat.orange ? 'var(--orange)' : 'var(--blue)',
                          background: cat.orange ? 'rgba(245,166,35,0.12)' : 'var(--blue-muted)',
                          padding: '4px 10px', borderRadius: '20px',
                          flexShrink: 0, marginLeft: '12px',
                        }}>
                          Selected ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right — Generator Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '100px' }}>

          {/* Generate Panel */}
          <div style={{
            background: 'white', borderRadius: '20px',
            padding: '24px', border: '1.5px solid var(--gray-200)',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gray-900)', margin: '0 0 6px 0' }}>
              Generate Report
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--gray-400)', margin: '0 0 20px 0', fontWeight: '500' }}>
              Select a report from the left, then choose a period and generate.
            </p>

            <div style={{
              padding: '14px', borderRadius: '14px',
              background: selected ? 'var(--blue-muted)' : 'var(--gray-50)',
              border: `1.5px solid ${selected ? 'var(--blue)' : 'var(--gray-200)'}`,
              marginBottom: '16px', minHeight: '60px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              {selected ? (
                <>
                  <span style={{ fontSize: '20px' }}>📋</span>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--blue)', margin: 0 }}>
                      {selectedReport?.label}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: '2px 0 0', fontWeight: '500' }}>
                      {selectedReport?.desc}
                    </p>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontWeight: '500' }}>
                  No report selected yet
                </p>
              )}
            </div>

            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', marginBottom: '8px' }}>
              Report Period
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    padding: '6px 14px', borderRadius: '40px',
                    border: '1.5px solid',
                    borderColor: period === p ? 'var(--blue)' : 'var(--gray-200)',
                    background: period === p ? 'var(--blue)' : 'white',
                    color: period === p ? 'white' : 'var(--gray-600)',
                    fontSize: '12px', fontWeight: '700',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.2s', textTransform: 'capitalize',
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selected || generating}
              style={{
                width: '100%', padding: '12px',
                borderRadius: '40px', border: 'none',
                cursor: selected && !generating ? 'pointer' : 'not-allowed',
                background: selected && !generating ? 'var(--blue)' : 'var(--gray-200)',
                color: selected && !generating ? 'white' : 'var(--gray-400)',
                fontSize: '14px', fontWeight: '700',
                fontFamily: 'inherit', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
              }}
              onMouseEnter={e => { if (selected && !generating) e.currentTarget.style.background = 'var(--blue-dark)'; }}
              onMouseLeave={e => { if (selected && !generating) e.currentTarget.style.background = 'var(--blue)'; }}
            >
              {generating ? (
                <>
                  <span style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Generating...
                </>
              ) : '📊 Generate Report'}
            </button>

            {generated && !generating && generatedData && (
              <div style={{
                marginTop: '16px', padding: '14px',
                borderRadius: '14px',
                background: 'rgba(22,163,74,0.08)',
                border: '1.5px solid rgba(22,163,74,0.25)',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a', margin: '0 0 10px 0' }}>
                  ✅ Report ready!
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleDownloadPDF} style={{
                    flex: 1, padding: '8px', borderRadius: '10px',
                    border: 'none', cursor: 'pointer',
                    background: '#16a34a', color: 'white',
                    fontSize: '12px', fontWeight: '700',
                    fontFamily: 'inherit',
                  }}>
                    📥 Download PDF
                  </button>
                  <button onClick={handleDownloadExcel} style={{
                    flex: 1, padding: '8px', borderRadius: '10px',
                    border: '1.5px solid #16a34a', cursor: 'pointer',
                    background: 'white', color: '#16a34a',
                    fontSize: '12px', fontWeight: '700',
                    fontFamily: 'inherit',
                  }}>
                    📊 Excel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Reports */}
          <div style={{
            background: 'white', borderRadius: '20px',
            padding: '22px', border: '1.5px solid var(--gray-200)',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--gray-900)', margin: '0 0 16px 0' }}>
              Recent Reports
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentReports.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--gray-400)', textAlign: 'center', padding: '20px' }}>
                  No recent reports
                </p>
              ) : (
                recentReports.map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: '12px',
                    background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{r.icon || '📋'}</span>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>{r.label}</p>
                        <p style={{ fontSize: '10px', color: 'var(--gray-400)', margin: '2px 0 0', fontWeight: '500' }}>{r.period} · {r.date}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRecentDownload(r.id)}
                      style={{
                        fontSize: '11px', fontWeight: '700',
                        color: 'var(--blue)', background: 'var(--blue-muted)',
                        border: 'none', borderRadius: '20px',
                        padding: '4px 10px', cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      📥
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Reports;