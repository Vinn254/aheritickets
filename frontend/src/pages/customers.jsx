import React, { useEffect, useState, useContext } from 'react';
import API from '../utils/api';
import { AuthContext } from '../context/authcontext';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser, FaPhone, FaMapMarkerAlt, FaToggleOn, FaToggleOff, FaUpload } from 'react-icons/fa';

const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333', fontSize: '13px' };
const primaryBtn = { padding: '10px 20px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' };
const secondaryBtn = { padding: '8px 16px', background: '#666', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const cardStyle = { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px', overflow: 'visible' };

export default function Customers() {
  const { user } = useContext(AuthContext);
  const userRole = user?.role || '';
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [file, setFile] = useState(null);

  // Form state - matching manage users fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [customerSegment, setCustomerSegment] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [routerMacAddress, setRouterMacAddress] = useState('');
  const [location, setLocation] = useState('');
  const [billingPlan, setBillingPlan] = useState('');
  const [status, setStatus] = useState('active');
  const [station, setStation] = useState('');
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    loadCustomers();
  }, [search, statusFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('role', 'customer');
      if (search) params.append('search', search);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await API.get(`/api/users${query}`);
      setCustomers(res.users || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setMsg('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setDeviceType('');
    setAccountNumber('');
    setCustomerSegment('');
    setServiceType('');
    setRouterMacAddress('');
    setLocation('');
    setBillingPlan('');
    setStatus('active');
    setStation('');
    setIpAddress('');
    setEditingCustomer(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setName(customer.name || '');
    setPhone(customer.phone || '');
    setEmail(customer.email || '');
    setPassword('');
    setDeviceType(customer.deviceType || '');
    setAccountNumber(customer.accountNumber || '');
    setCustomerSegment(customer.customerSegment || '');
    setServiceType(customer.serviceType || '');
    setRouterMacAddress(customer.routerMacAddress || '');
    setLocation(customer.location || '');
    setBillingPlan(customer.billingPlan || '');
    setStatus(customer.status || 'active');
    setStation(customer.station || '');
    setIpAddress(customer.ipAddress || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    
    try {
      const payload = { 
        name, 
        phone, 
        email, 
        role: 'customer',
        deviceType,
        accountNumber,
        customerSegment,
        serviceType,
        routerMacAddress,
        location,
        billingPlan,
        status,
        station,
        ipAddress
      };
      
      // Only include password if provided (for new users or password changes)
      if (password) {
        payload.password = password;
      }
      
      if (editingCustomer) {
        // For editing, need to preserve existing fields
        const res = await API.put(`/api/users/${editingCustomer._id}`, payload);
        setCustomers(prev => prev.map(c => c._id === editingCustomer._id ? { ...c, ...res.user || res } : c));
        setMsg('Customer updated successfully');
      } else {
        if (!password) {
          setMsg('Password is required for new customers');
          return;
        }
        const res = await API.post('/api/users', payload);
        setCustomers(prev => [res.user || res, ...prev]);
        setMsg('Customer added successfully');
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || 'Failed to save customer');
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await API.delete(`/api/users/${customerId}`);
      setCustomers(prev => prev.filter(c => c._id !== customerId));
      setMsg('Customer deleted successfully');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to delete customer');
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
      loadCustomers();
    } catch (err) {
      setMsg('Failed to upload: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditPassword = async (customer) => {
    const newPassword = prompt(`Enter new password for ${customer.name}:`);
    if (!newPassword) return;
    try {
      await API.patch(`/api/users/${customer._id}`, { password: newPassword });
      setMsg('Password updated successfully');
    } catch (err) {
      setMsg('Failed to update password');
    }
  };

  const handleStatusChange = async (customer, newStatus) => {
    try {
      await API.patch(`/api/users/${customer._id}`, { status: newStatus });
      setCustomers(prev => prev.map(c => c._id === customer._id ? { ...c, status: newStatus } : c));
      setMsg(`Customer status changed to ${newStatus}`);
    } catch (err) {
      setMsg('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#2d7a3e';
      case 'dormant': return '#f57c00';
      case 'deactive': return '#d32f2f';
      default: return '#666';
    }
  };

  const getConnectionIcon = (type) => {
    return type === 'fiber' ? '🌐' : '📡';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', overflowX: 'visible' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', color: '#1b5e20', fontSize: '28px', fontWeight: '700' }}>Customer Management</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Manage customer information, connection types, and package status</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {userRole !== 'technician' && (
              <button onClick={openAddModal} style={primaryBtn}>
                <FaPlus /> Add Customer
              </button>
            )}
          </div>
        </div>

        {/* Bulk Upload - Only for admin and CSR */}
        {userRole !== 'technician' && (
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#2d7a3e', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUpload /> Bulk Upload Customers
          </h3>
          <form onSubmit={handleBulkUpload} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv,.pdf,.doc,.docx" 
              onChange={e => setFile(e.target.files[0])} 
              style={{ ...inputStyle, width: 'auto' }} 
            />
            <button type="submit" style={primaryBtn}>
              <FaUpload /> Upload
            </button>
            <span style={{ color: '#666', fontSize: '12px' }}>
              Supported formats: Excel (.xlsx, .xls), CSV, PDF, Word (.doc, .docx)
            </span>
          </form>
        </div>
        )}

        {/* Message */}
        {msg && (
          <div style={{ 
            padding: '12px 20px', 
            background: msg.includes('Failed') ? '#ffebee' : '#e8f5e9', 
            color: msg.includes('Failed') ? '#d32f2f' : '#2d7a3e',
            borderRadius: '8px', 
            marginBottom: '20px'
          }}>
            {msg}
          </div>
        )}

        {/* Search and Filter */}
        <div style={{ ...cardStyle, display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '150px', maxWidth: '400px' }}>
            <input 
              type="text" 
              value={searchInput} 
              onChange={e => setSearchInput(e.target.value)} 
              placeholder="Search by name, email, phone..." 
              style={{ ...inputStyle, flex: 1, maxWidth: '250px' }} 
            />
            <button type="submit" style={{ ...primaryBtn, padding: '10px 15px', whiteSpace: 'nowrap' }}>
              <FaSearch /> Search
            </button>
          </form>
        </div>

        {/* Customers Table */}
        <div style={{ 
          ...cardStyle, 
          overflowX: 'scroll', 
          padding: '0', 
          width: '100%',
          maxWidth: '100%',
          overflowY: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '1200px' }}>
            <thead>
              <tr style={{ background: '#2d7a3e', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Account #</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>POP</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Service</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Station</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>IP Address</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Router</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Billing Plan</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    No customers found. Add a customer or upload a file.
                  </td>
                </tr>
              ) : (
                customers
                  .filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search))
                  .map((customer, i) => (
                    <tr key={customer._id} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FaUser color="#2d7a3e" />
                          {customer.name}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>{customer.accountNumber || '-'}</td>
                      <td style={{ padding: '12px' }}>{customer.phone || '-'}</td>
                      <td style={{ padding: '12px' }}>{customer.email}</td>
                      <td style={{ padding: '12px' }}>{customer.customerSegment || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {customer.serviceType || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{customer.station || '-'}</td>
                      <td style={{ padding: '12px' }}>{customer.ipAddress || '-'}</td>
                      <td style={{ padding: '12px', fontSize: '11px' }}>{customer.deviceType || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        <select 
                          value={customer.status || 'active'} 
                          onChange={(e) => handleStatusChange(customer, e.target.value)}
                          style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            border: '1px solid #ddd',
                            backgroundColor: getStatusColor(customer.status || 'active'),
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="dormant">Dormant</option>
                          <option value="deactive">Deactive</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={customer.location}>
                        {customer.location || '-'}
                      </td>
                      <td style={{ padding: '12px' }}>{customer.billingPlan || '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button onClick={() => openEditModal(customer)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d7a3e', fontSize: '16px' }}>
                            <FaEdit />
                          </button>
                          {userRole !== 'technician' && (
                            <>
                              <button onClick={() => handleEditPassword(customer)} title="Change Password" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f57c00', fontSize: '16px' }}>
                                🔑
                              </button>
                              <button onClick={() => handleDelete(customer._id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', fontSize: '16px' }}>
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', color: '#2d7a3e' }}>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required type="email" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Password {editingCustomer ? '(leave blank to keep current)' : '*'}</label>
                  <input value={password} onChange={e=>setPassword(e.target.value)} placeholder={editingCustomer ? "New password (optional)" : "Password"} required={!editingCustomer} type="password" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Account Number</label>
                  <input value={accountNumber} onChange={e=>setAccountNumber(e.target.value)} placeholder="Account Number" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>POP (Customer Segment)</label>
                  <select value={customerSegment} onChange={e=>setCustomerSegment(e.target.value)} style={inputStyle}>
                    <option value="">Select POP</option>
                    <option value="LAGO">LAGO</option>
                    <option value="MEGA">MEGA</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Service Type</label>
                  <select value={serviceType} onChange={e=>setServiceType(e.target.value)} style={inputStyle}>
                    <option value="">Select Service</option>
                    <option value="Wireless">Wireless</option>
                    <option value="Home fiber">Home fiber</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Router Type</label>
                  <select value={deviceType} onChange={e=>setDeviceType(e.target.value)} style={inputStyle}>
                    <option value="">Select Router Type</option>
                    <option value="TP-link">TP-link</option>
                    <option value="Tender">Tender</option>
                    <option value="Fiber router">Fiber router</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Router MAC Address</label>
                  <input value={routerMacAddress} onChange={e=>setRouterMacAddress(e.target.value)} placeholder="Router MAC Address" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Billing Plan</label>
                  <input value={billingPlan} onChange={e=>setBillingPlan(e.target.value)} placeholder="Billing Plan" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={status} onChange={e=>setStatus(e.target.value)} style={inputStyle}>
                    <option value="active">Active</option>
                    <option value="dormant">Dormant</option>
                    <option value="deactive">Deactive</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Station</label>
                  <input value={station} onChange={e=>setStation(e.target.value)} placeholder="Station" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>IP Address</label>
                  <input value={ipAddress} onChange={e=>setIpAddress(e.target.value)} placeholder="IP Address" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Location</label>
                  <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" style={inputStyle} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" style={primaryBtn}>
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
