
// src/pages/ManageUsers.js
import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import ErrorBoundary from '../components/ErrorBoundary';


// Style objects
const inputStyle = { padding: 8, borderRadius: 6, border: '1px solid #ddd' };
const primaryBtn = { padding: '8px 12px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: 6 };
const th = { padding: 10, border: '1px solid #eee' };
const td = { padding: 10, border: '1px solid #eee' };

export default ManageUsers;




function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('csr');
  const [specialization, setSpecialization] = useState('');
  const [deviceType, setDeviceType] = useState('');
  // New customer fields
  const [firstName, setFirstName] = useState('');
  const [otherNames, setOtherNames] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [customerSegment, setCustomerSegment] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [routerMacAddress, setRouterMacAddress] = useState('');
  const [location, setLocation] = useState('');
  const [billingPlan, setBillingPlan] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    API.get('/users').then(users => {
      setUsers(users.users || users || []);
    }).catch(console.error);
  }, []);

  // Add responsive styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .manage-users-form, .bulk-upload-form {
          flex-direction: column !important;
          gap: 12px !important;
        }
        .manage-users-form input,
        .manage-users-form select,
        .manage-users-form button,
        .bulk-upload-form input,
        .bulk-upload-form button {
          min-width: 100% !important;
          flex: 1 !important;
        }
        .manage-users-table {
          font-size: 12px !important;
        }
        .manage-users-table th,
        .manage-users-table td {
          padding: 6px !important;
        }
        .customers-header {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 10px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const payload = { name, phone, email, password, role };
      if (role === 'technician' || role === 'contractor') payload.specialization = specialization;
      if (role === 'customer') {
        payload.deviceType = deviceType;
        payload.accountNumber = accountNumber;
        payload.customerSegment = customerSegment;
        payload.serviceType = serviceType;
        payload.routerMacAddress = routerMacAddress;
        payload.location = location;
        payload.billingPlan = billingPlan;
      }
      const res = await API.post('/users', payload);
      setUsers(prev => [...prev, res.user || res]);
      setName(''); setPhone(''); setEmail(''); setPassword(''); setRole('csr'); setSpecialization(''); setDeviceType('');
      setFirstName(''); setOtherNames(''); setAccountNumber(''); setCustomerSegment(''); setServiceType(''); setRouterMacAddress(''); setLocation(''); setBillingPlan('');
      setMsg('Added');
    } catch (err) {
      let errorMsg = 'Failed to add user.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = 'Error: ' + err.message;
      }
      setMsg(errorMsg);
    } finally {
      // Always refresh user list to avoid stale state or partial updates
      try {
        const users = await API.get('/users');
        setUsers(users.users || users || []);
      } catch (fetchErr) {
        // Don't crash UI if fetch fails
      }
    }
  };

  // Search handler for users
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  // Reset search filter when input is cleared
  React.useEffect(() => {
    if (searchInput === '') setSearch('');
  }, [searchInput]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      setUsers(prev => prev.filter(u => u._id !== userId));
      setMsg('User deleted');
    } catch (err) {
      setMsg('Failed to delete user');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMsg('Please select a file');
      return;
    }
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:5000/api/users/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }
      setMsg(result.message);
      setFile(null);
      // Refresh users list
      const users = await API.get('/users');
      setUsers(users.users || users || []);
    } catch (err) {
      setMsg('Failed to upload: ' + err.message);
    }
  };

  return (
    <ErrorBoundary componentName="ManageUsers">
      <div style={{ padding: 32, background: 'linear-gradient(90deg, #e8f5e9 0%, #f7fff7 100%)', minHeight: '60vh', marginTop: 56 }}>
        <h2 style={{ color: '#186a3b', fontWeight: 700, fontSize: 28, marginBottom: 18, letterSpacing: 1 }}>Manage Users</h2>
        {/* Search bar for admin */}
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, marginTop: 0, maxWidth: 400 }}>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search user by name..."
            style={{ ...inputStyle, minWidth: 120, fontSize: 16 }}
          />
          <button type="submit" style={{ ...primaryBtn, padding: '8px 18px', fontSize: 15 }}>Enter</button>
        </form>

        <form onSubmit={add} className="manage-users-form" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 10,
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          padding: 20,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(44, 130, 89, 0.18)',
          alignItems: 'center',
          border: '2px solid #43e97b',
          maxWidth: 800,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" required style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone number" required style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
          <select value={role} onChange={e=>setRole(e.target.value)} style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }}>
            <option value="csr">CSR</option>
            <option value="technician">Technician</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
            <option value="contractor">Contractor</option>
          </select>
          {(role === 'technician' || role === 'contractor') && (
            <input value={specialization} onChange={e=>setSpecialization(e.target.value)} placeholder="Specialization (e.g. Fiber, Wireless)" required style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
          )}
          {role === 'customer' && (
            <>
              <select value={deviceType} onChange={e=>setDeviceType(e.target.value)} required style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }}>
                <option value="">Select Router Type</option>
                <option value="N/A">N/A</option>
                <option value="TP-link">TP-link</option>
                <option value="Tender">Tender</option>
                <option value="Fiber router">Fiber router</option>
              </select>
              <input value={accountNumber} onChange={e=>setAccountNumber(e.target.value)} placeholder="Account Number" style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
              <select value={customerSegment} onChange={e=>setCustomerSegment(e.target.value)} style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }}>
                <option value="">Select POP</option>
                <option value="N/A">N/A</option>
                <option value="LAGO">LAGO</option>
                <option value="MEGA">MEGA</option>
                <option value="KIBOSWA">KIBOSWA</option>
                <option value="TUMAINI">TUMAINI</option>
                <option value="NYAMASARIA">NYAMASARIA</option>
                <option value="BWAJA">BWAJA</option>
                <option value="WIGOT">WIGOT</option>
                <option value="DIVINE">DIVINE</option>
                <option value="KAJULU">KAJULU</option>
              </select>
              <select value={serviceType} onChange={e=>setServiceType(e.target.value)} style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }}>
                <option value="">Select Service Type</option>
                <option value="N/A">N/A</option>
                <option value="Wireless">Wireless</option>
                <option value="Home fiber">Home fiber</option>
              </select>
              <input value={routerMacAddress} onChange={e=>setRouterMacAddress(e.target.value)} placeholder="Router MAC Address" style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
              <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
              <input value={billingPlan} onChange={e=>setBillingPlan(e.target.value)} placeholder="Billing Plan" style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
            </>
          )}
          <button type="submit" style={{ ...primaryBtn, minWidth: 90, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', fontWeight: 700, boxShadow: '0 2px 8px rgba(44,130,89,0.18)' }}>Add</button>
        </form>
        {msg && (
          <div
            style={{
              marginBottom: 12,
              padding: '8px 16px',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              background: msg.includes('Added') || msg.includes('updated') || msg.includes('deleted') || msg.includes('Uploaded')
                ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
                : 'linear-gradient(90deg, #ff5252 0%, #ffb199 100%)',
              color: '#fff',
              boxShadow: msg.includes('Added') || msg.includes('updated') || msg.includes('deleted') || msg.includes('Uploaded')
                ? '0 2px 6px rgba(44,130,89,0.15)'
                : '0 2px 6px rgba(255,82,82,0.15)',
              textAlign: 'center',
              letterSpacing: 0.5,
              maxWidth: 400,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {msg}
          </div>
        )}
        {/* Other Users Table */}
        <div style={{
          background: 'linear-gradient(135deg, #eafff3 0%, #f7fff7 100%)',
          borderRadius: 14,
          boxShadow: '0 4px 24px rgba(44, 130, 89, 0.13)',
          padding: 18,
          marginTop: 88,
          maxWidth: 1200,
          marginLeft: 'auto',
          marginRight: 'auto',
          overflowX: 'auto',
        }}>
          <h3 style={{ color: '#186a3b', fontWeight: 700, marginBottom: 18 }}>Staff</h3>
          <table className="manage-users-table" style={{ minWidth: '500px', width: '100%', borderCollapse: 'collapse', fontSize: 16, color: '#1a2d1a', fontWeight: 500 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', fontWeight: 800 }}>
                <th style={{ ...th, border: 'none', padding: 12, letterSpacing: 1 }}>Name</th>
                <th style={{ ...th, border: 'none', padding: 12, letterSpacing: 1 }}>Phone</th>
                <th style={{ ...th, border: 'none', padding: 12, letterSpacing: 1 }}>Email</th>
                <th style={{ ...th, border: 'none', padding: 12, letterSpacing: 1 }}>Role</th>
                <th style={{ ...th, border: 'none', padding: 12, letterSpacing: 1 }}>Specialization</th>
                <th style={{ ...th, border: 'none', padding: 12, letterSpacing: 1 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(u => u.role !== 'customer' && (!search || (u.name && u.name.toLowerCase().includes(search.toLowerCase()))))
                .map((u, i) => (
                <tr key={u._id || u.email} style={{ background: i % 2 === 0 ? '#e8f5e9' : '#fff' }}>
                  <td style={{ ...td, fontWeight: 600, color: '#134d2a', padding: 10 }}>{u.name}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 10 }}>{u.phone || '-'}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 10 }}>{u.email}</td>
                  <td style={{ ...td, color: u.role === 'admin' ? '#0b4d1e' : u.role === 'csr' ? '#1e88e5' : u.role === 'technician' ? '#43a047' : u.role === 'contractor' ? '#e67e22' : '#2d7a3e', fontWeight: 700, padding: 10, textTransform: 'capitalize' }}>{u.role}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 10 }}>{u.specialization || '-'}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <EditPassword userId={u._id} />
                    <EditDetails user={u} setUsers={setUsers} />
                    <button onClick={() => handleDelete(u._id)} style={{ ...primaryBtn, background: '#ff5252', padding: '4px 8px', fontSize: 13 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* Customers Table */}
        <div style={{
          background: 'linear-gradient(135deg, #eafff3 0%, #f7fff7 100%)',
          borderRadius: 14,
          boxShadow: '0 4px 24px rgba(44, 130, 89, 0.13)',
          padding: 18,
          marginTop: 40,
          maxWidth: 1200,
          marginLeft: 'auto',
          marginRight: 'auto',
          overflowX: 'auto',
        }}>
          <div className="customers-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ color: '#186a3b', fontWeight: 700 }}>Customers</h3>
            <form onSubmit={handleBulkUpload} className="bulk-upload-form" style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.pdf,.docx,.doc"
                onChange={e => setFile(e.target.files[0])}
                style={{ ...inputStyle, width: 200, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600, fontSize: 12 }}
              />
              <button type="submit" style={{ ...primaryBtn, padding: '6px 12px', background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', fontWeight: 700, boxShadow: '0 2px 8px rgba(44,130,89,0.18)', fontSize: 12 }}>Upload</button>
            </form>
          </div>
          <table className="manage-users-table" style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', fontSize: 14, color: '#1a2d1a', fontWeight: 500 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', fontWeight: 800 }}>
                <th style={{ ...th, border: 'none', padding: 8, letterSpacing: 1 }}>Name</th>
                <th style={{ ...th, border: 'none', padding: 8, letterSpacing: 1 }}>Account Number</th>
                <th style={{ ...th, border: 'none', padding: 8, letterSpacing: 1 }}>Phone</th>
                <th style={{ ...th, border: 'none', padding: 8, letterSpacing: 1 }}>Email</th>
                <th style={{ ...th, border: 'none', padding: 8, letterSpacing: 1 }}>Segment</th>
                <th style={{ ...th, border: 'none', padding: 8, letterSpacing: 1 }}>Service Type</th>
                <th style={{ ...th, border: 'none', padding: 8, letterSpacing: 1 }}>Router MAC</th>
                <th style={{ ...th, border: 'none', padding: 8, letterSpacing: 1 }}>Device Type</th>
                <th style={{ ...th, border: 'none', padding: 8, letterSpacing: 1 }}>Location</th>
                <th style={{ ...th, border: 'none', padding: 8, letterSpacing: 1 }}>Billing Plan</th>
                <th style={{ ...th, border: 'none', padding: 8, letterSpacing: 1 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(u => u.role === 'customer' && (!search || (u.name && u.name.toLowerCase().includes(search.toLowerCase()))))
                .map((u, i) => (
                <tr key={u._id || u.email} style={{ background: i % 2 === 0 ? '#e8f5e9' : '#fff' }}>
                  <td style={{ ...td, fontWeight: 600, color: '#134d2a', padding: 8 }}>{u.name}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 8 }}>{u.accountNumber || '-'}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 8 }}>{u.phone || '-'}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 8 }}>{u.email}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 8 }}>{u.customerSegment || '-'}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 8 }}>{u.serviceType || '-'}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 8 }}>{u.routerMacAddress || '-'}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 8 }}>{u.deviceType || '-'}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 8 }}>{u.location || '-'}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 8 }}>{u.billingPlan || '-'}</td>
                  <td style={{ ...td, color: '#1a2d1a', padding: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <EditPassword userId={u._id} />
                    <EditDetails user={u} setUsers={setUsers} />
                    <button onClick={() => handleDelete(u._id)} style={{ ...primaryBtn, background: '#ff5252', padding: '4px 8px', fontSize: 13 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Password edit component for admin (must be outside main component)
function EditPassword({ userId }) {
  const [show, setShow] = React.useState(false);
  const [newPass, setNewPass] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const handleSave = async () => {
    setMsg('');
    try {
      await API.patch(`/users/${userId}`, { password: newPass });
      setMsg('Password updated');
      setShow(false);
      setNewPass('');
    } catch (err) {
      setMsg('Failed');
    }
  };
  return show ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="New password" style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }} />
      <button onClick={handleSave} style={{ ...primaryBtn, padding: '4px 8px', fontSize: 13 }}>Save</button>
      <button onClick={()=>setShow(false)} style={{ ...primaryBtn, background: '#aaa', color: '#fff', padding: '2px 8px', fontSize: 12 }}>Cancel</button>
      {msg && <span style={{ color: msg === 'Password updated' ? 'green' : 'red', fontSize: 12 }}>{msg}</span>}
    </div>
  ) : (
    <button onClick={()=>setShow(true)} style={{ ...primaryBtn, padding: '4px 8px', fontSize: 13 }}>Edit Password</button>
  );
}

// Edit details component for admin
function EditDetails({ user, setUsers }) {
  const [show, setShow] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: user.name || '',
    phone: user.phone || '',
    email: user.email || '',
    role: user.role || 'csr',
    specialization: user.specialization || '',
    deviceType: user.deviceType || '',
    accountNumber: user.accountNumber || '',
    customerSegment: user.customerSegment || '',
    serviceType: user.serviceType || '',
    routerMacAddress: user.routerMacAddress || '',
    location: user.location || '',
    billingPlan: user.billingPlan || ''
  });
  const [msg, setMsg] = React.useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setMsg('');
    try {
      const res = await API.patch(`/users/${user._id}`, formData);
      setMsg('Details updated');
      setShow(false);
      // Update users state
      setUsers(prev => prev.map(u => u._id === user._id ? res.user : u));
    } catch (err) {
      setMsg('Failed to update');
    }
  };

  return show ? (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, maxWidth: 600, width: '90%', maxHeight: '80%', overflowY: 'auto' }}>
        <h4>Edit User Details</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" style={inputStyle} />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" style={inputStyle} />
          <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" style={inputStyle} />
          <select name="role" value={formData.role} onChange={handleChange} style={inputStyle}>
            <option value="csr">CSR</option>
            <option value="technician">Technician</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
            <option value="contractor">Contractor</option>
          </select>
          {(formData.role === 'technician' || formData.role === 'contractor') && (
            <input name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Specialization" style={inputStyle} />
          )}
          {formData.role === 'customer' && (
            <>
              <input name="deviceType" value={formData.deviceType} onChange={handleChange} placeholder="Device Type" style={inputStyle} />
              <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Account Number" style={inputStyle} />
              <input name="customerSegment" value={formData.customerSegment} onChange={handleChange} placeholder="Customer Segment (POP)" style={inputStyle} />
              <input name="serviceType" value={formData.serviceType} onChange={handleChange} placeholder="Service Type" style={inputStyle} />
              <input name="routerMacAddress" value={formData.routerMacAddress} onChange={handleChange} placeholder="Router MAC Address" style={inputStyle} />
              <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" style={inputStyle} />
              <input name="billingPlan" value={formData.billingPlan} onChange={handleChange} placeholder="Billing Plan" style={inputStyle} />
            </>
          )}
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={handleSave} style={primaryBtn}>Save</button>
          <button onClick={()=>setShow(false)} style={{ ...primaryBtn, background: '#aaa' }}>Cancel</button>
        </div>
        {msg && <div style={{ marginTop: 10, color: msg === 'Details updated' ? 'green' : 'red' }}>{msg}</div>}
      </div>
    </div>
  ) : (
    <button onClick={()=>setShow(true)} style={{ ...primaryBtn, padding: '4px 8px', fontSize: 13, marginLeft: 8 }}>Edit Details</button>
  );
}


