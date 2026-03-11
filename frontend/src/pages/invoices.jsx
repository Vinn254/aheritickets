// src/pages/invoices.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authcontext';
import API, { API_BASE } from '../utils/api';
import { motion } from 'framer-motion';

export default function Invoices() {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await API.get('/invoices');
      setInvoices(data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      alert('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await API.delete(`/invoices/${id}`);
      fetchInvoices();
      alert('Invoice deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete invoice');
    }
  };

  const downloadInvoice = async (id, invoiceNumber) => {
    try {
      const response = await fetch(`${API_BASE}/invoices/${id}/pdf?download=true`, {
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
      const response = await fetch(`${API_BASE}/invoices/${id}/pdf`, {
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
      await API.put(`/invoices/${id}`, { status: newStatus });
      fetchInvoices();
      // If viewed modal is open, update it
      if (viewing && viewing._id === id) {
        const updatedInvoices = invoices.map(inv => 
          inv._id === id ? { ...inv, status: newStatus } : inv
        );
        setInvoices(updatedInvoices);
        setViewing({ ...viewing, status: newStatus });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update invoice status');
    }
  };

  const markAsPaid = async (invoiceId) => {
    try {
      const result = await updateStatus(invoiceId, 'paid');
      setPaymentModal(null);
      alert('Invoice marked as paid!');
    } catch (err) {
      console.error(err);
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
      'overdue': '#ffa500'
    };
    return colors[status] || '#999';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      'unpaid': '#ffe8e8',
      'paid': '#e8f5e9',
      'overdue': '#fff3e0'
    };
    return colors[status] || '#f5f5f5';
  };

  const statusStats = [
    { status: 'paid', count: invoices.filter(i => i.status === 'paid').length },
    { status: 'unpaid', count: invoices.filter(i => i.status === 'unpaid').length },
    { status: 'overdue', count: invoices.filter(i => i.status === 'overdue').length }
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
          Invoices
        </h1>
        <p style={{ 
          color: '#4a4a4a', 
          fontSize: 'clamp(14px, 3vw, 16px)', 
          marginTop: '8px', 
          opacity: 0.8,
          margin: '8px 0 0 0'
        }}>
          Manage and track all invoices
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
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
              transition: 'all 0.3s ease',
              boxShadow: statusFilter === stat.status ? `0 4px 12px ${getStatusColor(stat.status)}40` : '0 2px 4px rgba(0,0,0,0.05)'
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
            {invoices.length}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontWeight: '500' }}>
            All Invoices
          </div>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          display: 'flex', 
          gap: '12px', 
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
            borderRadius: '8px', 
            border: '2px solid #43e97b', 
            fontSize: '14px', 
            background: '#fff', 
            boxShadow: '0 2px 8px rgba(67, 233, 123, 0.1)',
            flex: '1',
            minWidth: '250px',
            fontFamily: 'inherit'
          }}
        />
      </motion.div>

      {/* Invoices Table/Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}
      >
        {filtered.length > 0 ? (
          filtered.map((invoice) => (
            <motion.div
              key={invoice._id}
              variants={cardVariants}
              whileHover={{ transform: 'translateY(-8px)' }}
              onClick={() => setViewing(invoice)}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                border: `2px solid ${getStatusBgColor(invoice.status)}`,
                cursor: 'pointer'
              }}
            >
              {/* Card Header */}
              <div style={{
                background: getStatusBgColor(invoice.status),
                padding: '12px 16px',
                borderBottom: `3px solid ${getStatusColor(invoice.status)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}>
                <h3 style={{
                  margin: 0,
                  color: '#2d7a3e',
                  fontSize: '16px',
                  fontWeight: '700'
                }}>
                  {invoice.invoiceNumber}
                </h3>
                <div style={{
                  background: getStatusColor(invoice.status),
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap'
                }}>
                  {invoice.status}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>
                    Customer
                  </p>
                  <p style={{ margin: 0, color: '#2d7a3e', fontSize: '14px', fontWeight: '700' }}>
                    {invoice.customer?.name || 'N/A'}
                  </p>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>
                    Total Amount
                  </p>
                  <p style={{ margin: 0, color: '#2d7a3e', fontSize: '18px', fontWeight: '800' }}>
                    KSh {(invoice.total || 0).toLocaleString()}
                  </p>
                </div>

                <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div>
                    <p style={{ margin: '0 0 2px 0', color: '#666' }}>Created</p>
                    <p style={{ margin: 0, color: '#333', fontWeight: '600' }}>
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 2px 0', color: '#666' }}>Due</p>
                    <p style={{ margin: 0, color: '#333', fontWeight: '600' }}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginTop: '12px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      viewInvoice(invoice._id);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #2d7a3e 0%, #43a047 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 12px rgba(45, 122, 62, 0.3)'}
                    onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadInvoice(invoice._id, invoice.invoiceNumber);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: '#43e97b',
                      color: '#2d7a3e',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 12px rgba(67, 233, 123, 0.4)'}
                    onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                  >
                    Download
                  </button>
                </div>
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>
              No invoices found
            </p>
            <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
              Create invoices from quotations to see them here
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Viewing Modal */}
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
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
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
              <h2 style={{ margin: 0, color: '#2d7a3e' }}>{viewing.invoiceNumber}</h2>
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
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Customer</p>
                <p style={{ margin: 0, color: '#2d7a3e', fontSize: '16px', fontWeight: '700' }}>
                  {viewing.customer?.name}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>
                  {viewing.customer?.email} | {viewing.customer?.phone}
                </p>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Amount</p>
                <p style={{ margin: 0, color: '#2d7a3e', fontSize: '24px', fontWeight: '800' }}>
                  KSh {(viewing.total || 0).toLocaleString()}
                </p>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Created Date</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '14px', fontWeight: '600' }}>
                    {new Date(viewing.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Due Date</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '14px', fontWeight: '600' }}>
                    {new Date(viewing.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Status</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['paid', 'unpaid', 'overdue'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(viewing._id, status)}
                      style={{
                        padding: '6px 12px',
                        background: viewing.status === status ? getStatusColor(status) : getStatusBgColor(status),
                        color: viewing.status === status ? 'white' : getStatusColor(status),
                        border: `1px solid ${getStatusColor(status)}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textTransform: 'capitalize'
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {viewing.status === 'paid' && viewing.paidAt && (
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee', background: '#e8f5e9', padding: '12px', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#2d7a3e', fontSize: '12px', fontWeight: '600' }}>✓ Payment Received</p>
                  <p style={{ margin: 0, color: '#2d7a3e', fontSize: '14px', fontWeight: '600' }}>
                    {new Date(viewing.paidAt).toLocaleDateString()} at {new Date(viewing.paidAt).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {viewing.notes && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Notes</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '13px', lineHeight: '1.5' }}>
                    {viewing.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginTop: '20px'
              }}>
                <button
                  onClick={() => viewInvoice(viewing._id)}
                  style={{
                    padding: '12px',
                    background: 'linear-gradient(135deg, #2d7a3e 0%, #43a047 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  View Invoice
                </button>
                <button
                  onClick={() => downloadInvoice(viewing._id, viewing.invoiceNumber)}
                  style={{
                    padding: '12px',
                    background: '#43e97b',
                    color: '#2d7a3e',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Download
                </button>
              </div>

              <button
                onClick={() => {
                  handleDelete(viewing._id);
                  setViewing(null);
                }}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '12px',
                  background: '#ffe8e8',
                  color: '#d32f2f',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Delete Invoice
              </button>

              {viewing.status !== 'paid' && (
                <button
                  onClick={() => setPaymentModal(viewing)}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '12px',
                    background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                    color: '#2d7a3e',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  💳 Mark as Paid
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPaymentModal(null)}
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
            zIndex: 1001,
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
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              padding: '20px',
              color: '#2d7a3e',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: '12px 12px 0 0'
            }}>
              <h2 style={{ margin: 0 }}>💳 Process Payment</h2>
              <button
                onClick={() => setPaymentModal(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#2d7a3e'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Invoice</p>
                <p style={{ margin: 0, color: '#2d7a3e', fontSize: '16px', fontWeight: '700' }}>
                  {paymentModal.invoiceNumber}
                </p>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Amount Due</p>
                <p style={{ margin: 0, color: '#2d7a3e', fontSize: '24px', fontWeight: '800' }}>
                  KSh {(paymentModal.total || 0).toLocaleString()}
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Payment Method</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['mpesa', 'bank', 'cash'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        padding: '10px',
                        background: paymentMethod === method ? '#43e97b' : '#f5f5f5',
                        color: paymentMethod === method ? '#2d7a3e' : '#666',
                        border: `2px solid ${paymentMethod === method ? '#43e97b' : '#eee'}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textTransform: 'capitalize'
                      }}
                    >
                      {method === 'mpesa' && '📱'} {method === 'bank' && '🏦'} {method === 'cash' && '💵'} {method}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px', padding: '12px', background: '#e8f5e9', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 4px 0', color: '#2d7a3e', fontSize: '12px', fontWeight: '600' }}>✓ Payment Details</p>
                <p style={{ margin: 0, color: '#2d7a3e', fontSize: '12px' }}>
                  Payment will be recorded as received on {new Date().toLocaleDateString()}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={() => setPaymentModal(null)}
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    color: '#666',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    markAsPaid(paymentModal._id);
                  }}
                  style={{
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
                  ✓ Confirm Payment
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
