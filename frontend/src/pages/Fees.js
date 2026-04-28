import React from 'react';

const fees = [
  { title: 'Tuition Fee', amount: 95000, paid: 95000, due: '2026-01-15', status: 'paid', category: 'Academic' },
  { title: 'Exam Fee', amount: 3500, paid: 3500, due: '2026-04-01', status: 'paid', category: 'Exam' },
  { title: 'Library Fee', amount: 1500, paid: 1500, due: '2026-01-15', status: 'paid', category: 'Facilities' },
  { title: 'Lab Fee', amount: 5000, paid: 0, due: '2026-05-15', status: 'pending', category: 'Lab' },
  { title: 'Hostel Fee', amount: 45000, paid: 45000, due: '2026-01-10', status: 'paid', category: 'Hostel' },
  { title: 'Sports Fee', amount: 2000, paid: 0, due: '2026-05-30', status: 'overdue', category: 'Facilities' },
];

function Fees() {
  const total = fees.reduce((s, f) => s + f.amount, 0);
  const paid = fees.reduce((s, f) => s + f.paid, 0);
  const pending = total - paid;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
        <div style={{ background: 'linear-gradient(135deg, #7f1d1d, #dc2626)', color: 'white', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>⚠️ Pending</div>
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
            {fees.map((f, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
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
                    <button style={{ background: '#6366f1', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Pay Now</button>
                  ) : (
                    <button style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Receipt</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Fees;
