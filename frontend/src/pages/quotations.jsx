// src/pages/quotations.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authcontext';
import API, { API_BASE } from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hasPermission } from '../utils/permissions';

// Service options based on quotation type
const getServiceOptions = (quotationType) => {
  switch (quotationType) {
    case 'installation':
      return [
        { name: 'Fiber Installation', price: 2000 },
        { name: 'Wireless Installation', price: 4800 },
        { name: 'Router/ONT Device', price: 3500 },
        { name: 'Cabling (per meter)', price: 150 },
        { name: 'Network Switch', price: 4500 },
        { name: 'Patch Panel', price: 2500 },
        { name: 'Cable Management', price: 1200 },
        { name: 'Splicing (per joint)', price: 200 },
        { name: 'Testing & Commissioning', price: 1500 }
      ];
    case 'support':
      return [
        { name: 'Monthly Support - Basic', price: 2500 },
        { name: 'Monthly Support - Standard', price: 5000 },
        { name: 'Monthly Support - Premium', price: 10000 },
        { name: 'On-site Visit', price: 1500 },
        { name: 'Remote Support (per hour)', price: 1000 },
        { name: 'Network Monitoring (monthly)', price: 3000 },
        { name: 'Server Maintenance (monthly)', price: 8000 },
        { name: 'Security Update (per incident)', price: 2000 }
      ];
    case 'transport':
      return [
        { name: 'Local Transport (per trip)', price: 1500 },
        { name: 'Outstation Transport (per km)', price: 100 },
        { name: 'Vehicle Rental (per day)', price: 8000 },
        { name: 'Fuel Charges', price: 0 },
        { name: 'Driver Allowance (per day)', price: 2000 },
        { name: 'Accommodation (per night)', price: 3500 },
        { name: 'Logistics Coordination', price: 2500 }
      ];
    case 'accessories':
      return [
        { name: 'CAT6 Cable (per meter)', price: 80 },
        { name: 'Fiber Patch Cord', price: 350 },
        { name: 'RJ45 Connector (pack of 100)', price: 800 },
        { name: 'Network Rack', price: 15000 },
        { name: 'Wall Mount Bracket', price: 450 },
        { name: 'Cable Tray (per meter)', price: 600 },
        { name: 'Power Strip', price: 450 },
        { name: 'UPS Battery', price: 4500 },
        { name: 'POE Injector', price: 1800 },
        { name: 'Media Converter', price: 2200 }
      ];
    case 'tools':
      return [
        { name: 'Fiber Splicing Tool', price: 15000 },
        { name: 'OTDR Tester', price: 45000 },
        { name: 'Cable Tester', price: 3500 },
        { name: 'Crimping Tool', price: 1500 },
        { name: 'Drill Machine', price: 4500 },
        { name: 'Ladder (aluminum)', price: 6000 },
        { name: 'Safety Gear Kit', price: 2500 },
        { name: 'Tool Box Set', price: 5500 }
      ];
    case 'extension':
    case 'other':
    default:
      return [
        { name: 'Custom Service', price: 0 },
        { name: 'Consultation (per hour)', price: 2000 },
        { name: 'Project Management', price: 15000 },
        { name: 'Training (per session)', price: 8000 },
        { name: 'Documentation', price: 5000 },
        { name: 'Survey & Assessment', price: 3500 }
      ];
  }
};

export default function Quotations() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [installationRequestId, setInstallationRequestId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    customer: '',
    quotationType: 'installation',
    installationType: 'fiber',
    package: '',
    otherServices: [],
    startDate: today,
    endDate: nextMonth,
    notes: '',
    transportDistance: '',
    transportRate: 0,
    supportDuration: '',
    supportRate: 0
  });

  // Calculate total automatically based on quotation type
  const calculateTotal = () => {
    let total = 0;
    
    // For installation type
    if (formData.quotationType === 'installation') {
      if (formData.installationType === 'fiber') total += 0;
      else if (formData.installationType === 'wireless') total += 4800;
      
      if (formData.package === '10Mbps') total += 2000;
      else if (formData.package === '15Mbps') total += 2600;
      else if (formData.package === '20Mbps') total += 3900;
      else if (formData.package === '30Mbps') total += 5400;
    }
    
    // For transport type
    if (formData.quotationType === 'transport') {
      if (formData.transportDistance && formData.transportRate) {
        total += parseFloat(formData.transportDistance) * parseFloat(formData.transportRate);
      }
    }
    
    // For support type
    if (formData.quotationType === 'support') {
      if (formData.supportDuration && formData.supportRate) {
        total += parseFloat(formData.supportDuration) * parseFloat(formData.supportRate);
      }
    }
    
    // Add other services
    formData.otherServices.forEach(s => {
      total += (s.price || 0) * (s.quantity || 1);
    });
    
    return total;
  };

  // Check if coming from installation request or need to view a specific quotation
  useEffect(() => {
    if (location.state) {
      const { installationRequestId, customer, installationType, package: pkg, notes, viewQuotation } = location.state;
      
      if (viewQuotation) {
        const quote = quotations.find(q => q._id === viewQuotation);
        if (quote) {
          setViewing(quote);
        } else {
          API.get(`/api/quotations/${viewQuotation}`).then(data => {
            setViewing(data);
          }).catch(err => console.error('Error fetching quotation:', err));
        }
        navigate(location.pathname, { replace: true });
        return;
      }
      
      setInstallationRequestId(installationRequestId);
      setFormData(prev => ({
        ...prev,
        customer,
        installationType,
        package: pkg || '',
        notes: notes || ''
      }));
      setShowForm(true);
    }
  }, [location.state]);

  useEffect(() => {
    fetchQuotations();
    fetchCustomers();
  }, []);

  const fetchQuotations = async () => {
    try {
      const data = await API.get('/api/quotations');
      let filtered = data;
      if (user?.role === 'customer') {
        filtered = data.filter(q => q.customer?._id === user._id);
      }
      setQuotations(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await API.get('/users?role=customer');
      setCustomers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const total = calculateTotal();
      
      if (editing) {
        await API.put(`/api/quotations/${editing._id}`, { ...formData, total });
        alert('Quotation updated successfully!');
        fetchQuotations();
        setShowForm(false);
        setEditing(null);
        setFormData({ customer: '', quotationType: 'installation', installationType: 'fiber', package: '', otherServices: [], startDate: today, endDate: nextMonth, notes: '', transportDistance: '', transportRate: 0, supportDuration: '', supportRate: 0 });
      } else if (installationRequestId) {
        const response = await API.post(`/api/installation-requests/${installationRequestId}/quotation`, {
          total,
          otherServices: formData.otherServices,
          notes: formData.notes
        });
        alert(`Quotation created successfully! ${response.quotationNumber}`);
        fetchQuotations();
        setShowForm(false);
        setInstallationRequestId(null);
        setFormData({ customer: '', quotationType: 'installation', installationType: 'fiber', package: '', otherServices: [], startDate: today, endDate: nextMonth, notes: '', transportDistance: '', transportRate: 0, supportDuration: '', supportRate: 0 });
      } else {
        const dataWithTotal = { ...formData, total };
        await API.post('/api/quotations', dataWithTotal);
        alert('Quotation created successfully!');
        fetchQuotations();
        setShowForm(false);
        setFormData({ customer: '', quotationType: 'installation', installationType: 'fiber', package: '', otherServices: [], startDate: today, endDate: nextMonth, notes: '', transportDistance: '', transportRate: 0, supportDuration: '', supportRate: 0 });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save quotation: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEdit = (quotation) => {
    setEditing(quotation);
    setFormData({
      customer: quotation.customer?._id || '',
      quotationType: quotation.quotationType || 'installation',
      installationType: quotation.installationType || 'fiber',
      package: quotation.package || '',
      otherServices: quotation.otherServices || [],
      startDate: quotation.startDate ? new Date(quotation.startDate).toISOString().split('T')[0] : today,
      endDate: quotation.endDate ? new Date(quotation.endDate).toISOString().split('T')[0] : nextMonth,
      notes: quotation.notes || '',
      transportDistance: quotation.transportDistance || '',
      transportRate: quotation.transportRate || 0,
      supportDuration: quotation.supportDuration || '',
      supportRate: quotation.supportRate || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this quotation? This action cannot be undone.')) return;
    try {
      await API.delete(`/api/quotations/${id}`);
      alert('Quotation deleted successfully');
      fetchQuotations();
    } catch (err) {
      console.error(err);
      alert('Failed to delete quotation');
    }
  };

  const downloadQuotation = async (id, number) => {
    try {
      const response = await fetch(`${API_BASE}/api/quotations/${id}/pdf?download=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to download quotation');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation-${number}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Failed to download quotation');
    }
  };

  const convertToInvoice = async (quotationId, quotation) => {
    const dueDate = prompt('Enter invoice due date (YYYY-MM-DD):', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    if (!dueDate) return;
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      alert('Invalid date format. Please use YYYY-MM-DD');
      return;
    }
    
    try {
      const response = await API.post('/api/invoices', { 
        quotationId, 
        customer: quotation.customer?._id,
        dueDate 
      });
      alert(`Invoice created successfully! Invoice Number: ${response.invoiceNumber}`);
      fetchQuotations();
      setViewing(null);
      setTimeout(() => navigate('/invoices'), 500);
    } catch (err) {
      console.error('Error creating invoice:', err);
      alert(`Failed to create invoice: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    }
  };

  const addService = (service) => {
    const exists = formData.otherServices.find(s => s.name === service.name);
    if (!exists) {
      setFormData({
        ...formData,
        otherServices: [...formData.otherServices, { ...service, quantity: 1 }]
      });
    }
  };

  const removeService = (index) => {
    setFormData({
      ...formData,
      otherServices: formData.otherServices.filter((_, i) => i !== index)
    });
  };

  const updateServiceQuantity = (index, quantity) => {
    const updated = [...formData.otherServices];
    updated[index].quantity = parseInt(quantity) || 1;
    setFormData({ ...formData, otherServices: updated });
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading quotations...</div>;

  const isCustomer = user?.role === 'customer';
  const userRole = user?.role || '';
  const canEditQuotations = hasPermission(userRole, 'canEdit', 'quotations');
  const canDeleteQuotations = hasPermission(userRole, 'canDelete', 'quotations');
  const canCreateQuotations = hasPermission(userRole, 'canCreate', 'quotations');
  const isCsrOrAdmin = ['admin', 'csr'].includes(user?.role);

  const getQuotationTypeLabel = (type) => {
    const labels = {
      installation: 'Installation',
      support: 'Support',
      extension: 'Extension',
      transport: 'Transport',
      accessories: 'Accessories',
      tools: 'Tools',
      other: 'Other'
    };
    return labels[type] || type;
  };

  // Filter quotations
  const filteredQuotations = quotations.filter(q => {
    const matchesType = filterType === 'all' || q.quotationType === filterType;
    const matchesSearch = !searchTerm || 
      q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const serviceOptions = getServiceOptions(formData.quotationType);

  return (
    <div style={{ 
      padding: 32, 
      background: 'linear-gradient(135deg, #e8f5e9 0%, #f7fff7 100%)', 
      minHeight: '100vh', 
      marginTop: '56px',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ color: '#1b5e20', margin: 0, fontSize: 28, fontWeight: 800 }}>📄 Quotations Management</h1>
          <p style={{ color: '#666', marginTop: 8 }}>Create and manage all quotations for your company operations</p>
        </div>
        {canCreateQuotations && (
          <button 
            onClick={() => { setEditing(null); setFormData({ customer: '', quotationType: 'installation', installationType: 'fiber', package: '', otherServices: [], startDate: today, endDate: nextMonth, notes: '', transportDistance: '', transportRate: 0, supportDuration: '', supportRate: 0 }); setShowForm(true); }}
            style={{ 
              padding: '12px 24px', 
              background: 'linear-gradient(135deg, #2d7a3e 0%, #43a047 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: 8, 
              cursor: 'pointer', 
              fontWeight: 600,
              fontSize: 14
            }}
          >
            ➕ Create Quotation
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 24,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search quotations..."
          style={{ 
            padding: '10px 16px', 
            borderRadius: 8, 
            border: '2px solid #e0e0e0', 
            fontSize: 14,
            minWidth: 250,
            flex: 1
          }}
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ 
            padding: '10px 16px', 
            borderRadius: 8, 
            border: '2px solid #e0e0e0', 
            fontSize: 14,
            minWidth: 180
          }}
        >
          <option value="all">All Types</option>
          <option value="installation">Installation</option>
          <option value="support">Support</option>
          <option value="transport">Transport</option>
          <option value="accessories">Accessories</option>
          <option value="tools">Tools</option>
          <option value="extension">Extension</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{ 
          background: '#fff', 
          padding: 16, 
          borderRadius: 12, 
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#2d7a3e' }}>{quotations.length}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Total Quotations</div>
        </div>
        <div style={{ 
          background: '#fff', 
          padding: 16, 
          borderRadius: 12, 
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ff9800' }}>{quotations.filter(q => q.quotationType === 'installation').length}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Installation</div>
        </div>
        <div style={{ 
          background: '#fff', 
          padding: 16, 
          borderRadius: 12, 
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#2196f3' }}>{quotations.filter(q => q.quotationType === 'support').length}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Support</div>
        </div>
        <div style={{ 
          background: '#fff', 
          padding: 16, 
          borderRadius: 12, 
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#9c27b0' }}>{quotations.filter(q => q.quotationType === 'transport').length}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Transport</div>
        </div>
      </div>

      {/* Quotations Table */}
      <div style={{ overflowX: 'auto' }}>
        {filteredQuotations.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <p style={{ fontSize: 18, color: '#666', fontWeight: 600 }}>
              {isCustomer ? 'No quotations received yet.' : 'No quotations created yet.'}
            </p>
            {canCreateQuotations && (
              <button 
                onClick={() => setShowForm(true)}
                style={{
                  marginTop: 16,
                  padding: '12px 24px',
                  background: '#2d7a3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Create Your First Quotation
              </button>
            )}
          </div>
        ) : (
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            background: '#fff',
            borderRadius: 12, 
            overflow: 'hidden', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            minWidth: 700
          }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Number</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Type</th>
                {!isCustomer && <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Customer</th>}
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Total</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Valid Until</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map((q, index) => (
                <tr key={q._id} style={{ 
                  borderBottom: '1px solid #e0e0e0', 
                  transition: 'background 0.2s',
                  background: index % 2 === 0 ? '#f8fff8' : '#fff'
                }} onMouseOver={(e) => e.target.closest('tr').style.background = '#e8f5e9'} onMouseOut={(e) => e.target.closest('tr').style.background = index % 2 === 0 ? '#f8fff8' : '#fff'}>
                  <td style={{ padding: 15, fontWeight: 600, color: '#186a3b' }}>{q.quotationNumber}</td>
                  <td style={{ padding: 15 }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: '#e8f5e9',
                      color: '#2d7a3e'
                    }}>
                      {getQuotationTypeLabel(q.quotationType)}
                    </span>
                  </td>
                  {!isCustomer && <td style={{ padding: 15, color: '#2d7a3e', fontWeight: 500 }}>{q.customer?.name || 'N/A'}</td>}
                  <td style={{ padding: 15, fontWeight: 700, color: '#2d7a3e', fontSize: 16 }}>KSh {(q.total || 0).toLocaleString()}</td>
                  <td style={{ padding: 15, color: '#666' }}>{q.endDate ? new Date(q.endDate).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ padding: 15 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setViewing(q)}
                        style={{
                          padding: '6px 12px',
                          background: '#1565c0',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        👁️ View
                      </button>
                      {canEditQuotations && (
                        <>
                          <button
                            onClick={() => handleEdit(q)}
                            style={{
                              padding: '6px 12px',
                              background: '#ff9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 600
                            }}
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => convertToInvoice(q._id, q)}
                            style={{
                              padding: '6px 12px',
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 600
                            }}
                          >
                            📋 Invoice
                          </button>
                          {canDeleteQuotations && (
                            <button
                              onClick={() => handleDelete(q._id)}
                              style={{
                                padding: '6px 12px',
                                background: '#d32f2f',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600
                              }}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Quotation Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowForm(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 16,
              width: '95%',
              maxWidth: 700,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              border: '2px solid #43e97b'
            }}
          >
            <h2 style={{
              color: '#186a3b',
              textAlign: 'center',
              margin: '0 0 20px 0',
              fontSize: 22,
              fontWeight: 700
            }}>
              {editing ? '✏️ Edit Quotation' : '📄 Create New Quotation'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Customer *</label>
                  <select
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    required
                    disabled={!!installationRequestId}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Quotation Type *</label>
                  <select
                    value={formData.quotationType}
                    onChange={(e) => setFormData({ ...formData, quotationType: e.target.value, otherServices: [] })}
                    required
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                  >
                    <option value="installation">Installation</option>
                    <option value="support">Support</option>
                    <option value="transport">Transport</option>
                    <option value="accessories">Accessories</option>
                    <option value="tools">Tools</option>
                    <option value="extension">Extension</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {formData.quotationType === 'installation' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Installation Type</label>
                    <select
                      value={formData.installationType}
                      onChange={(e) => setFormData({ ...formData, installationType: e.target.value })}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                    >
                      <option value="fiber">Fiber</option>
                      <option value="wireless">Wireless (+KSh 4800)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Package</label>
                    <select
                      value={formData.package}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                    >
                      <option value="">Select Package</option>
                      <option value="10Mbps">10 Mbps (+KSh 2000)</option>
                      <option value="15Mbps">15 Mbps (+KSh 2600)</option>
                      <option value="20Mbps">20 Mbps (+KSh 3900)</option>
                      <option value="30Mbps">30 Mbps (+KSh 5400)</option>
                    </select>
                  </div>
                </div>
              )}

              {formData.quotationType === 'transport' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Distance (km)</label>
                    <input
                      type="number"
                      value={formData.transportDistance}
                      onChange={(e) => setFormData({ ...formData, transportDistance: e.target.value })}
                      placeholder="Enter distance"
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Rate (per km)</label>
                    <input
                      type="number"
                      value={formData.transportRate}
                      onChange={(e) => setFormData({ ...formData, transportRate: e.target.value })}
                      placeholder="Enter rate"
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                    />
                  </div>
                </div>
              )}

              {formData.quotationType === 'support' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Duration (months)</label>
                    <input
                      type="number"
                      value={formData.supportDuration}
                      onChange={(e) => setFormData({ ...formData, supportDuration: e.target.value })}
                      placeholder="Enter duration"
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Monthly Rate</label>
                    <input
                      type="number"
                      value={formData.supportRate}
                      onChange={(e) => setFormData({ ...formData, supportRate: e.target.value })}
                      placeholder="Enter rate"
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                  />
                </div>
              </div>

              {/* Additional Services */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Additional Services</label>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 8,
                  marginBottom: 12,
                  padding: 12,
                  background: '#f5f5f5',
                  borderRadius: 8
                }}>
                  {serviceOptions.map((service, idx) => {
                    const isAdded = formData.otherServices.some(s => s.name === service.name);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => !isAdded && addService(service)}
                        disabled={isAdded}
                        style={{
                          padding: '6px 12px',
                          background: isAdded ? '#c8e6c9' : '#fff',
                          color: isAdded ? '#2e7d32' : '#333',
                          border: `1px solid ${isAdded ? '#2e7d32' : '#ddd'}`,
                          borderRadius: 20,
                          cursor: isAdded ? 'default' : 'pointer',
                          fontSize: 12,
                          fontWeight: 500
                        }}
                      >
                        {isAdded && '✓ '}{service.name} - KSh {service.price.toLocaleString()}
                      </button>
                    );
                  })}
                </div>
                
                {formData.otherServices.length > 0 && (
                  <div style={{ 
                    padding: 12, 
                    background: '#e8f5e9', 
                    borderRadius: 8,
                    border: '1px solid #a5d6a7'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>Selected Services:</h4>
                    {formData.otherServices.map((service, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: idx < formData.otherServices.length - 1 ? '1px solid #c8e6c9' : 'none'
                      }}>
                        <span style={{ flex: 1 }}>{service.name}</span>
                        <input
                          type="number"
                          value={service.quantity}
                          onChange={(e) => updateServiceQuantity(idx, e.target.value)}
                          min="1"
                          style={{ 
                            width: 60, 
                            padding: 4, 
                            borderRadius: 4, 
                            border: '1px solid #ddd',
                            textAlign: 'center'
                          }}
                        />
                        <span style={{ minWidth: 100, textAlign: 'right', fontWeight: 600 }}>
                          KSh {(service.price * service.quantity).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeService(idx)}
                          style={{
                            padding: '4px 8px',
                            background: '#ffcdd2',
                            color: '#c62828',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            marginLeft: 8
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: 10, 
                    borderRadius: 8, 
                    border: '2px solid #e0e0e0', 
                    minHeight: 80,
                    fontSize: 14
                  }}
                  placeholder="Additional notes or terms..."
                />
              </div>

              {/* Total Display */}
              <div style={{ 
                padding: 16, 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: 12,
                marginBottom: 20,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>Estimated Total</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>
                  KSh {calculateTotal().toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditing(null); }}
                  style={{ 
                    padding: '12px 24px', 
                    background: '#666', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: 8, 
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ 
                    padding: '12px 24px', 
                    background: '#2d7a3e', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: 8, 
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {editing ? 'Update Quotation' : 'Create Quotation'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* View Quotation Modal */}
      {viewing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setViewing(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 16,
              width: '95%',
              maxWidth: 600,
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              border: '2px solid #43e97b'
            }}
          >
            <h2 style={{
              color: '#186a3b',
              textAlign: 'center',
              margin: '0 0 20px 0',
              fontSize: 22,
              fontWeight: 700
            }}>
              Quotation Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
                <tbody>
                  <tr style={{ background: '#f5f5f5' }}><td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#186a3b' }}>Number:</td><td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#2d7a3e', fontWeight: 600 }}>{viewing.quotationNumber}</td></tr>
                  <tr><td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#186a3b', background: '#f5f5f5' }}>Type:</td><td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#2d7a3e' }}>{getQuotationTypeLabel(viewing.quotationType)}</td></tr>
                  <tr style={{ background: '#f5f5f5' }}><td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#186a3b' }}>Customer:</td><td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#2d7a3e' }}>{viewing.customer?.name || 'N/A'}</td></tr>
                  {viewing.installationType && <tr style={{ background: '#f5f5f5' }}><td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#186a3b' }}>Installation Type:</td><td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#2d7a3e' }}>{viewing.installationType}</td></tr>}
                  {viewing.package && <tr style={{ background: '#f5f5f5' }}><td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#186a3b' }}>Package:</td><td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#2d7a3e' }}>{viewing.package}</td></tr>}
                  <tr style={{ background: '#f5f5f5' }}><td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#186a3b' }}>Start Date:</td><td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#2d7a3e' }}>{viewing.startDate ? new Date(viewing.startDate).toLocaleDateString() : 'N/A'}</td></tr>
                  <tr><td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#186a3b', background: '#f5f5f5' }}>End Date:</td><td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#2d7a3e' }}>{viewing.endDate ? new Date(viewing.endDate).toLocaleDateString() : 'N/A'}</td></tr>
                </tbody>
              </table>

              {viewing.otherServices && viewing.otherServices.length > 0 && (
                <>
                  <h3 style={{ color: '#186a3b', marginTop: 12 }}>Services</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ background: '#43e97b', color: 'white' }}>
                        <th style={{ padding: 10, border: '1px solid #e0e0e0', textAlign: 'left', fontSize: 12 }}>Service</th>
                        <th style={{ padding: 10, border: '1px solid #e0e0e0', textAlign: 'center', fontSize: 12 }}>Qty</th>
                        <th style={{ padding: 10, border: '1px solid #e0e0e0', textAlign: 'right', fontSize: 12 }}>Price</th>
                        <th style={{ padding: 10, border: '1px solid #e0e0e0', textAlign: 'right', fontSize: 12 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewing.otherServices.map((s, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: 8, border: '1px solid #e0e0e0', fontSize: 12 }}>{s.name}</td>
                          <td style={{ padding: 8, border: '1px solid #e0e0e0', textAlign: 'center', fontSize: 12 }}>{s.quantity || 1}</td>
                          <td style={{ padding: 8, border: '1px solid #e0e0e0', textAlign: 'right', fontSize: 12 }}>KSh {s.price?.toLocaleString()}</td>
                          <td style={{ padding: 8, border: '1px solid #e0e0e0', textAlign: 'right', fontSize: 12, fontWeight: 600 }}>KSh {((s.price || 0) * (s.quantity || 1)).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <div style={{ 
                padding: 16, 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: 12,
                textAlign: 'center',
                marginTop: 12
              }}>
                <div style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>Total Amount</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>
                  KSh {(viewing.total || 0).toLocaleString()}
                </div>
              </div>

              {viewing.notes && (
                <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                  <strong style={{ color: '#186a3b' }}>Notes:</strong>
                  <p style={{ margin: '8px 0 0 0', color: '#666' }}>{viewing.notes}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button
                onClick={() => downloadQuotation(viewing._id, viewing.quotationNumber)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#1565c0',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                📥 Download
              </button>
              {canEditQuotations && (
                <button
                  onClick={() => { setViewing(null); handleEdit(viewing); }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  ✎ Edit
                </button>
              )}
              <button
                onClick={() => convertToInvoice(viewing._id, viewing)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                📋 Convert to Invoice
              </button>
            </div>

            <button
              onClick={() => setViewing(null)}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '12px 16px',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};