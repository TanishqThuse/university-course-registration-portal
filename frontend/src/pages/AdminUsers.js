import React, { useState } from 'react';

const initUsers = [
  { id: 1, name: 'Alice Anderson', email: 'alice.anderson@student.edu', role: 'student', dept: 'CSE', status: 'active', joined: '2023-08-01', phone: '9876543210' },
  { id: 2, name: 'Dr. Rajesh Sharma', email: 'dr.sharma@campusconnect.edu', role: 'faculty', dept: 'CSE', status: 'active', joined: '2018-06-15', phone: '9123456780' },
  { id: 3, name: 'Prof. Neha Mehra', email: 'prof.mehra@campusconnect.edu', role: 'faculty', dept: 'AIML', status: 'active', joined: '2020-01-10', phone: '9012345678' },
  { id: 4, name: 'Bob Patel', email: 'bob.patel@student.edu', role: 'student', dept: 'IT', status: 'active', joined: '2023-08-01', phone: '8765432109' },
  { id: 5, name: 'Charlie Kumar', email: 'charlie.k@student.edu', role: 'student', dept: 'CSE', status: 'inactive', joined: '2022-08-01', phone: '8654321098' },
  { id: 6, name: 'Diana Sharma', email: 'diana.s@student.edu', role: 'student', dept: 'AIML', status: 'active', joined: '2024-08-01', phone: '7543210987' },
  { id: 7, name: 'Prof. Amit Verma', email: 'amit.v@campusconnect.edu', role: 'faculty', dept: 'MECH', status: 'active', joined: '2015-03-20', phone: '7432109876' },
  { id: 8, name: 'Ethan Singh', email: 'ethan.s@student.edu', role: 'student', dept: 'EXTC', status: 'active', joined: '2023-08-01', phone: '6321098765' },
  { id: 9, name: 'Fiona Reddy', email: 'fiona.r@student.edu', role: 'student', dept: 'CSE', status: 'active', joined: '2024-08-01', phone: '6210987654' },
  { id: 10, name: 'Gaurav Joshi', email: 'gaurav.j@student.edu', role: 'student', dept: 'IT', status: 'suspended', joined: '2022-08-01', phone: '9109876543' },
];

const roleColors = { student: { bg: '#eef2ff', text: '#6366f1' }, faculty: { bg: '#ecfdf5', text: '#059669' }, admin: { bg: '#fdf2f8', text: '#db2777' } };
const statusColors = { active: { bg: '#f0fdf4', text: '#16a34a' }, inactive: { bg: '#f3f4f6', text: '#6b7280' }, suspended: { bg: '#fef2f2', text: '#dc2626' } };
const depts = ['CSE', 'IT', 'AIML', 'EXTC', 'MECH', 'CIVIL'];

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalBox = { background: 'white', borderRadius: 16, padding: 32, width: 480, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };

function AdminUsers() {
  const [users, setUsers] = useState(initUsers);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'confirm'
  const [editUser, setEditUser] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: 'student', dept: 'CSE', phone: '' });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = users.filter(u =>
    (filter === 'all' || u.role === filter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => { setForm({ name: '', email: '', role: 'student', dept: 'CSE', phone: '' }); setModal('add'); };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, role: u.role, dept: u.dept, phone: u.phone }); setModal('edit'); };
  const openConfirm = (u, action) => { setConfirmData({ user: u, action }); setModal('confirm'); };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    const newUser = { ...form, id: Date.now(), status: 'active', joined: new Date().toISOString().split('T')[0] };
    setUsers([newUser, ...users]);
    setModal(null);
    showToast(`✅ User "${form.name}" added successfully!`);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === editUser.id ? { ...u, ...form } : u));
    setModal(null);
    showToast(`✅ User "${form.name}" updated successfully!`);
  };

  const handleConfirm = () => {
    const { user, action } = confirmData;
    if (action === 'suspend') {
      setUsers(users.map(u => u.id === user.id ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u));
      showToast(`✅ User "${user.name}" ${user.status === 'suspended' ? 'reactivated' : 'suspended'}.`);
    } else if (action === 'delete') {
      setUsers(users.filter(u => u.id !== user.id));
      showToast(`🗑️ User "${user.name}" removed.`);
    }
    setModal(null);
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', marginTop: 6 };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block' };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: '#111827', color: 'white', padding: '12px 20px', borderRadius: 10, zIndex: 2000, fontSize: 14, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>{toast}</div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>👥 User Management</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Manage students, faculty, and administrators</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users', count: users.length, color: '#6366f1', key: 'all' },
          { label: 'Students', count: users.filter(u => u.role === 'student').length, color: '#d97706', key: 'student' },
          { label: 'Faculty', count: users.filter(u => u.role === 'faculty').length, color: '#10b981', key: 'faculty' },
          { label: 'Suspended', count: users.filter(u => u.status === 'suspended').length, color: '#dc2626', key: 'suspended_filter' },
        ].map((s, i) => (
          <div key={i} onClick={() => setFilter(s.key === 'suspended_filter' ? 'all' : s.key)} style={{
            background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderTop: `4px solid ${s.color}`, cursor: 'pointer',
            border: `2px solid ${filter === s.key ? s.color : 'transparent'}`, transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name or email..."
            style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, width: 300 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'student', 'faculty'].map(r => (
              <button key={r} onClick={() => setFilter(r)} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: filter === r ? '#7c3aed' : '#f3f4f6', color: filter === r ? 'white' : '#374151'
              }}>{r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}</button>
            ))}
            <button onClick={openAdd} style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>+ Add User</button>
          </div>
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
              const rc = roleColors[u.role] || roleColors.student;
              const sc = statusColors[u.status] || statusColors.active;
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>{u.name}</td>
                  <td style={{ padding: '12px', color: '#6b7280', fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '12px' }}><span style={{ background: rc.bg, color: rc.text, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{u.role}</span></td>
                  <td style={{ padding: '12px', color: '#374151' }}>{u.dept}</td>
                  <td style={{ padding: '12px' }}><span style={{ background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{u.status}</span></td>
                  <td style={{ padding: '12px', color: '#6b7280', fontSize: 13 }}>{new Date(u.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openEdit(u)} style={{ background: '#eef2ff', color: '#6366f1', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>✏️ Edit</button>
                      <button onClick={() => openConfirm(u, 'suspend')} style={{ background: u.status === 'suspended' ? '#f0fdf4' : '#fef2f2', color: u.status === 'suspended' ? '#16a34a' : '#dc2626', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        {u.status === 'suspended' ? '✅ Activate' : '🔒 Suspend'}
                      </button>
                      <button onClick={() => openConfirm(u, 'delete')} style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {modal === 'add' && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={modalBox}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: '#111827' }}>➕ Add New User</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelStyle}>Full Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="e.g. Priya Verma" /></div>
              <div><label style={labelStyle}>Email Address *</label><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} placeholder="e.g. priya@student.edu" /></div>
              <div><label style={labelStyle}>Phone Number</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="e.g. 9876543210" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle}>
                    <option value="student">Student</option><option value="faculty">Faculty</option><option value="admin">Admin</option>
                  </select>
                </div>
                <div><label style={labelStyle}>Department</label>
                  <select value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} style={inputStyle}>
                    {depts.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#7c3aed', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {modal === 'edit' && editUser && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={modalBox}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: '#111827' }}>✏️ Edit User</h2>
            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelStyle}>Full Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Email Address</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Phone Number</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle}>
                    <option value="student">Student</option><option value="faculty">Faculty</option><option value="admin">Admin</option>
                  </select>
                </div>
                <div><label style={labelStyle}>Department</label>
                  <select value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} style={inputStyle}>
                    {depts.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {modal === 'confirm' && confirmData && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ ...modalBox, maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{confirmData.action === 'delete' ? '🗑️' : '🔒'}</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#111827' }}>
              {confirmData.action === 'delete' ? 'Delete User?' : confirmData.user.status === 'suspended' ? 'Reactivate User?' : 'Suspend User?'}
            </h2>
            <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
              {confirmData.action === 'delete'
                ? `This will permanently remove "${confirmData.user.name}" from the system.`
                : confirmData.user.status === 'suspended'
                ? `"${confirmData.user.name}" will be reactivated and can log in again.`
                : `"${confirmData.user.name}" will be suspended and cannot log in.`}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleConfirm} style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: confirmData.action === 'delete' ? '#dc2626' : '#d97706', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                {confirmData.action === 'delete' ? 'Yes, Delete' : confirmData.user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
