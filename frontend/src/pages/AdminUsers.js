import React, { useState } from 'react';

const usersData = [
  { id: 1, name: 'Alice Anderson', email: 'alice.anderson@student.edu', role: 'student', dept: 'CSE', status: 'active', joined: '2023-08-01' },
  { id: 2, name: 'Dr. Rajesh Sharma', email: 'dr.sharma@campusconnect.edu', role: 'faculty', dept: 'CSE', status: 'active', joined: '2018-06-15' },
  { id: 3, name: 'Prof. Neha Mehra', email: 'prof.mehra@campusconnect.edu', role: 'faculty', dept: 'AIML', status: 'active', joined: '2020-01-10' },
  { id: 4, name: 'Bob Patel', email: 'bob.patel@student.edu', role: 'student', dept: 'IT', status: 'active', joined: '2023-08-01' },
  { id: 5, name: 'Charlie Kumar', email: 'charlie.k@student.edu', role: 'student', dept: 'CSE', status: 'inactive', joined: '2022-08-01' },
  { id: 6, name: 'Diana Sharma', email: 'diana.s@student.edu', role: 'student', dept: 'AIML', status: 'active', joined: '2024-08-01' },
  { id: 7, name: 'Prof. Amit Verma', email: 'amit.v@campusconnect.edu', role: 'faculty', dept: 'MECH', status: 'active', joined: '2015-03-20' },
  { id: 8, name: 'Ethan Singh', email: 'ethan.s@student.edu', role: 'student', dept: 'EXTC', status: 'active', joined: '2023-08-01' },
  { id: 9, name: 'Fiona Reddy', email: 'fiona.r@student.edu', role: 'student', dept: 'CSE', status: 'active', joined: '2024-08-01' },
  { id: 10, name: 'Gaurav Joshi', email: 'gaurav.j@student.edu', role: 'student', dept: 'IT', status: 'suspended', joined: '2022-08-01' },
];

const roleColors = { student: { bg: '#eef2ff', text: '#6366f1' }, faculty: { bg: '#ecfdf5', text: '#059669' }, admin: { bg: '#fdf2f8', text: '#db2777' } };
const statusColors = { active: { bg: '#f0fdf4', text: '#16a34a' }, inactive: { bg: '#f3f4f6', text: '#6b7280' }, suspended: { bg: '#fef2f2', text: '#dc2626' } };

function AdminUsers() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const filtered = usersData.filter(u =>
    (filter === 'all' || u.role === filter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>👥 User Management</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Manage students, faculty, and administrators</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users', count: usersData.length, color: '#6366f1', key: 'all' },
          { label: 'Students', count: usersData.filter(u => u.role === 'student').length, color: '#d97706', key: 'student' },
          { label: 'Faculty', count: usersData.filter(u => u.role === 'faculty').length, color: '#10b981', key: 'faculty' },
          { label: 'Suspended', count: usersData.filter(u => u.status === 'suspended').length, color: '#dc2626', key: 'suspended' },
        ].map((s, i) => (
          <div key={i} onClick={() => setFilter(s.key === 'suspended' ? 'all' : s.key)} style={{
            background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderTop: `4px solid ${s.color}`, cursor: 'pointer', border: `2px solid ${filter === s.key ? s.color : 'transparent'}`
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name or email..."
            style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, width: 300 }} />
          <button style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>+ Add User</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Name', 'Email', 'Role', 'Department', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const rc = roleColors[u.role]; const sc = statusColors[u.status];
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>{u.name}</td>
                  <td style={{ padding: '12px', color: '#6b7280', fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '12px' }}><span style={{ background: rc.bg, color: rc.text, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{u.role}</span></td>
                  <td style={{ padding: '12px', color: '#374151' }}>{u.dept}</td>
                  <td style={{ padding: '12px' }}><span style={{ background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{u.status}</span></td>
                  <td style={{ padding: '12px', color: '#6b7280', fontSize: 13 }}>{new Date(u.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '12px', display: 'flex', gap: 4 }}>
                    <button style={{ background: '#f3f4f6', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                    <button style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Suspend</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
