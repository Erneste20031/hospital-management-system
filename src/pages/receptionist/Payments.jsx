import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const METHODS = ['Cash', 'Card', 'Mobile Money', 'Insurance'];

const methodIcons = { Cash: '💵', Card: '💳', 'Mobile Money': '📱', Insurance: '🏥' };

const statusConfig = {
  Pending: { bg: 'var(--blue-muted)',       color: 'var(--blue)',  dot: 'var(--blue)'  },
  Overdue: { bg: 'rgba(220,38,38,0.08)',    color: '#dc2626',      dot: '#dc2626'      },
  Paid:    { bg: 'rgba(22,163,74,0.10)',    color: '#16a34a',      dot: '#16a34a'      },
};

// ── Payment Modal ─────────────────────────────────────────────────────────────

const PaymentModal = ({ invoice, onClose, onConfirm }) => {
  const [method, setMethod] = useState('Cash');
  const [ref,    setRef]    = useState('');
  const [processing, setProcessing] = useState(false);

  if (!invoice) return null;

  const handleConfirm = async () => {
    setProcessing(true);
    await onConfirm(invoice.bill_number || invoice.id, method, ref);
    setProcessing(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '24px',
        width: '100%', maxWidth: '420px',
        padding: '32px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>Process Payment</h2>
            <p style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500', marginTop: '3px' }}>{invoice.bill_number || invoice.id}</p>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--gray-100)', border: 'none',
            cursor: 'pointer', fontSize: '16px', color: 'var(--gray-400)',
          }}>×</button>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px', borderRadius: '14px',
          background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)',
          marginBottom: '20px',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
            background: invoice.deptColor || '#3D4DB7', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '800',
          }}>{invoice.avatar || invoice.patient_name?.charAt(0) || 'P'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--gray-900)' }}>{invoice.patient_name || invoice.patient}</div>
            <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500', marginTop: '2px' }}>
              {invoice.deptIcon || '🏥'} {invoice.department || invoice.dept} · {invoice.description || invoice.desc}
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--orange)' }}>${invoice.total_amount || invoice.amount}</div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Payment Method
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {METHODS.map(m => (
              <button key={m} onClick={() => setMethod(m)} style={{
                padding: '10px 12px', borderRadius: '12px',
                border: `2px solid ${method === m ? 'var(--blue)' : 'var(--gray-200)'}`,
                background: method === m ? 'var(--blue-muted)' : 'white',
                color: method === m ? 'var(--blue)' : 'var(--gray-500)',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.15s ease',
              }}>
                {methodIcons[m]} {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
            Reference / Receipt No. <span style={{ fontWeight: '500', textTransform: 'none' }}>(optional)</span>
          </div>
          <input
            type="text"
            placeholder="e.g. TXN-20260527-001"
            value={ref}
            onChange={e => setRef(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '12px',
              border: '1.5px solid var(--gray-200)', background: 'var(--gray-50)',
              fontSize: '13px', fontWeight: '600', color: 'var(--gray-900)',
              outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{
            flex: '0 0 auto', padding: '12px 20px', borderRadius: '12px',
            background: 'var(--gray-100)', border: 'none',
            color: 'var(--gray-500)', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleConfirm} disabled={processing} style={{
            flex: 1, padding: '12px', borderRadius: '12px',
            background: 'var(--blue)', border: 'none',
            color: 'white', fontSize: '13px', fontWeight: '700', cursor: processing ? 'not-allowed' : 'pointer',
            opacity: processing ? 0.7 : 1,
          }}>{processing ? 'Processing...' : `💳 Confirm Payment · $${invoice.total_amount || invoice.amount}`}</button>
        </div>
      </div>
    </div>
  );
};

// ── Invoice Row ───────────────────────────────────────────────────────────────

const InvoiceRow = ({ inv, onProcess }) => {
  const sc = statusConfig[inv.status] || statusConfig['Pending'];
  const isPaid = inv.status === 'Paid';
  
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '13px 16px', borderRadius: '14px',
      border: `1.5px solid ${inv.status === 'Overdue' ? '#dc262622' : inv.status === 'Paid' ? '#16a34a22' : 'var(--gray-200)'}`,
      background: inv.status === 'Overdue' ? 'rgba(220,38,38,0.02)' : 'white',
      transition: 'all 0.15s ease',
    }}>
      <div style={{
        width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
        background: inv.deptColor || '#3D4DB7', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: '800',
      }}>{inv.avatar || inv.patient_name?.charAt(0) || 'P'}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--gray-900)' }}>{inv.patient_name || inv.patient}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', background: `${inv.deptColor || '#3D4DB7'}18`, color: inv.deptColor || '#3D4DB7', padding: '1px 6px', borderRadius: '20px' }}>
            {inv.deptIcon || '🏥'} {inv.department || inv.dept}
          </span>
          <span style={{ color: 'var(--gray-300)', fontSize: '10px' }}>·</span>
          <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500' }}>{inv.description || inv.desc}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', minWidth: '80px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gray-400)' }}>{inv.bill_number || inv.id}</div>
        <div style={{ fontSize: '10px', fontWeight: '700', color: inv.status === 'Overdue' ? '#dc2626' : 'var(--gray-400)', marginTop: '2px' }}>
          {inv.due_date ? `Due: ${inv.due_date}` : inv.due || 'Today'}
        </div>
      </div>

      <div style={{ minWidth: '54px', textAlign: 'right' }}>
        <div style={{ fontSize: '16px', fontWeight: '800', color: isPaid ? '#16a34a' : 'var(--gray-900)' }}>${inv.total_amount || inv.amount}</div>
        {inv.payment_method && (
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gray-400)', marginTop: '2px' }}>
            {methodIcons[inv.payment_method]} {inv.payment_method}
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, minWidth: '100px', textAlign: 'right' }}>
        {isPaid ? (
          <span style={{ fontSize: '10px', fontWeight: '700', background: sc.bg, color: sc.color, padding: '5px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
            Paid
          </span>
        ) : (
          <button onClick={() => onProcess(inv)} style={{
            padding: '7px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
            background: inv.status === 'Overdue' ? '#dc2626' : 'var(--blue)',
            color: 'white', border: 'none', cursor: 'pointer',
          }}>💳 Pay Now</button>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Payments = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await API.get('/billing');
      const bills = response.data || [];
      
      // Transform bills to match component structure
      const formattedBills = bills.map(bill => ({
        ...bill,
        id: bill.bill_number,
        patient_name: bill.patient_name,
        amount: bill.total_amount,
        description: bill.description,
        department: bill.department,
        status: bill.status === 'Paid' ? 'Paid' : bill.due_date && new Date(bill.due_date) < new Date() ? 'Overdue' : 'Pending',
        due_date: bill.due_date,
        payment_method: bill.payment_method
      }));
      
      setPayments(formattedBills);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id, method, ref) => {
    try {
      await API.post(`/billing/pay/${id}`, { method });
      await fetchPayments(); // Refresh the list
      const inv = payments.find(p => p.bill_number === id || p.id === id);
      setModal(null);
      setToast(`✅ $${inv?.total_amount || inv?.amount} from ${inv?.patient_name || inv?.patient} collected via ${method}${ref ? ` · Ref: ${ref}` : ''}`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Payment failed. Please try again.');
    }
  };

  const filters = ['All', 'Pending', 'Overdue', 'Paid'];
  const pendingAmt = payments.filter(p => p.status !== 'Paid').reduce((s, p) => s + (p.total_amount || p.amount || 0), 0);
  const overdueAmt = payments.filter(p => p.status === 'Overdue').reduce((s, p) => s + (p.total_amount || p.amount || 0), 0);
  const paidAmt = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.total_amount || p.amount || 0), 0);
  const overdueCount = payments.filter(p => p.status === 'Overdue').length;

  const visible = payments.filter(p => {
    const matchFilter = filter === 'All' || p.status === filter;
    const matchSearch = !search || 
      (p.patient_name || p.patient || '').toLowerCase().includes(search.toLowerCase()) || 
      (p.bill_number || p.id || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = [
    { label: 'Outstanding', value: `$${pendingAmt}`, icon: '⏳', color: 'var(--blue)', sub: `${payments.filter(p => p.status === 'Pending').length} invoices` },
    { label: 'Overdue', value: `$${overdueAmt}`, icon: '🚨', color: '#dc2626', sub: `${overdueCount} invoice${overdueCount !== 1 ? 's' : ''}` },
    { label: 'Collected Today', value: `$${paidAmt}`, icon: '✅', color: '#16a34a', sub: `${payments.filter(p => p.status === 'Paid').length} paid` },
    { label: 'Total Invoices', value: payments.length, icon: '🧾', color: 'var(--orange)', sub: 'this period' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1.5px solid #fecaca' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
        <p style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '16px', fontSize: '13px' }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 1000,
          background: '#16a34a', color: 'white',
          padding: '14px 22px', borderRadius: '16px',
          fontSize: '13px', fontWeight: '700',
          boxShadow: '0 8px 24px rgba(22,163,74,0.35)',
        }}>{toast}</div>
      )}

      <PaymentModal invoice={modal} onClose={() => setModal(null)} onConfirm={handleConfirm} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/dashboard" style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'white', border: '1.5px solid var(--gray-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', textDecoration: 'none', flexShrink: 0,
          }}>←</Link>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>Payment Management</h1>
            <p style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500', marginTop: '3px' }}>
              Track and collect patient invoices
            </p>
          </div>
        </div>
        {overdueCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(220,38,38,0.08)', padding: '8px 16px',
            borderRadius: '12px', border: '1.5px solid rgba(220,38,38,0.2)',
          }}>
            <span style={{ fontSize: '14px' }}>🚨</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626' }}>
              {overdueCount} overdue invoice{overdueCount !== 1 ? 's' : ''} — ${overdueAmt} pending
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '20px', padding: '20px',
            border: '1.5px solid var(--gray-200)', position: 'relative', overflow: 'hidden',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', borderRadius: '20px 20px 0 0', background: s.color }} />
            <div style={{ fontSize: '22px', marginBottom: '12px' }}>{s.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--gray-900)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-400)', margin: '4px 0 6px' }}>{s.label}</div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: s.color }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid var(--gray-200)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1.5px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
              Invoices &nbsp;<span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-400)' }}>({visible.length})</span>
            </h2>
            <div style={{ position: 'relative', maxWidth: '240px', flex: 1 }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--gray-400)' }}>🔍</span>
              <input
                type="text"
                placeholder="Search patient or invoice…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 34px',
                  borderRadius: '10px', border: '1.5px solid var(--gray-200)',
                  fontSize: '12px', fontWeight: '600', color: 'var(--gray-900)',
                  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                  background: 'var(--gray-50)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {filters.map(f => {
              const count = f === 'All' ? payments.length : payments.filter(p => p.status === f).length;
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  border: `2px solid ${filter === f ? 'var(--blue)' : 'var(--gray-200)'}`,
                  background: filter === f ? 'var(--blue)' : 'white',
                  color: filter === f ? 'white' : 'var(--gray-500)',
                  cursor: 'pointer', outline: 'none',
                }}>
                  {f} <span style={{ opacity: 0.75 }}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
          {visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧾</div>
              <p style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>No invoices found</p>
            </div>
          ) : (
            visible.map(inv => (
              <InvoiceRow key={inv.bill_number || inv.id} inv={inv} onProcess={setModal} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;