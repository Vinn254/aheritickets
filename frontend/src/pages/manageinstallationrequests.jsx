// src/pages/manageinstallationrequests.jsx
import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ManageInstallationRequests() {
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [userRole, setUserRole] = useState('');
  
  const navigate = useNavigate();

  const packages = {
    fiber: [
      { name: '10Mbps', price: 2000 },
      { name: '15Mbps', price: 2600 },
      { name: '20Mbps', price: 3900 },
      { name: '30Mbps', price: 5400 }
    ],
    wireless: [
      { name: '10Mbps', price: 2000 },
      { name: '15Mbps', price: 2600 },
      { name: '20Mbps', price: 3900 },
      { name: '30Mbps', price: 5400 }
    ]
  };

  const installationFees = {
    fiber: 0, // Free
    wireless: 4800
  };

  const routerPrice = 2000;

  const [createForm, setCreateForm] = useState({
    customerId: '',
    installationType: 'fiber',
    package: '10Mbps',
    location: '',
    description: '',
    technicianId: ''
  });

  // New customer form state
  const [customerMode, setCustomerMode] = useState('select'); // 'select' or 'new'
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  
  // Additional options
  const [includeRouter, setIncludeRouter] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
    fetchRequests();
    if (user.role === 'admin' || user.role === 'csr') {
      fetchTechnicians();
      fetchCustomers();
    }
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await API.get('/api/installation-requests');
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const data = await API.get('/api/installation-requests/technicians');
      setTechnicians(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching technicians:', err);
      setTechnicians([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await API.get('/users?role=customer');
      setCustomers(Array.isArray(data) ? data : (data.users || []));
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    }
  };

  const handleCreateInstallation = async (e) => {
    e.preventDefault();
    
    let finalCustomerId = createForm.customerId;
    
    // If creating new customer
    if (customerMode === 'new') {
      if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
        alert('Please fill in all required customer fields (Name, Email, Phone)');
        return;
      }
      try {
        // Create new customer
        const customerRes = await API.post('/api/users', {
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          role: 'customer',
          status: 'active'
        });
        finalCustomerId = customerRes.user._id;
        // Refresh customer list
        fetchCustomers();
      } catch (err) {
        console.error('Error creating customer:', err);
        alert('Failed to create customer: ' + (err.response?.data?.message || err.message));
        return;
      }
    } else if (!createForm.customerId) {
      alert('Please select a customer');
      return;
    }
    
    try {
      // Calculate pricing
      const selectedPackage = packages[createForm.installationType].find(p => p.name === createForm.package);
      const packagePrice = selectedPackage?.price || 0;
      const installFee = installationFees[createForm.installationType];
      const routerCost = includeRouter ? routerPrice : 0;
      const totalUpfront = installFee + routerCost;
      
      await API.post('/api/installation-requests/admin/create', {
        customerId: finalCustomerId,
        installationType: createForm.installationType,
        package: createForm.package,
        packagePrice: packagePrice,
        installationFee: installFee,
        includeRouter: includeRouter,
        routerPrice: routerCost,
        totalUpfront: totalUpfront,
        location: createForm.location,
        description: createForm.description,
        technicianId: createForm.technicianId || null
      });
      alert('Installation created successfully!');
      setShowCreateForm(false);
      setCreateForm({
        customerId: '',
        installationType: 'fiber',
        package: '10Mbps',
        location: '',
        description: '',
        technicianId: ''
      });
      setNewCustomer({ name: '', email: '', phone: '', location: '' });
      setCustomerMode('select');
      setIncludeRouter(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert('Failed to create installation: ' + (err.message || 'Unknown error'));
    }
  };

  const assignTechnician = async (requestId) => {
    const techId = showAssignModal;
    if (!techId) {
      alert('Please select a technician');
      return;
    }
    try {
      await API.put(`/api/installation-requests/${requestId}/assign`, { technicianId: techId });
      alert('Technician assigned successfully!');
      setShowAssignModal(null);
      fetchRequests();
      if (viewing && viewing._id === requestId) {
        const updated = requests.find(r => r._id === requestId);
        setViewing(updated);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to assign technician: ' + (err.message || 'Unknown error'));
    }
  };

  const closeInstallation = async (requestId) => {
    const notes = prompt('Enter confirmation notes (optional):');
    try {
      await API.put(`/api/installation-requests/${requestId}/close`, { adminConfirmationNotes: notes || '' });
      alert('Installation closed successfully!');
      fetchRequests();
      setViewing(null);
    } catch (err) {
      console.error(err);
      alert('Failed to close installation: ' + (err.message || 'Unknown error'));
    }
  };

  const createQuotation = (requestId) => {
    const request = requests.find(r => r._id === requestId);
    if (!request) return;
    
    navigate('/quotations', { 
      state: { 
        installationRequestId: requestId,
        customer: request.customer._id,
        installationType: request.installationType,
        package: request.package,
        notes: request.description
      } 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'opened': '#2196f3',
      'pending': '#ffa500',
      'completed': '#43a047',
      'closed': '#9e9e9e',
      'approved': '#43a047',
      'rejected': '#d32f2f',
      'quoted': '#2196f3'
    };
    return colors[status] || '#999';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      'opened': '#e3f2fd',
      'pending': '#fff3e0',
      'completed': '#e8f5e9',
      'closed': '#f5f5f5',
      'approved': '#e8f5e9',
      'rejected': '#ffebee',
      'quoted': '#e3f2fd'
    };
    return colors[status] || '#f5f5f5';
  };

  const filtered = requests.filter(req => 
    statusFilter === 'all' || req.status === statusFilter
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  const statusStats = [
    { status: 'opened', count: requests.filter(r => r.status === 'opened').length },
    { status: 'pending', count: requests.filter(r => r.status === 'pending').length },
    { status: 'completed', count: requests.filter(r => r.status === 'completed').length },
    { status: 'closed', count: requests.filter(r => r.status === 'closed').length }
  ];

  const isAdmin = userRole === 'admin';

  return (
    <div style={{
      padding: '20px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eafff3 0%, #f7fff7 100%)',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px', textAlign: 'center' }}
      >
        <h1 style={{ 
          color: '#2d7a3e', 
          margin: '0 0 8px 0', 
          fontSize: 'clamp(24px, 5vw, 36px)', 
          fontWeight: '800',
          textShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          Installation Requests
        </h1>
        <p style={{ 
          color: '#4a4a4a', 
          fontSize: 'clamp(14px, 3vw, 16px)', 
          marginTop: '8px', 
          opacity: 0.8,
          margin: '8px 0 0 0'
        }}>
          Manage customer installation requests and assignments
        </p>
      </motion.div>

      {/* Admin Create Button */}
      {isAdmin && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            marginBottom: '24px',
            padding: '12px 24px',
            background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
            color: '#2d7a3e',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)',
            transition: 'all 0.3s ease'
          }}
          whileHover={{ transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(67, 233, 123, 0.4)' }}
        >
          + Create New Installation
        </motion.button>
      )}

      {/* Create Installation Form */}
      {showCreateForm && isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '2px solid #43e97b'
          }}
        >
          <h2 style={{ color: '#2d7a3e', margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700' }}>
            Create New Installation
          </h2>
          <form onSubmit={handleCreateInstallation}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                Customer *
              </label>
              {/* Toggle between select and new customer */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCustomerMode('select')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: customerMode === 'select' ? '#43e97b' : '#f5f5f5',
                    color: customerMode === 'select' ? '#2d7a3e' : '#666',
                    border: `2px solid ${customerMode === 'select' ? '#43e97b' : '#eee'}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Select Existing
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('new')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: customerMode === 'new' ? '#43e97b' : '#f5f5f5',
                    color: customerMode === 'new' ? '#2d7a3e' : '#666',
                    border: `2px solid ${customerMode === 'new' ? '#43e97b' : '#eee'}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  + New Customer
                </button>
              </div>

              {customerMode === 'select' ? (
                <select
                  value={createForm.customerId}
                  onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '2px solid #43e97b',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                  required={customerMode === 'select'}
                >
                  <option value="">Select Customer</option>
                  {customers.map(cust => (
                    <option key={cust._id} value={cust._id}>
                      {cust.name} ({cust.email})
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '2px solid #43e97b',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    required={customerMode === 'new'}
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '2px solid #43e97b',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    required={customerMode === 'new'}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '2px solid #43e97b',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    required={customerMode === 'new'}
                  />
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                Installation Type *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {['fiber', 'wireless'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setCreateForm({ ...createForm, installationType: type, package: packages[type][0] });
                    }}
                    style={{
                      padding: '12px',
                      background: createForm.installationType === type ? '#43e97b' : '#f5f5f5',
                      color: createForm.installationType === type ? '#2d7a3e' : '#666',
                      border: `2px solid ${createForm.installationType === type ? '#43e97b' : '#eee'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textTransform: 'capitalize'
                    }}
                  >
                    {type === 'fiber' ? '🌐' : '📡'} {type}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                Package *
              </label>
              <select
                value={createForm.package}
                onChange={(e) => setCreateForm({ ...createForm, package: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid #43e97b',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                {packages[createForm.installationType].map(pkg => (
                  <option key={pkg.name} value={pkg.name}>{pkg.name} - KES {pkg.price}/mo</option>
                ))}
              </select>
            </div>

            {/* Cost Summary */}
            <div style={{ 
              marginBottom: '16px', 
              padding: '12px', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>Installation Type:</span>
                <span style={{ fontWeight: '600', color: '#2d7a3e', textTransform: 'capitalize' }}>
                  {createForm.installationType}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>Installation Fee:</span>
                <span style={{ fontWeight: '600', color: installationFees[createForm.installationType] === 0 ? '#43a047' : '#d32f2f' }}>
                  {installationFees[createForm.installationType] === 0 ? 'FREE' : `KES ${installationFees[createForm.installationType]}`}
                  {createForm.installationType === 'wireless' && ' (includes router)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>Monthly Package:</span>
                <span style={{ fontWeight: '600', color: '#2d7a3e' }}>
                  KES {packages[createForm.installationType].find(p => p.name === createForm.package)?.price || 0}/mo
                </span>
              </div>
              {createForm.installationType !== 'wireless' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666' }}>Router (optional):</span>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={includeRouter}
                      onChange={(e) => setIncludeRouter(e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontWeight: '600', color: includeRouter ? '#2d7a3e' : '#666' }}>
                      KES {routerPrice}
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                Location
              </label>
              <input
                type="text"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                placeholder="e.g., 123 Main Street, City"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid #43e97b',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                Description
              </label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Additional details..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid #43e97b',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '60px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                Assign Technician (Optional)
              </label>
              <select
                value={createForm.technicianId}
                onChange={(e) => setCreateForm({ ...createForm, technicianId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid #43e97b',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="">Select Technician</option>
                {technicians.map(tech => (
                  <option key={tech._id} value={tech._id}>
                    {tech.name} ({tech.specialization || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '12px',
                  background: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '12px',
                  background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                  color: '#2d7a3e',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Create Installation
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Statistics */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '12px',
          marginBottom: '32px'
        }}
      >
        {statusStats.map((stat) => (
          <motion.div
            key={stat.status}
            variants={cardVariants}
            onClick={() => setStatusFilter(stat.status)}
            style={{
              background: getStatusBgColor(stat.status),
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              border: `2px solid ${statusFilter === stat.status ? getStatusColor(stat.status) : 'transparent'}`,
              transition: 'all 0.3s ease'
            }}
            whileHover={{ transform: 'translateY(-4px)' }}
          >
            <div style={{ fontSize: '24px', fontWeight: '800', color: getStatusColor(stat.status) }}>
              {stat.count}
            </div>
            <div style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize', marginTop: '4px', fontWeight: '500' }}>
              {stat.status}
            </div>
          </motion.div>
        ))}
        <motion.div
          variants={cardVariants}
          onClick={() => setStatusFilter('all')}
          style={{
            background: '#f0f0f0',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            border: `2px solid ${statusFilter === 'all' ? '#333' : 'transparent'}`,
            transition: 'all 0.3s ease'
          }}
          whileHover={{ transform: 'translateY(-4px)' }}
        >
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>
            {requests.length}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontWeight: '500' }}>
            All
          </div>
        </motion.div>
      </motion.div>

      {/* Requests Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}
      >
        {filtered.length > 0 ? (
          filtered.map((req) => (
            <motion.div
              key={req._id}
              variants={cardVariants}
              whileHover={{ transform: 'translateY(-8px)' }}
              onClick={() => setViewing(req)}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: `2px solid ${getStatusBgColor(req.status)}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                background: getStatusBgColor(req.status),
                padding: '12px 16px',
                borderBottom: `3px solid ${getStatusColor(req.status)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, color: '#2d7a3e', fontSize: '16px', fontWeight: '700' }}>
                  {req.requestNumber}
                </h3>
                <div style={{
                  background: getStatusColor(req.status),
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'capitalize'
                }}>
                  {req.status}
                </div>
              </div>

              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Customer</p>
                  <p style={{ margin: 0, color: '#2d7a3e', fontSize: '14px', fontWeight: '700' }}>
                    {req.customer?.name}
                  </p>
                  <p style={{ margin: '2px 0 0 0', color: '#999', fontSize: '11px' }}>
                    {req.customer?.phone}
                  </p>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Type & Package</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '13px', fontWeight: '600' }}>
                    {req.installationType === 'fiber' ? '🌐' : '📡'} {req.installationType} - {req.package}
                  </p>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Technician</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                    {req.technician ? `👤 ${req.technician.name}` : 'Not assigned'}
                  </p>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Location</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                    📍 {req.location || 'Not specified'}
                  </p>
                </div>

                {req.quotation && (
                  <div style={{ marginTop: '12px', padding: '8px', background: '#e3f2fd', borderRadius: '6px' }}>
                    <p style={{ margin: 0, color: '#1976d2', fontSize: '11px', fontWeight: '600' }}>
                      ✓ Quotation: {req.quotation.quotationNumber}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 20px',
              color: '#999'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>No requests found</p>
          </motion.div>
        )}
      </motion.div>

      {/* Viewing Modal */}
      {viewing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setViewing(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '550px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              background: getStatusBgColor(viewing.status),
              padding: '20px',
              borderBottom: `3px solid ${getStatusColor(viewing.status)}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, color: '#2d7a3e' }}>{viewing.requestNumber}</h2>
              <button
                onClick={() => setViewing(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Status</p>
                <div style={{
                  display: 'inline-block',
                  background: getStatusColor(viewing.status),
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'capitalize'
                }}>
                  {viewing.status}
                </div>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '11px' }}>
                  Status flow: Opened → Pending (In Progress) → Completed → Closed
                </p>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Customer</p>
                <p style={{ margin: 0, color: '#2d7a3e', fontSize: '16px', fontWeight: '700' }}>
                  {viewing.customer?.name}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>
                  📧 {viewing.customer?.email} | 📞 {viewing.customer?.phone}
                </p>
                <p style={{ margin: '2px 0 0 0', color: '#666', fontSize: '12px' }}>
                  📍 {viewing.customer?.location}
                </p>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Installation Details</p>
                <p style={{ margin: '0 0 4px 0', color: '#2d7a3e', fontSize: '14px', fontWeight: '700' }}>
                  {viewing.installationType === 'fiber' ? '🌐' : '📡'} {viewing.installationType.charAt(0).toUpperCase() + viewing.installationType.slice(1)} - {viewing.package}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>
                  📍 Location: {viewing.location}
                </p>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Assigned Technician</p>
                {viewing.technician ? (
                  <p style={{ margin: 0, color: '#2d7a3e', fontSize: '14px', fontWeight: '700' }}>
                    👤 {viewing.technician.name}
                    <span style={{ color: '#666', fontWeight: '400' }}> ({viewing.technician.email})</span>
                  </p>
                ) : (
                  <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>Not assigned yet</p>
                )}
              </div>

              {viewing.description && (
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Additional Details</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '13px', lineHeight: '1.5' }}>
                    {viewing.description}
                  </p>
                </div>
              )}

              {viewing.technicianNotes && (
                <div style={{ marginBottom: '16px', padding: '12px', background: '#fff3e0', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#e65100', fontSize: '12px', fontWeight: '600' }}>Technician Completion Notes</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '13px', lineHeight: '1.5' }}>
                    {viewing.technicianNotes}
                  </p>
                  {viewing.completionDate && (
                    <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '11px' }}>
                      Completed on: {new Date(viewing.completionDate).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {viewing.adminConfirmationNotes && (
                <div style={{ marginBottom: '16px', padding: '12px', background: '#e8f5e9', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#2d7a3e', fontSize: '12px', fontWeight: '600' }}>Admin Confirmation Notes</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '13px', lineHeight: '1.5' }}>
                    {viewing.adminConfirmationNotes}
                  </p>
                  {viewing.closedDate && (
                    <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '11px' }}>
                      Closed on: {new Date(viewing.closedDate).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {viewing.quotation && (
                <div style={{ marginBottom: '16px', padding: '12px', background: '#e3f2fd', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#1976d2', fontSize: '12px', fontWeight: '600' }}>✓ Quotation Created</p>
                  <p style={{ margin: 0, color: '#1976d2', fontSize: '14px', fontWeight: '700' }}>
                    {viewing.quotation.quotationNumber}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {isAdmin && viewing.status === 'opened' && !viewing.technician && (
                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      color: '#2d7a3e',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    👤 Assign Technician
                  </button>
                </div>
              )}

              {isAdmin && viewing.status === 'completed' && (
                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => closeInstallation(viewing._id)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    ✓ Close Installation (Admin Confirmation)
                  </button>
                  <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '11px', textAlign: 'center' }}>
                    Only admin can close after technician completes the work
                  </p>
                </div>
              )}

              {!isAdmin && viewing.status === 'opened' && (
                <div style={{ marginTop: '20px', padding: '12px', background: '#fff3e0', borderRadius: '6px' }}>
                  <p style={{ margin: 0, color: '#e65100', fontSize: '12px', fontWeight: '600' }}>
                    ⏳ Waiting for admin to assign a technician
                  </p>
                </div>
              )}

              {!isAdmin && viewing.status === 'pending' && (
                <div style={{ marginTop: '20px', padding: '12px', background: '#fff3e0', borderRadius: '6px' }}>
                  <p style={{ margin: 0, color: '#e65100', fontSize: '12px', fontWeight: '600' }}>
                    🔧 Installation in progress
                  </p>
                </div>
              )}

              {viewing.status === 'closed' && (
                <div style={{ marginTop: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '12px', fontWeight: '600' }}>
                    ✅ Installation completed and closed
                  </p>
                </div>
              )}

              <button
                onClick={() => setViewing(null)}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '12px',
                  background: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Assign Technician Modal */}
      {showAssignModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAssignModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#2d7a3e', fontSize: '18px', fontWeight: '700' }}>
              Assign Technician
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <select
                id="techSelect"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid #43e97b',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="">Select Technician</option>
                {technicians.map(tech => (
                  <option key={tech._id} value={tech._id}>
                    {tech.name} ({tech.specialization || 'General'})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => setShowAssignModal(null)}
                style={{
                  padding: '10px',
                  background: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const techId = document.getElementById('techSelect').value;
                  assignTechnician(viewing._id);
                }}
                style={{
                  padding: '10px',
                  background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                  color: '#2d7a3e',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Assign
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
