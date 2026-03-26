// src/pages/quotations.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authcontext';
import API, { API_BASE } from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hasPermission } from '../utils/permissions';

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
    notes: ''
  });

  // Calculate total automatically
  const calculateTotal = () => {
    let total = 0;
    // Installation fee - fiber is free, wireless is 4800
    if (formData.installationType === 'fiber') total += 0;
    else if (formData.installationType === 'wireless') total += 4800;
    
    // Package prices
    if (formData.package === '10Mbps') total += 2000;
    else if (formData.package === '15Mbps') total += 2600;
    else if (formData.package === '20Mbps') total += 3900;
    else if (formData.package === '30Mbps') total += 5400;
    
    formData.otherServices.forEach(s => {
      total += (s.price || 0) * (s.quantity || 1);
    });
    
    return total;
  };

  // Check if coming from installation request or need to view a specific quotation
  useEffect(() => {
    if (location.state) {
      const { installationRequestId, customer, installationType, package: pkg, notes, viewQuotation } = location.state;
      
      // If viewing a specific quotation
      if (viewQuotation) {
        const quote = quotations.find(q => q._id === viewQuotation);
        if (quote) {
          setViewing(quote);
        } else {
          // Fetch the quotation if not in list
          API.get(`/api/quotations/${viewQuotation}`).then(data => {
            setViewing(data);
          }).catch(err => console.error('Error fetching quotation:', err));
        }
        // Clear the state
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
      const data = await API.get('/quotations');
      // Filter quotations based on user role
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
      if (editing) {
        await API.put(`/quotations/${editing._id}`, formData);
        fetchQuotations();
        setShowForm(false);
        setEditing(null);
        setFormData({ customer: '', quotationType: 'installation', installationType: 'fiber', package: '', otherServices: [], startDate: today, endDate: nextMonth, notes: '' });
      } else if (installationRequestId) {
        // Create quotation from installation request
        const total = calculateTotal();
        const response = await API.post(`/api/installation-requests/${installationRequestId}/quotation`, {
          total,
          otherServices: formData.otherServices,
          notes: formData.notes
        });
        alert(`Quotation created successfully! ${response.quotationNumber}`);
        fetchQuotations();
        setShowForm(false);
        setInstallationRequestId(null);
        setFormData({ customer: '', quotationType: 'installation', installationType: 'fiber', package: '', otherServices: [], startDate: today, endDate: nextMonth, notes: '' });
      } else {
        // Create regular quotation
        const dataWithTotal = { ...formData, total: calculateTotal() };
        await API.post('/quotations', dataWithTotal);
        fetchQuotations();
        setShowForm(false);
        setFormData({ customer: '', quotationType: 'installation', installationType: 'fiber', package: '', otherServices: [], startDate: today, endDate: nextMonth, notes: '' });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save quotation: ' + err.message);
    }
  };

  const handleEdit = (quotation) => {
    setEditing(quotation);
    setFormData({
      customer: quotation.customer?._id || '',
      quotationType: quotation.quotationType || 'installation',
      installationType: quotation.installationType,
      package: quotation.package,
      otherServices: quotation.otherServices,
      startDate: quotation.startDate ? new Date(quotation.startDate).toISOString().split('T')[0] : today,
      endDate: quotation.endDate ? new Date(quotation.endDate).toISOString().split('T')[0] : nextMonth,
      notes: quotation.notes
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await API.delete(`/quotations/${id}`);
      fetchQuotations();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadQuotation = async (id, number) => {
    try {
      const response = await fetch(`${API_BASE}/quotations/${id}/pdf?download=true`, {
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

  const convertToInvoice = async (quotationId) => {
    const dueDate = prompt('Enter due date (YYYY-MM-DD):', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    if (!dueDate) return;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      alert('Invalid date format. Please use YYYY-MM-DD');
      return;
    }
    
    try {
      const response = await API.post('/invoices', { quotationId, dueDate });
      alert(`Invoice created successfully! Invoice Number: ${response.invoiceNumber}`);
      setViewing(null);
      // Navigate to invoices page
      setTimeout(() => navigate('/invoices'), 500);
    } catch (err) {
      console.error('Error creating invoice:', err);
      alert(`Failed to create invoice: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  const isCustomer = user?.role === 'customer';
  const userRole = user?.role || '';
  const canEditQuotations = hasPermission(userRole, 'canEdit', 'quotations');
  const canDeleteQuotations = hasPermission(userRole, 'canDelete', 'quotations');
  const canCreateQuotations = hasPermission(userRole, 'canCreate', 'quotations');
  const isCsrOrAdmin = ['admin', 'csr'].includes(user?.role);

  return (
    <div style={{ padding: 32, background: 'linear-gradient(90deg, #e8f5e9 0%, #f7fff7 100%)', minHeight: '100vh', marginTop: '56px' }}>
      {canCreateQuotations && (
        <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
          Create Quotation
        </button>
      )}

      <div style={{ marginTop: isCustomer ? 0 : 20, overflowX: 'auto' }}>
        {quotations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', fontSize: 16, color: '#666' }}>
            {isCustomer ? 'No quotations received yet.' : 'No quotations created yet.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#eafff3', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1.5px solid #43e97b' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Number</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Type</th>
                {!isCustomer && <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Customer</th>}
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Total</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q, index) => (
                <tr key={q._id} style={{ borderBottom: index === quotations.length - 1 ? 'none' : '1px solid #d0e8d8', transition: 'background 0.2s', background: index % 2 === 0 ? '#eafff3' : '#f0fdf5' }} onMouseOver={(e) => e.target.closest('tr').style.background = '#d4edda'} onMouseOut={(e) => e.target.closest('tr').style.background = index % 2 === 0 ? '#eafff3' : '#f0fdf5'}>
                  <td style={{ padding: 15, fontWeight: 500, color: '#186a3b' }}>{q.quotationNumber}</td>
                  <td style={{ padding: 15, color: '#2d7a3e', textTransform: 'capitalize' }}>{q.quotationType || 'installation'}</td>
                  {!isCustomer && <td style={{ padding: 15, color: '#2d7a3e' }}>{q.customer?.name || 'N/A'}</td>}
                  <td style={{ padding: 15, fontWeight: 700, color: '#2d7a3e' }}>KSh {q.total.toLocaleString()}</td>
                  <td style={{ padding: 15 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setViewing(q)}
                        style={{
                          padding: '6px 12px',
                          background: '#2d7a3e',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 14,
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
                              background: '#2d7a3e',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 14,
                              fontWeight: 600
                            }}
                          >
                            ✎ Edit
                          </button>
                          {canDeleteQuotations && (
                          <button
                            onClick={() => handleDelete(q._id)}
                            style={{
                              padding: '6px 12px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 14,
                              fontWeight: 600
                            }}
                          >
                            🗑️ Delete
                          </button>
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

      {viewing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
            style={{
              background: '#eafff3',
              padding: 20,
              borderRadius: 20,
              width: '90%',
              maxWidth: 600,
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              border: '1.5px solid #43e97b',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <h2 style={{
              color: '#186a3b',
              textAlign: 'center',
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              Quotation Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d0e8d8', background: '#eafff3' }}>
                <tbody>
                  <tr><td style={{ padding: 10, border: '1px solid #d0e8d8', fontWeight: 'bold', background: '#d4edda', color: '#186a3b' }}>Number:</td><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e' }}>{viewing.quotationNumber}</td></tr>
                  <tr><td style={{ padding: 10, border: '1px solid #d0e8d8', fontWeight: 'bold', background: '#d4edda', color: '#186a3b' }}>Type:</td><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e', textTransform: 'capitalize' }}>{viewing.quotationType || 'installation'}</td></tr>
                  <tr><td style={{ padding: 10, border: '1px solid #d0e8d8', fontWeight: 'bold', background: '#d4edda', color: '#186a3b' }}>Customer:</td><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e' }}>{viewing.customer?.name || 'N/A'}</td></tr>
                  <tr><td style={{ padding: 10, border: '1px solid #d0e8d8', fontWeight: 'bold', background: '#d4edda', color: '#186a3b' }}>Installation Type:</td><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e' }}>{viewing.installationType}</td></tr>
                  <tr><td style={{ padding: 10, border: '1px solid #d0e8d8', fontWeight: 'bold', background: '#d4edda', color: '#186a3b' }}>Package:</td><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e' }}>{viewing.package || 'None'}</td></tr>
                  <tr><td style={{ padding: 10, border: '1px solid #d0e8d8', fontWeight: 'bold', background: '#d4edda', color: '#186a3b' }}>Start Date:</td><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e' }}>{new Date(viewing.startDate).toLocaleDateString()}</td></tr>
                  <tr><td style={{ padding: 10, border: '1px solid #d0e8d8', fontWeight: 'bold', background: '#d4edda', color: '#186a3b' }}>End Date:</td><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e' }}>{new Date(viewing.endDate).toLocaleDateString()}</td></tr>
                  <tr><td style={{ padding: 10, border: '1px solid #d0e8d8', fontWeight: 'bold', background: '#d4edda', color: '#186a3b' }}>Total:</td><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e', fontWeight: 700 }}>KSh {viewing.total.toLocaleString()}</td></tr>
                  <tr><td style={{ padding: 10, border: '1px solid #d0e8d8', fontWeight: 'bold', background: '#d4edda', color: '#186a3b' }}>Notes:</td><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e' }}>{viewing.notes || 'None'}</td></tr>
                </tbody>
              </table>

              <h3 style={{ color: '#186a3b', marginBottom: 10, fontWeight: 700 }}>Services</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d0e8d8', background: '#eafff3' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                    <th style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'left', fontWeight: 700 }}>Service</th>
                    <th style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'center', fontWeight: 700 }}>Qty</th>
                    <th style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'right', fontWeight: 700 }}>Unit Price</th>
                    <th style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'right', fontWeight: 700 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewing.installationType === 'fiber' && <tr><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e' }}>Fiber Installation</td><td style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'center', color: '#2d7a3e' }}>1</td><td style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'right', color: '#2d7a3e' }}>KSh 2,000</td><td style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'right', color: '#2d7a3e', fontWeight: 700 }}>KSh 2,000</td></tr>}
                  {viewing.installationType === 'wireless' && <tr><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e' }}>Wireless Installation</td><td style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'center', color: '#2d7a3e' }}>1</td><td style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'right', color: '#2d7a3e' }}>KSh 4,800</td><td style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'right', color: '#2d7a3e', fontWeight: 700 }}>KSh 4,800</td></tr>}
                  {viewing.package && <tr><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e' }}>{viewing.package} Package</td><td style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'center', color: '#2d7a3e' }}>1</td><td style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'right', color: '#2d7a3e' }}>KSh {viewing.package === '10Mbps' ? '2,000' : viewing.package === '15Mbps' ? '2,600' : '3,000'}</td><td style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'right', color: '#2d7a3e', fontWeight: 700 }}>KSh {viewing.package === '10Mbps' ? '2,000' : viewing.package === '15Mbps' ? '2,600' : '3,000'}</td></tr>}
                  {viewing.otherServices.map((s, i) => (
                    <tr key={i}><td style={{ padding: 10, border: '1px solid #d0e8d8', color: '#2d7a3e' }}>{s.name}</td><td style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'center', color: '#2d7a3e' }}>{s.quantity || 1}</td><td style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'right', color: '#2d7a3e' }}>KSh {s.price.toLocaleString()}</td><td style={{ padding: 10, border: '1px solid #d0e8d8', textAlign: 'right', color: '#2d7a3e', fontWeight: 700 }}>KSh {(s.price * (s.quantity || 1)).toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <motion.button
                onClick={() => downloadQuotation(viewing._id, viewing.quotationNumber)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '12px 24px',
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Download Quotation
              </motion.button>
              {canEditQuotations && (
                <motion.button
                  onClick={() => { convertToInvoice(viewing._id); setViewing(null); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '12px 24px',
                    background: '#ffc107',
                    color: '#000',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Convert to Invoice
                </motion.button>
              )}
              <motion.button
                onClick={() => setViewing(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '12px 24px',
                  background: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showForm && canCreateQuotations && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
          <motion.form
            onSubmit={handleSubmit}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              padding: 20,
              borderRadius: 20,
              width: '90%',
              maxWidth: 450,
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              border: '1px solid rgba(67, 233, 123, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <h2 style={{
              color: '#2d7a3e',
              textAlign: 'center',
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {editing ? 'Edit' : 'Create'} Quotation
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e' }}>Customer</label>
                <select
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '2px solid #43e97b',
                    fontSize: 14,
                    background: '#f9fff9',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c?.name || 'Unnamed Customer'}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e' }}>Quotation Type</label>
                <select
                  value={formData.quotationType}
                  onChange={(e) => setFormData({ ...formData, quotationType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '2px solid #43e97b',
                    fontSize: 14,
                    background: '#f9fff9',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="installation">Installation</option>
                  <option value="support">Support</option>
                  <option value="extension">Extension</option>
                  <option value="transport">Transport</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e' }}>Installation Type</label>
                <select
                  value={formData.installationType}
                  onChange={(e) => setFormData({ ...formData, installationType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '2px solid #43e97b',
                    fontSize: 14,
                    background: '#f9fff9',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="fiber">Fiber</option>
                  <option value="wireless">Wireless</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e' }}>Package</label>
                <select
                  value={formData.package}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '2px solid #43e97b',
                    fontSize: 14,
                    background: '#f9fff9',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">No Package</option>
                  <option value="10Mbps">10Mbps</option>
                  <option value="15Mbps">15Mbps</option>
                  <option value="20Mbps">20Mbps</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e' }}>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: '2px solid #43e97b',
                      fontSize: 14,
                      background: '#f9fff9',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e' }}>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: '2px solid #43e97b',
                      fontSize: 14,
                      background: '#f9fff9',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e' }}>Other Services</label>
                {formData.otherServices.map((service, index) => (
                  <div key={index} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Service Name"
                      value={service.name}
                      onChange={(e) => {
                        const newServices = [...formData.otherServices];
                        newServices[index].name = e.target.value;
                        setFormData({ ...formData, otherServices: newServices });
                      }}
                      style={{
                        flex: 2,
                        padding: 8,
                        borderRadius: 6,
                        border: '1px solid #43e97b',
                        fontSize: 14,
                        background: '#f9fff9'
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={service.quantity || 1}
                      onChange={(e) => {
                        const newServices = [...formData.otherServices];
                        newServices[index].quantity = parseInt(e.target.value) || 1;
                        setFormData({ ...formData, otherServices: newServices });
                      }}
                      style={{
                        flex: 1,
                        padding: 8,
                        borderRadius: 6,
                        border: '1px solid #43e97b',
                        fontSize: 14,
                        background: '#f9fff9'
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={service.price || 2000}
                      onChange={(e) => {
                        const newServices = [...formData.otherServices];
                        newServices[index].price = parseFloat(e.target.value) || 2000;
                        setFormData({ ...formData, otherServices: newServices });
                      }}
                      style={{
                        flex: 1,
                        padding: 8,
                        borderRadius: 6,
                        border: '1px solid #43e97b',
                        fontSize: 14,
                        background: '#f9fff9'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newServices = formData.otherServices.filter((_, i) => i !== index);
                        setFormData({ ...formData, otherServices: newServices });
                      }}
                      style={{
                        padding: '8px 12px',
                        background: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, otherServices: [...formData.otherServices, { name: '', quantity: 1, price: 2000 }] })}
                  style={{
                    padding: '8px 16px',
                    background: '#43e97b',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Add Service
                </button>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e' }}>Notes</label>
                <textarea
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '2px solid #43e97b',
                    fontSize: 14,
                    background: '#f9fff9',
                    minHeight: 60,
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)'
                }}
              >
                {editing ? 'Update' : 'Create'}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '12px 24px',
                  background: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </div>
  );
}