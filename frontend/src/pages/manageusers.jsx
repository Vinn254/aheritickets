import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import ErrorBoundary from '../components/ErrorBoundary';

const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' };
const primaryBtn = { padding: '6px 12px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

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
  const [accountNumber, setAccountNumber] = useState('');
  const [customerSegment, setCustomerSegment] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [routerMacAddress, setRouterMacAddress] = useState('');
  const [location, setLocation] = useState('');
  const [billingPlan, setBillingPlan] = useState('');
  const [status, setStatus] = useState('active');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    API.get('/api/users').then(users => {
      console.log('Users loaded:', users);
      setUsers(users.users || users || []);
    }).catch(err => {
      console.error('Failed to load users:', err);
    });
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
        payload.status = status;
      }
      const res = await API.post('/api/users', payload);
      setUsers(prev => [...prev, res.user || res]);
      setName(''); setPhone(''); setEmail(''); setPassword(''); setRole('csr'); 
      setSpecialization(''); setDeviceType(''); setAccountNumber(''); setCustomerSegment(''); 
      setServiceType(''); setRouterMacAddress(''); setLocation(''); setBillingPlan(''); setStatus('active');
      setMsg('User added successfully');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  useEffect(() => {
    if (searchInput === '') setSearch('');
  }, [searchInput]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/api/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      setMsg('User deleted');
    } catch (err) {
      setMsg('Failed to delete user');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!file) { setMsg('Please select a file'); return; }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await API.upload('/api/users/bulk', formData);
      setMsg(result.message);
      setFile(null);
      const users = await API.get('/api/users');
      setUsers(users.users || users || []);
    } catch (err) {
      setMsg('Failed to upload: ' + err.message);
    }
  };

  const handleEditPassword = async (user) => {
    const newPassword = prompt(`Enter new password for ${user.name}:`);
    if (!newPassword) return;
    try {
      await API.patch(`/api/users/${user._id}`, { password: newPassword });
      setMsg('Password updated successfully');
    } catch (err) {
      setMsg('Failed to update password');
    }
  };

  const handleViewDetails = (user) => {
    const details = `
Name: ${user.name}
Phone: ${user.phone}
Email: ${user.email}
Role: ${user.role}
${user.specialization ? 'Specialization: ' + user.specialization + '\n' : ''}
${user.accountNumber ? 'Account Number: ' + user.accountNumber + '\n' : ''}
${user.deviceType ? 'Device Type: ' + user.deviceType + '\n' : ''}
${user.customerSegment ? 'Customer Segment: ' + user.customerSegment + '\n' : ''}
${user.serviceType ? 'Service Type: ' + user.serviceType + '\n' : ''}
${user.routerMacAddress ? 'Router MAC: ' + user.routerMacAddress + '\n' : ''}
${user.location ? 'Location: ' + user.location + '\n' : ''}
${user.billingPlan ? 'Billing Plan: ' + user.billingPlan : ''}
    `;
    alert(details);
  };

  return (
    <ErrorBoundary componentName="ManageUsers">
      <style>
        {`
          @media (max-width: 768px) {
            .manage-users-container {
              padding: 16px !important;
            }
            .responsive-table th, .responsive-table td {
              padding: 4px !important;
              font-size: 10px !important;
            }
            .responsive-table {
              font-size: 10px !important;
            }
          }
        `}
      </style>
      <div className="manage-users-container" style={{ padding: '32px', marginTop: '56px', minHeight: '60vh', background: 'linear-gradient(90deg, #e8f5e9 0%, #f7fff7 100%)' }}>
        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search user..." style={{ ...inputStyle, flex: 1 }} />
          <button type="submit" style={primaryBtn}>Search</button>
        </form>

        {/* Add User Form */}
        <form onSubmit={add} style={{ marginBottom: '20px', border: '1.5px solid #43e97b', padding: '15px', borderRadius: '8px', background: '#eafff3' }}>
          <h3>Add New User</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" required style={inputStyle} />
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" required style={inputStyle} />
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required style={inputStyle} />
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required style={inputStyle} type="password" />
            <select value={role} onChange={e=>setRole(e.target.value)} style={inputStyle}>
              <option value="csr">CSR</option>
              <option value="technician">Technician</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
              <option value="hr">HR</option>
              <option value="customer">Customer</option>
              <option value="contractor">Contractor</option>
            </select>
            {(role === 'technician' || role === 'contractor') && <input value={specialization} onChange={e=>setSpecialization(e.target.value)} placeholder="Specialization" style={inputStyle} />}
            {role === 'customer' && <>
              <select value={deviceType} onChange={e=>setDeviceType(e.target.value)} style={inputStyle}>
                <option value="">Select Router Type</option>
                <option value="TP-link">TP-link</option>
                <option value="Tender">Tender</option>
                <option value="Fiber router">Fiber router</option>
              </select>
              <input value={accountNumber} onChange={e=>setAccountNumber(e.target.value)} placeholder="Account Number" style={inputStyle} />
              <select value={customerSegment} onChange={e=>setCustomerSegment(e.target.value)} style={inputStyle}>
                <option value="">Select POP</option>
                <option value="LAGO">LAGO</option>
                <option value="MEGA">MEGA</option>
              </select>
              <select value={serviceType} onChange={e=>setServiceType(e.target.value)} style={inputStyle}>
                <option value="">Select Service</option>
                <option value="Wireless">Wireless</option>
                <option value="Home fiber">Home fiber</option>
              </select>
              <input value={routerMacAddress} onChange={e=>setRouterMacAddress(e.target.value)} placeholder="Router MAC" style={inputStyle} />
              <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" style={inputStyle} />
              <input value={billingPlan} onChange={e=>setBillingPlan(e.target.value)} placeholder="Billing Plan" style={inputStyle} />
            </>}
          </div>
          <button type="submit" style={primaryBtn}>Add User</button>
        </form>

        {msg && <div style={{ padding: '10px', marginBottom: '15px', background: msg.includes('success') ? '#d4edda' : '#f8d7da', color: msg.includes('success') ? '#155724' : '#721c24', borderRadius: '4px' }}>{msg}</div>}

        {/* Staff Table */}
        <h3 style={{ color: '#186a3b', fontWeight: 700 }}>Staff</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px', minWidth: '600px' }}>
          <thead><tr style={{ background: '#2d7a3e', color: 'white' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Phone</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Role</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Actions</th>
          </tr></thead>
          <tbody>
            {users.filter(u => u.role !== 'customer' && (!search || u.name?.toLowerCase().includes(search.toLowerCase())))
              .map((u, i) => <tr key={u._id} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.phone || '-'}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.email}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.role}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => handleViewDetails(u)} title="View Details" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }}>👀</button>
                  <button onClick={() => handleEditPassword(u)} title="Edit Password" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }}>🔑</button>
                  <button onClick={() => handleDelete(u._id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }}>🗑️</button>
                </td>
              </tr>)}
          </tbody>
        </table>
        </div>

        {/* Customers Table */}
        <h3 style={{ color: '#186a3b', fontWeight: 700, marginTop: '30px' }}>Customers</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px', minWidth: '800px' }}>
          <thead><tr style={{ background: '#1976d2', color: 'white' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Phone</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Account #</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Service Type</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Location</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Actions</th>
          </tr></thead>
          <tbody>
            {users.filter(u => u.role === 'customer' && (!search || u.name?.toLowerCase().includes(search.toLowerCase())))
              .map((u, i) => <tr key={u._id} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.phone || '-'}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.email}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.accountNumber || '-'}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.serviceType || '-'}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.location || '-'}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    background: u.status === 'active' ? '#4caf50' : u.status === 'dormant' ? '#ff9800' : '#f44336',
                    color: 'white',
                    fontSize: '10px'
                  }}>
                    {u.status || 'active'}
                  </span>
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => handleViewDetails(u)} title="View Details" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }}>👀</button>
                  <button onClick={() => handleEditPassword(u)} title="Edit Password" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }}>🔑</button>
                  <button onClick={() => handleDelete(u._id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }}>🗑️</button>
                </td>
              </tr>)}
          </tbody>
        </table>
        </div>
      </div>
    </ErrorBoundary>
  );
}


