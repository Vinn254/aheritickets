// src/pages/invoices.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authcontext';
import API, { API_BASE } from '../utils/api';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { hasPermission } from '../utils/permissions';

export default function Invoices() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');

  const userRole = user?.role || '';
  const canCreateInvoices = hasPermission(userRole, 'canCreate', 'invoices');
  const canEditInvoices = hasPermission(userRole, 'canEdit', 'invoices');
  const canDeleteInvoices = hasPermission(userRole, 'canDelete', 'invoices');

  const [formData, setFormData] = useState({
    quotation: '',
    customer: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  // Check if need to view a specific invoice
  useEffect(() => {
    if (location.state && location.state.viewInvoice) {
      const viewInvoiceId = location.state.viewInvoice;
      const invoice = invoices.find(inv => inv._id === viewInvoiceId);
      if (invoice) {
        setViewing(invoice);
      } else {
        API.get(`/api/invoices/${viewInvoiceId}`).then(data => {
          setViewing(data);
        }).catch(err => console.error('Error fetching invoice:', err));
      }
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  useEffect(() => {
    fetchInvoices();
    fetchQuotations();
    fetchCustomers();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await API.get('/api/invoices');
      setInvoices(data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotations = async () => {
    try {
      const data = await API.get('/api/quotations');
      setQuotations(data);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await API.get('/users?role=customer');
      setCustomers(data.users || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/api/invoices/${editing._id}`, {
          dueDate: formData.dueDate,
          notes: formData.notes
        });
        alert('Invoice updated successfully!');
      } else {
        await API.post('/api/invoices', {
          quotationId: formData.quotation || null,
          customer: formData.customer,
          dueDate: formData.dueDate,
          notes: formData.notes
        });
        alert('Invoice created successfully!');
      }
      setShowForm(false);
      setEditing(null);
      setFormData({
        quotation: '',
        customer: '',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
      });
      fetchInvoices();
    } catch (err) {
      console.error('Error saving invoice:', err);
      alert('Failed to save invoice: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEdit = (invoice) => {
    setEditing(invoice);
    setFormData({
      quotation: invoice.quotation?._id || '',
      customer: invoice.customer?._id || '',
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: invoice.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
    try {
      await API.delete(`/api/invoices/${id}`);
      alert('Invoice deleted successfully');
      fetchInvoices();
    } catch (err) {
      console.error(err);
      alert('Failed to delete invoice');
    }
  };

  const downloadInvoice = async (id, invoiceNumber) => {
    try {
      const response = await fetch(`${API_BASE}/api/invoices/${id}/pdf?download=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Failed to download invoice');
    }
  };

  const viewInvoice = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/invoices/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to view');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to view invoice');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/api/invoices/${id}`, { status: newStatus });
      fetchInvoices();
      if (viewing && viewing._id === id) {
        setViewing({ ...viewing, status: newStatus });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update invoice status');
    }
  };

  const markAsPaid = async (invoiceId) => {
    try {
      await updateStatus(invoiceId, 'paid');
      setPaymentModal(null);
      alert('Invoice marked as paid! You can now create a receipt.');
    } catch (err) {
      console.error(err);
    }
  };

  const createReceiptFromInvoice = async (invoice) => {
    const paymentMethod = prompt('Enter payment method (mpesa/bank/cash):', 'mpesa');
    if (!paymentMethod) return;
    
    const referenceNumber = prompt('Enter reference number (e.g., M-Pesa code):', '');
    
    try {
      await API.post('/api/receipts', {
        invoice: invoice._id,
        amount: invoice.total,
        paymentMethod: paymentMethod.toLowerCase(),
        referenceNumber: referenceNumber || '',
        paymentDate: new Date().toISOString().split('T')[0]
      });
      alert('Receipt created successfully!');
      await updateStatus(invoice._id, 'paid');
      setViewing(null);
      setTimeout(() => navigate('/receipts'), 500);
    } catch (err) {
      console.error('Error creating receipt:', err);
      alert('Failed to create receipt');
    }
  };

  const convertQuotationToInvoice = async (quotation) => {
    const dueDate = prompt('Enter invoice due date (YYYY-MM-DD):', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    if (!dueDate) return;
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      alert('Invalid date format. Please use YYYY-MM-DD');
      return;
    }
    
    try {
      const response = await API.post('/api/invoices', { 
        quotationId: quotation._id, 
        customer: quotation.customer?._id,
        dueDate 
      });
      alert(`Invoice created successfully! Invoice Number: ${response.invoiceNumber}`);
      fetchInvoices();
      fetchQuotations();
    } catch (err) {
      console.error('Error creating invoice:', err);
      alert(`Failed to create invoice: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    }
  };

  // Filter invoices
  const filtered = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch = !searchTerm || 
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.customer && inv.customer.name && inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'unpaid': '#ff6b6b',
      'paid': '#43a047',
      'overdue': '#ffa500',
      'partial': '#2196f3'
    };
    return colors[status] || '#999';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      'unpaid': '#ffebee',
      'paid': '#e8f5e9',
      'overdue': '#fff3e0',
      'partial': '#e3f2fd'
    };
    return colors[status] || '#f5f5f5';
  };

  const statusStats = [
    { status: 'paid', count: invoices.filter(i => i.status === 'paid').length, label: 'Paid' },
    { status: 'unpaid', count: invoices.filter(i => i.status === 'unpaid').length, label: 'Unpaid' },
    { status: 'overdue', count: invoices.filter(i => i.status === 'overdue').length, label: 'Overdue' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading invoices...</div>;

  return (
    <div style={{
      padding: 32,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #f7f9ff 100%)',
      boxSizing: 'border-box',
      marginTop: '56px'
    }}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ 
              color: '#1565c0', 
              margin: 0, 
              fontSize: 28, 
              fontWeight: 800,
              textShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              📋 Invoices Management
            </h1>
            <p style={{ 
              color: '#666', 
              fontSize: 14, 
              marginTop: 8
            }}>
              Manage all invoices and convert quotations to invoices
            </p>
          </div>
          {canCreateInvoices && (
            <button 
              onClick={() => { 
                setEditing(null); 
                setFormData({ 
                  quotation: '', 
                  customer: '', 
                  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
                  notes: '' 
                }); 
                setShowForm(true); 
              }}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14
              }}
            >
              ➕ Create Invoice
            </button>
          )}
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16,
          marginBottom: '24px'
        }}
      >
        {statusStats.map((stat) => (
          <motion.div
            key={stat.status}
            variants={cardVariants}
            onClick={() => setStatusFilter(stat.status)}
            style={{
              background: getStatusBgColor(stat.status),
              padding: '20px',
              borderRadius: 12,
              textAlign: 'center',
              cursor: 'pointer',
              border: `3px solid ${statusFilter === stat.status ? getStatusColor(stat.status) : 'transparent'}`,
              transition: 'all 0.3s ease',
              boxShadow: `0 4px 12px ${getStatusColor(stat.status)}20`
            }}
            whileHover={{ transform: 'translateY(-4px)' }}
          >
            <div style={{ fontSize: 32, fontWeight: 800, color: getStatusColor(stat.status) }}>
              {stat.count}
            </div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 4, fontWeight: 500 }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
        <motion.div
          variants={cardVariants}
          onClick={() => setStatusFilter('all')}
          style={{
            background: '#f5f5f5',
            padding: '20px',
            borderRadius: 12,
            textAlign: 'center',
            cursor: 'pointer',
            border: `3px solid ${statusFilter === 'all' ? '#666' : 'transparent'}`,
            transition: 'all 0.3s ease'
          }}
          whileHover={{ transform: 'translateY(-4px)' }}
        >
          <div style={{ fontSize: 32, fontWeight: 800, color: '#333' }}>
            {invoices.length}
          </div>
          <div style={{ fontSize: 14, color: '#666', marginTop: 4, fontWeight: 500 }}>
            All Invoices
          </div>
        </motion.div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          display: 'flex', 
          gap: 16, 
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by invoice number or customer..."
          style={{ 
            padding: '12px 16px', 
            borderRadius: 8, 
            border: '2px solid #e0e0e0', 
            fontSize: 14, 
            background: '#fff', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            flex: 1,
            minWidth: 250
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: '2px solid #e0e0e0',
            fontSize: 14,
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="overdue">Overdue</option>
        </select>
      </motion.div>

      {/* Quotation Conversion Section */}
      {canCreateInvoices && quotations.length > 0 && (
        <div style={{
          background: '#fff',
          padding: 20,
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '2px solid #4caf50'
        }}>
          <h3 style={{ color: '#2e7d32', marginTop: 0, marginBottom: 16 }}>
            📄 Convert Quotation to Invoice
          </h3>
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            flexWrap: 'wrap',
            overflowX: 'auto',
            paddingBottom: 8
          }}>
            {quotations.filter(q => !q.convertedToInvoice).slice(0, 5).map(q => (
              <div key={q._id} style={{
                padding: 12,
                background: '#e8f5e9',
                borderRadius: 8,
                border: '1px solid #a5d6a7',
                minWidth: 200
              }}>
                <div style={{ fontWeight: 600, color: '#2e7d32' }}>{q.quotationNumber}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{q.customer?.name}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2e7d32', marginTop: 4 }}>
                  KSh {(q.total || 0).toLocaleString()}
                </div>
                <button
                  onClick={() => convertQuotationToInvoice(q)}
                  style={{
                    marginTop: 8,
                    padding: '6px 12px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    width: '100%'
                  }}
                >
                  Create Invoice
                </button>
              </div>
            ))}
            {quotations.filter(q => !q.convertedToInvoice).length > 5 && (
              <div style={{
                padding: 12,
                color: '#666',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center'
              }}>
                +{quotations.filter(q => !q.convertedToInvoice).length - 5} more quotations
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ overflowX: 'auto' }}
      >
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p style={{ fontSize: 18, color: '#666', fontWeight: 600 }}>
              No invoices found
            </p>
            <p style={{ fontSize: 14, color: '#999', marginTop: 8 }}>
              {canCreateInvoices ? 'Create invoices from quotations or directly' : 'No invoices have been created yet'}
            </p>
          </div>
        ) : (
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            background: '#fff',
            borderRadius: 12, 
            overflow: 'hidden', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            minWidth: 800
          }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)', color: 'white' }}>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Number</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Customer</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Amount</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Created</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Due Date</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Status</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice, index) => (
                <tr key={invoice._id} style={{ 
                  borderBottom: '1px solid #e0e0e0',
                  transition: 'background 0.2s',
                  background: index % 2 === 0 ? '#f8f9ff' : '#fff'
                }} onMouseOver={(e) => e.target.closest('tr').style.background = '#e3f2fd'} onMouseOut={(e) => e.target.closest('tr').style.background = index % 2 === 0 ? '#f8f9ff' : '#fff'}>
                  <td style={{ padding: 15, fontWeight: 600, color: '#1565c0' }}>{invoice.invoiceNumber}</td>
                  <td style={{ padding: 15, color: '#333', fontWeight: 500 }}>{invoice.customer?.name || 'N/A'}</td>
                  <td style={{ padding: 15, fontWeight: 700, color: '#1565c0', fontSize: 16 }}>KSh {(invoice.total || 0).toLocaleString()}</td>
                  <td style={{ padding: 15, color: '#666' }}>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ padding: 15, color: '#666' }}>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ padding: 15 }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: getStatusBgColor(invoice.status),
                      color: getStatusColor(invoice.status)
                    }}>
                      {invoice.status}
                    </span>
                  </td>
                  <td style={{ padding: 15 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setViewing(invoice)}
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
                      {canEditInvoices && (
                        <>
                          <button
                            onClick={() => handleEdit(invoice)}
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
                          {invoice.status !== 'paid' && (
                            <button
                              onClick={() => createReceiptFromInvoice(invoice)}
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
                              💰 Receipt
                            </button>
                          )}
                          {canDeleteInvoices && (
                            <button
                              onClick={() => handleDelete(invoice._id)}
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
      </motion.div>

      {/* Create/Edit Invoice Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowForm(false)}
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
            zIndex: 1000
          }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: 30,
              borderRadius: 16,
              maxWidth: 500,
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ color: '#1565c0', marginTop: 0, marginBottom: 20 }}>
              {editing ? '✏️ Edit Invoice' : '📋 Create New Invoice'}
            </h3>
            <form onSubmit={handleSubmit}>
              {!editing && (
                <>
                  <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>From Quotation (Optional)</label>
                    <select
                      value={formData.quotation}
                      onChange={(e) => {
                        const quote = quotations.find(q => q._id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          quotation: e.target.value,
                          customer: quote?.customer?._id || ''
                        });
                      }}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                    >
                      <option value="">Create standalone invoice</option>
                      {quotations.filter(q => !q.convertedToInvoice).map(q => (
                        <option key={q._id} value={q._id}>
                          {q.quotationNumber} - {q.customer?.name} (KSh {q.total?.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Customer *</label>
                    <select
                      value={formData.customer}
                      onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      required
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                    >
                      <option value="">Select Customer</option>
                      {customers.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', minHeight: 80 }}
                  placeholder="Additional notes"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditing(null); }}
                  style={{ padding: '10px 20px', background: '#666', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#1565c0', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                >
                  {editing ? 'Update Invoice' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* View Invoice Modal */}
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
            zIndex: 1000
          }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: 30,
              borderRadius: 16,
              maxWidth: 600,
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ color: '#1565c0', marginTop: 0, marginBottom: 20 }}>Invoice Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
                <tbody>
                  <tr style={{ background: '#f5f5f5' }}>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#1565c0' }}>Number:</td>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#333', fontWeight: 600 }}>{viewing.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#1565c0', background: '#f5f5f5' }}>Customer:</td>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#333' }}>{viewing.customer?.name || 'N/A'}</td>
                  </tr>
                  <tr style={{ background: '#f5f5f5' }}>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#1565c0' }}>Created:</td>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#333' }}>{viewing.createdAt ? new Date(viewing.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#1565c0', background: '#f5f5f5' }}>Due Date:</td>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#333' }}>{viewing.dueDate ? new Date(viewing.dueDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ 
                padding: 20, 
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                borderRadius: 12,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>Total Amount</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>
                  KSh {(viewing.total || 0).toLocaleString()}
                </div>
              </div>

              <div style={{ 
                padding: 12, 
                background: getStatusBgColor(viewing.status),
                borderRadius: 8,
                textAlign: 'center'
              }}>
                <span style={{ 
                  fontSize: 16,
                  fontWeight: 700,
                  color: getStatusColor(viewing.status)
                }}>
                  Status: {viewing.status?.toUpperCase()}
                </span>
              </div>

              {viewing.notes && (
                <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                  <strong style={{ color: '#1565c0' }}>Notes:</strong>
                  <p style={{ margin: '8px 0 0 0', color: '#666' }}>{viewing.notes}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <button
                onClick={() => viewInvoice(viewing._id)}
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
                📄 View PDF
              </button>
              <button
                onClick={() => downloadInvoice(viewing._id, viewing.invoiceNumber)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#43a047',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                📥 Download
              </button>
              {viewing.status !== 'paid' && (
                <button
                  onClick={() => createReceiptFromInvoice(viewing)}
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
                  💰 Create Receipt
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              {canEditInvoices && (
                <button
                  onClick={() => { setViewing(null); handleEdit(viewing); }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#666',
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
                onClick={() => setViewing(null)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
