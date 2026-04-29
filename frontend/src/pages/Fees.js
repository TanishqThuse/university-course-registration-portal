import React, { useState } from 'react';

const initFees = [
  { id: 1, title: 'Tuition Fee', amount: 95000, paid: 95000, due: '2026-01-15', status: 'paid', category: 'Academic' },
  { id: 2, title: 'Exam Fee', amount: 3500, paid: 3500, due: '2026-04-01', status: 'paid', category: 'Exam' },
  { id: 3, title: 'Library Fee', amount: 1500, paid: 1500, due: '2026-01-15', status: 'paid', category: 'Facilities' },
  { id: 4, title: 'Lab Fee', amount: 5000, paid: 0, due: '2026-05-15', status: 'pending', category: 'Lab' },
  { id: 5, title: 'Hostel Fee', amount: 45000, paid: 45000, due: '2026-01-10', status: 'paid', category: 'Hostel' },
  { id: 6, title: 'Sports Fee', amount: 2000, paid: 0, due: '2026-05-30', status: 'overdue', category: 'Facilities' },
];

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };

function Fees() {
  const [fees, setFees] = useState(initFees);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [payMethod, setPayMethod] = useState('upi');
  const [payRef, setPayRef] = useState('');
  const [toast, setToast] = useState('');
  const [processing, setProcessing] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const total = fees.reduce((s, f) => s + f.amount, 0);
  const paid = fees.reduce((s, f) => s + f.paid, 0);
  const pending = total - paid;

  const openPay = (fee) => { setSelected(fee); setPayRef(''); setPayMethod('upi'); setModal('pay'); };
  const openReceipt = (fee) => { setSelected(fee); setModal('receipt'); };

  const handlePayment = () => {
    if (!payRef.trim()) { showToast('⚠️ Please enter a transaction reference.'); return; }
    setProcessing(true);
    setTimeout(() => {
      setFees(f => f.map(x => x.id === selected.id ? { ...x, status: 'paid', paid: x.amount } : x));
      setProcessing(false);
      setModal('success');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, background: '#111827', color: 'white', padding: '12px 20px', borderRadius: 10, zIndex: 2000, fontSize: 14, fontWeight: 600 }}>{toast}</div>}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>💳 Fees & Payments</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Academic Year 2025-26 · Fee status and payment history</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)', color: 'white', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>Total Fees</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>₹{total.toLocaleString('en-IN')}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #065f46, #16a34a)', color: 'white', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>✅ Paid</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>₹{paid.toLocaleString('en-IN')}</div>
        </div>
        <div style={{ background: pending > 0 ? 'linear-gradient(135deg, #7f1d1d, #dc2626)' : 'linear-gradient(135deg, #065f46, #16a34a)', color: 'white', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>{pending > 0 ? '⚠️ Pending' : '✅ All Paid'}</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>₹{pending.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Fee Breakdown</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Fee Type', 'Category', 'Amount', 'Due Date', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '14px 12px', fontWeight: 600, color: '#111827' }}>{f.title}</td>
                <td style={{ padding: '14px 12px' }}><span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 5, fontSize: 12 }}>{f.category}</span></td>
                <td style={{ padding: '14px 12px', fontWeight: 600 }}>₹{f.amount.toLocaleString('en-IN')}</td>
                <td style={{ padding: '14px 12px', color: '#6b7280', fontSize: 13 }}>{new Date(f.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{
                    background: f.status === 'paid' ? '#f0fdf4' : f.status === 'overdue' ? '#fef2f2' : '#fffbeb',
                    color: f.status === 'paid' ? '#16a34a' : f.status === 'overdue' ? '#dc2626' : '#d97706',
                    padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700
                  }}>{f.status === 'paid' ? '✅ Paid' : f.status === 'overdue' ? '❌ Overdue' : '⏳ Pending'}</span>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  {f.status !== 'paid' ? (
                    <button onClick={() => openPay(f)} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '7px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>💳 Pay Now</button>
                  ) : (
                    <button onClick={() => openReceipt(f)} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '7px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🧾 Receipt</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pay Now Modal */}
      {modal === 'pay' && selected && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 460 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: '#111827' }}>💳 Pay {selected.title}</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Amount: <strong style={{ color: '#111827', fontSize: 20 }}>₹{selected.amount.toLocaleString('en-IN')}</strong></p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Payment Method</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ val: 'upi', label: '📱 UPI' }, { val: 'card', label: '💳 Card' }, { val: 'netbanking', label: '🏦 Net Banking' }].map(m => (
                  <button key={m.val} onClick={() => setPayMethod(m.val)} style={{
                    flex: 1, padding: '10px 8px', borderRadius: 8, border: `2px solid ${payMethod === m.val ? '#6366f1' : '#e5e7eb'}`,
                    background: payMethod === m.val ? '#eef2ff' : 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: payMethod === m.val ? '#6366f1' : '#374151'
                  }}>{m.label}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {payMethod === 'upi' ? 'UPI ID / Transaction Ref' : payMethod === 'card' ? 'Card Last 4 Digits' : 'Transaction ID'}
              </label>
              <input value={payRef} onChange={e => setPayRef(e.target.value)}
                placeholder={payMethod === 'upi' ? 'e.g. 9876543210@paytm' : payMethod === 'card' ? 'e.g. 4321' : 'e.g. TXN123456789'}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13, color: '#6b7280' }}>
              🔒 Secured by SSL · Payments are processed securely
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handlePayment} disabled={processing} style={{ flex: 2, padding: 12, borderRadius: 8, border: 'none', background: processing ? '#a5b4fc' : '#6366f1', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
                {processing ? '⏳ Processing...' : `Pay ₹${selected.amount.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {modal === 'success' && selected && (
        <div style={modalOverlay}>
          <div style={{ background: 'white', borderRadius: 16, padding: 40, width: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', marginBottom: 8 }}>Payment Successful!</h2>
            <p style={{ color: '#374151', marginBottom: 4 }}><strong>{selected?.title}</strong></p>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 4 }}>Amount: ₹{selected?.amount.toLocaleString('en-IN')}</p>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 24 }}>Ref: {payRef} · {new Date().toLocaleDateString('en-IN')}</p>
            <button onClick={() => setModal(null)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px 32px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>Done</button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {modal === 'receipt' && selected && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 400 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🧾</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>Payment Receipt</h2>
              <p style={{ color: '#6b7280', fontSize: 13 }}>CampusConnect University</p>
            </div>
            <div style={{ border: '1px dashed #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              {[
                ['Receipt No.', `RCP-2026-${selected.id}${Math.floor(Math.random() * 900) + 100}`],
                ['Fee Type', selected.title],
                ['Category', selected.category],
                ['Amount Paid', `₹${selected.amount.toLocaleString('en-IN')}`],
                ['Payment Date', new Date(selected.due).toLocaleDateString('en-IN')],
                ['Status', '✅ Paid'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: '#6b7280' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Close</button>
              <button onClick={() => { showToast('📄 Receipt downloaded!'); setModal(null); }} style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fees;
