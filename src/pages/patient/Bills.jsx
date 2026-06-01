import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = iso =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

const totalFor = (items) => {
  if (!items || items.length === 0) return 0;
  return items.reduce((s, i) => s + (i.amount || 0), 0);
};

const patientOwes = (bill) => {
  const total = totalFor(bill.items);
  return Math.max(0, total - (bill.insurance || 0));
};

// ── Payment Modal ─────────────────────────────────────────────────────────────

const PaymentModal = ({ bill, onClose, onPaid }) => {
  const [method, setMethod] = useState('card');
  const [paying, setPaying] = useState(false);
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const owed = patientOwes(bill);

  const handlePay = async () => {
    setPaying(true);
    try {
      await API.post(`/billing/pay/${bill.id}`, { method });
      onPaid(bill.id);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const inputStyle = {
    width: '100%', borderRadius: '12px', padding: '11px 14px',
    border: '2px solid var(--gray-200)', fontSize: '13px',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    color: 'var(--gray-900)', background: 'var(--gray-50)',
    transition: 'border-color 0.15s ease',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white', borderRadius: '24px', width: '100%', maxWidth: '440px',
        padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>Pay Invoice</h3>
            <p style={{ fontSize: '12px', color: 'var(--gray-400)', margin: '4px 0 0', fontWeight: '500' }}>{bill.id}</p>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--gray-100)', border: 'none', cursor: 'pointer',
            fontSize: '16px', color: 'var(--gray-500)',
          }}>✕</button>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, var(--orange) 0%, #f97316 100%)',
          borderRadius: '16px', padding: '18px 20px', marginBottom: '20px', textAlign: 'center',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 6px' }}>Amount Due</p>
          <p style={{ color: 'white', fontSize: '32px', fontWeight: '800', margin: 0, lineHeight: 1 }}>${owed}</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: '6px 0 0', fontWeight: '500' }}>{bill.description}</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          {[{ id: 'card', label: '💳 Card' }, { id: 'insurance', label: '🏥 Insurance' }, { id: 'wallet', label: '📱 Wallet' }].map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)} style={{
              flex: 1, padding: '9px 6px', borderRadius: '12px', fontSize: '12px', fontWeight: '700',
              border: `2px solid ${method === m.id ? 'var(--blue)' : 'var(--gray-200)'}`,
              background: method === m.id ? 'var(--blue-muted)' : 'white',
              color: method === m.id ? 'var(--blue)' : 'var(--gray-600)',
              cursor: 'pointer', outline: 'none', transition: 'all 0.15s ease',
            }}>{m.label}</button>
          ))}
        </div>

        {method === 'card' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
            <input
              placeholder="Card number"
              value={cardNum}
              maxLength={19}
              onChange={e => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input placeholder="MM / YY" value={expiry} maxLength={5}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, '');
                  if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                  setExpiry(v);
                }}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
              />
              <input placeholder="CVV" value={cvv} maxLength={3}
                onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
              />
            </div>
          </div>
        )}
        {method === 'insurance' && (
          <div style={{ padding: '14px', background: 'var(--blue-muted)', borderRadius: '12px', marginBottom: '18px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--blue)', margin: 0 }}>
              🏥 Insurance claim will be submitted automatically
            </p>
            <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: '4px 0 0', fontWeight: '500' }}>Processing time: 3–5 business days</p>
          </div>
        )}
        {method === 'wallet' && (
          <div style={{ padding: '14px', background: 'rgba(22,163,74,0.08)', borderRadius: '12px', marginBottom: '18px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a', margin: 0 }}>📱 Pay via Mobile Wallet</p>
            <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: '4px 0 0', fontWeight: '500' }}>Scan QR or use saved wallet</p>
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={paying}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '14px', opacity: paying ? 0.7 : 1, cursor: paying ? 'not-allowed' : 'pointer' }}
        >
          {paying ? '⏳ Processing...' : `Pay $${owed} Now`}
        </button>
      </div>
    </div>
  );
};

// ── Bill Card ─────────────────────────────────────────────────────────────────

const BillCard = ({ bill, onPay }) => {
  const [expanded, setExpanded] = useState(false);
  const total = totalFor(bill.items);
  const owed = patientOwes(bill);
  const isPaid = bill.status === 'Paid';

  const deptBg = bill.deptBg || `rgba(61,77,183,0.08)`;
  const deptColor = bill.deptColor || '#3D4DB7';

  return (
    <div style={{
      border: `1.5px solid ${expanded ? (isPaid ? '#16a34a' : 'var(--orange)') : 'var(--gray-200)'}`,
      borderRadius: '18px', overflow: 'hidden',
      background: 'white', transition: 'all 0.2s ease',
    }}>
      <div style={{ height: '3px', background: isPaid ? '#16a34a' : 'var(--orange)' }} />

      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', padding: '18px 20px',
          display: 'flex', alignItems: 'center', gap: '14px',
          background: 'white', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
          background: deptBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
        }}>{bill.deptIcon || '🏥'}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gray-900)' }}>{bill.description}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '600' }}>{bill.id}</span>
            <span style={{ color: 'var(--gray-300)' }}>•</span>
            <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: '500' }}>{bill.doctor}</span>
            <span style={{ color: 'var(--gray-300)' }}>•</span>
            <span style={{ fontSize: '11px', fontWeight: '700', background: deptBg, color: deptColor, padding: '2px 8px', borderRadius: '20px' }}>
              {bill.department}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500', marginTop: '4px' }}>
            📅 {fmtDate(bill.date)} {!isPaid && `· Due: ${fmtDate(bill.due)}`}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <span style={{ fontSize: '20px', fontWeight: '800', color: isPaid ? '#16a34a' : 'var(--orange)' }}>
            ${owed}
          </span>
          <span style={{
            fontSize: '11px', fontWeight: '700',
            background: isPaid ? 'rgba(22,163,74,0.1)' : 'rgba(245,166,35,0.12)',
            color: isPaid ? '#16a34a' : '#92640a',
            padding: '3px 10px', borderRadius: '20px',
          }}>{isPaid ? '✓ Paid' : 'Unpaid'}</span>
          <span style={{
            fontSize: '18px', color: 'var(--gray-400)',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.25s ease', display: 'inline-block',
          }}>⌄</span>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--gray-100)' }}>
          <div style={{ margin: '16px 0 12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gray-700)', marginBottom: '10px' }}>
              🧾 Invoice Breakdown
            </div>
            <div style={{ border: '1.5px solid var(--gray-200)', borderRadius: '14px', overflow: 'hidden' }}>
              {bill.items && bill.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '11px 14px',
                  background: i % 2 === 0 ? 'white' : 'var(--gray-50)',
                  borderBottom: i < bill.items.length - 1 ? '1px solid var(--gray-100)' : 'none',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-700)' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gray-900)' }}>${item.amount}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 14px', background: 'var(--gray-50)', borderTop: '2px solid var(--gray-200)' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-500)' }}>Subtotal</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gray-900)' }}>${total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 14px', background: 'rgba(61,77,183,0.03)' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--blue)' }}>🏥 Insurance Cover</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--blue)' }}>−${bill.insurance}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 14px', background: isPaid ? 'rgba(22,163,74,0.06)' : 'rgba(245,166,35,0.06)', borderTop: '2px solid var(--gray-200)' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--gray-900)' }}>You Pay</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: isPaid ? '#16a34a' : 'var(--orange)' }}>${owed}</span>
              </div>
            </div>
          </div>

          {isPaid ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px', background: 'rgba(22,163,74,0.06)',
              borderRadius: '14px', border: '1.5px solid rgba(22,163,74,0.2)',
            }}>
              <span style={{ fontSize: '22px' }}>✅</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#16a34a' }}>Payment Received</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: '500', marginTop: '2px' }}>
                  {fmtDate(bill.paidDate)} · {bill.method}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onPay(bill)}
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '14px', borderRadius: '14px', background: 'var(--orange)', border: 'none' }}
            >
              💳 Pay ${owed} Now
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const PatientBills = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [payingBill, setPayingBill] = useState(null);
  const [paidToast, setPaidToast] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await API.get('/billing/my-bills');
      setBills(response.data || []);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handlePaid = (id) => {
    setBills(prev => prev.map(b =>
      b.id === id
        ? { ...b, status: 'Paid', paidDate: new Date().toISOString().split('T')[0], method: 'Card' }
        : b
    ));
    setPayingBill(null);
    setPaidToast(true);
    setTimeout(() => setPaidToast(false), 3500);
    // Refresh bills after payment
    setTimeout(() => fetchBills(), 500);
  };

  const filters = ['All', 'Unpaid', 'Paid'];
  const visible = bills.filter(b => filter === 'All' || b.status === filter);

  const totalUnpaid = bills.filter(b => b.status === 'Unpaid').reduce((s, b) => s + patientOwes(b), 0);
  const totalPaid = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + patientOwes(b), 0);
  const totalSaved = bills.reduce((s, b) => s + (b.insurance || 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading bills...</div>
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

      {paidToast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 999,
          background: '#16a34a', color: 'white',
          padding: '14px 22px', borderRadius: '16px',
          fontSize: '13px', fontWeight: '700',
          boxShadow: '0 8px 24px rgba(22,163,74,0.35)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          ✅ Payment successful! Invoice marked as paid.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>My Bills</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '5px', fontWeight: '500' }}>
            Track and manage your medical invoices
          </p>
        </div>
        <Link to="/dashboard" style={{
          fontSize: '13px', fontWeight: '700', color: 'var(--gray-600)',
          textDecoration: 'none', background: 'var(--gray-100)',
          padding: '10px 18px', borderRadius: '12px',
        }}>← Dashboard</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '14px' }}>
        {[
          { label: 'Amount Due', value: `$${totalUnpaid}`, icon: '💳', color: 'var(--orange)', bg: 'rgba(245,166,35,0.1)' },
          { label: 'Total Paid', value: `$${totalPaid}`, icon: '✅', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          { label: 'Insurance Saved', value: `$${totalSaved}`, icon: '🏥', color: 'var(--blue)', bg: 'var(--blue-muted)' },
          { label: 'Total Invoices', value: bills.length, icon: '🧾', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '18px',
            padding: '18px', border: '1.5px solid var(--gray-200)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: '3px', borderRadius: '18px 18px 0 0', background: s.color,
            }} />
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: s.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px', marginBottom: '10px',
            }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--gray-900)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gray-400)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {totalUnpaid > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, var(--orange) 0%, #f97316 100%)',
          borderRadius: '20px', padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px',
        }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '0.5px' }}>
              OUTSTANDING BALANCE
            </p>
            <p style={{ color: 'white', fontSize: '28px', fontWeight: '800', margin: 0, lineHeight: 1 }}>${totalUnpaid}</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '4px 0 0', fontWeight: '500' }}>
              {bills.filter(b => b.status === 'Unpaid').length} unpaid invoice(s)
            </p>
          </div>
          <button
            onClick={() => setPayingBill(bills.find(b => b.status === 'Unpaid'))}
            style={{
              padding: '12px 28px', borderRadius: '40px',
              border: '2px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.2)',
              color: 'white', fontSize: '13px', fontWeight: '800',
              cursor: 'pointer', backdropFilter: 'blur(4px)',
            }}
          >
            Pay Now →
          </button>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid var(--gray-200)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1.5px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>
            Invoices <span style={{ color: 'var(--gray-400)', fontWeight: '600', fontSize: '13px' }}>({visible.length})</span>
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                  border: `2px solid ${filter === f ? 'var(--blue)' : 'var(--gray-200)'}`,
                  background: filter === f ? 'var(--blue)' : 'white',
                  color: filter === f ? 'white' : 'var(--gray-600)',
                  cursor: 'pointer', outline: 'none', transition: 'all 0.15s ease',
                }}
              >{f}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎉</div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-900)', margin: '0 0 6px' }}>All clear!</p>
              <p style={{ fontSize: '13px', color: 'var(--gray-400)', fontWeight: '500', margin: 0 }}>No unpaid bills — you're all caught up.</p>
            </div>
          ) : (
            visible.map(bill => (
              <BillCard key={bill.id} bill={bill} onPay={setPayingBill} />
            ))
          )}
        </div>
      </div>

      {payingBill && (
        <PaymentModal
          bill={payingBill}
          onClose={() => setPayingBill(null)}
          onPaid={handlePaid}
        />
      )}
    </div>
  );
};

export default PatientBills;