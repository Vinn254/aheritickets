// src/pages/receipts.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authcontext';
import API from '../utils/api';
import { motion } from 'framer-motion';
import { hasPermission } from '../utils/permissions';

export default function Receipts() {
  const { user } = useContext(AuthContext);
  const [receipts, setReceipts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const userRole = user?.role || '';
  const canCreateReceipts = hasPermission(userRole, 'canCreate', 'receipts');
  const canDeleteReceipts = hasPermission(userRole, 'canDelete', 'receipts');

  const [formData, setFormData] = useState({
    invoice: '',
    customer: '',
    amount: '',
    paymentMethod: 'mpesa',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchReceipts();
    fetchInvoices();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await API.get('/api/receipts');
      setReceipts(data);
    } catch (err) {
      console.error('Error fetching receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const data = await API.get('/invoices');
      // Only show unpaid or partially paid invoices
      setInvoices(data.filter(inv => inv.status !== 'paid'));
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/receipts', formData);
      alert('Receipt created successfully');
      setShowForm(false);
      setFormData({
        invoice: '',
        customer: '',
        amount: '',
        paymentMethod: 'mpesa',
        referenceNumber: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchReceipts();
    } catch (err) {
      console.error('Error creating receipt:', err);
      alert('Failed to create receipt');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;
    try {
      await API.delete(`/api/receipts/${id}`);
      fetchReceipts();
      alert('Receipt deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete receipt');
    }
  };

  const getCustomerName = (receipt) => {
    if (receipt.customer?.name) return receipt.customer.name;
    if (receipt.invoice?.customer?.name) return receipt.invoice.customer.name;
    return 'N/A';
  };

  const getInvoiceNumber = (receipt) => {
    if (receipt.invoice?.invoiceNumber) return receipt.invoice.invoiceNumber;
    return 'N/A';
  };

  const filteredReceipts = receipts.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.paymentMethod === filterStatus;
    const matchesSearch = searchTerm === '' || 
      getInvoiceNumber(r).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerName(r).toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 32, background: 'linear-gradient(90deg, #e8f5e9 0%, #f7fff7 100%)', minHeight: '100vh', marginTop: '56px' }}>
      <h2 style={{ color: '#1b5e20', marginBottom: 20 }}>💰 Receipts</h2>

      {/* Actions */}
      {canCreateReceipts && (
        <button 
          onClick={() => setShowForm(true)} 
          style={{ 
            padding: '10px 20px', 
            background: '#2d7a3e', 
            color: 'white', 
            border: 'none', 
            borderRadius: 6, 
            cursor: 'pointer', 
            fontWeight: 600 
          }}
        >
          + Create Receipt
        </button>
      )}

      {/* Filters */}
      <div style={{ marginTop: 20, display: 'flex', gap: 15, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search receipts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', width: 250 }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
        >
          <option value="all">All Methods</option>
          <option value="mpesa">M-Pesa</option>
          <option value="bank">Bank Transfer</option>
          <option value="cash">Cash</option>
        </select>
      </div>

      {/* Receipts Table */}
      <div style={{ marginTop: 20, overflowX: 'auto' }}>
        {filteredReceipts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            No receipts found
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#eafff3', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1.5px solid #43e97b' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Receipt #</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Date</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Invoice #</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Customer</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Amount</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Method</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Reference</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt, index) => (
                <tr key={receipt._id} style={{ borderBottom: index === filteredReceipts.length - 1 ? 'none' : '1px solid #d0e8d8', background: index % 2 === 0 ? '#eafff3' : '#f0fdf5' }}>
                  <td style={{ padding: 15, fontWeight: 500, color: '#186a3b' }}>{receipt.receiptNumber || 'N/A'}</td>
                  <td style={{ padding: 15, color: '#2d7a3e' }}>{new Date(receipt.paymentDate).toLocaleDateString()}</td>
                  <td style={{ padding: 15, color: '#2d7a3e' }}>{getInvoiceNumber(receipt)}</td>
                  <td style={{ padding: 15, color: '#2d7a3e' }}>{getCustomerName(receipt)}</td>
                  <td style={{ padding: 15, fontWeight: 700, color: '#2d7a3e' }}>KSh {parseFloat(receipt.amount).toLocaleString()}</td>
                  <td style={{ padding: 15 }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: 4, 
                      background: receipt.paymentMethod === 'mpesa' ? '#e8f5e9' : receipt.paymentMethod === 'bank' ? '#e3f2fd' : '#fff3e0',
                      color: receipt.paymentMethod === 'mpesa' ? '#2e7d32' : receipt.paymentMethod === 'bank' ? '#1565c0' : '#e65100',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {receipt.paymentMethod.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: 15, color: '#666' }}>{receipt.referenceNumber || '-'}</td>
                  <td style={{ padding: 15 }}>
                    <button 
                      onClick={() => setViewing(receipt)}
                      style={{ 
                        padding: '6px 12px', 
                        background: '#2d7a3e', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: 6, 
                        cursor: 'pointer',
                        fontSize: 14 
                      }}
                    >
                      View
                    </button>
                    {canDeleteReceipts && (
                      <button 
                        onClick={() => handleDelete(receipt._id)}
                        style={{ 
                          padding: '6px 12px', 
                          background: '#dc3545', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: 6, 
                          cursor: 'pointer',
                          marginLeft: 8,
                          fontSize: 14 
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Receipt Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            style={{
              background: 'white',
              padding: 30,
              borderRadius: 10,
              maxWidth: 500,
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#1b5e20', marginBottom: 20 }}>Create Receipt</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Invoice *</label>
                <select
                  value={formData.invoice}
                  onChange={(e) => {
                    const inv = invoices.find(i => i._id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      invoice: e.target.value,
                      customer: inv?.customer?._id || ''
                    });
                  }}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                >
                  <option value="">Select Invoice</option>
                  {invoices.map(inv => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} - {inv.customer?.name} (KSh {inv.total.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                  placeholder="Enter amount received"
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Payment Method *</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Reference Number</label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                  placeholder="e.g., M-Pesa code, Transaction ID"
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Payment Date</label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', minHeight: 60 }}
                  placeholder="Any additional notes"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ padding: '10px 20px', background: '#666', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                >
                  Create Receipt
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* View Receipt Modal */}
      {viewing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setViewing(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            style={{
              background: 'white',
              padding: 30,
              borderRadius: 10,
              maxWidth: 400,
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#1b5e20', marginBottom: 20 }}>Receipt Details</h3>
            <div style={{ textAlign: 'left' }}>
              <p style={{ marginBottom: 10 }}><strong>Receipt #:</strong> {viewing.receiptNumber || 'N/A'}</p>
              <p style={{ marginBottom: 10 }}><strong>Date:</strong> {new Date(viewing.paymentDate).toLocaleDateString()}</p>
              <p style={{ marginBottom: 10 }}><strong>Invoice:</strong> {getInvoiceNumber(viewing)}</p>
              <p style={{ marginBottom: 10 }}><strong>Customer:</strong> {getCustomerName(viewing)}</p>
              <p style={{ marginBottom: 10 }}><strong>Amount:</strong> KSh {parseFloat(viewing.amount).toLocaleString()}</p>
              <p style={{ marginBottom: 10 }}><strong>Payment Method:</strong> {viewing.paymentMethod.toUpperCase()}</p>
              <p style={{ marginBottom: 10 }}><strong>Reference:</strong> {viewing.referenceNumber || '-'}</p>
              {viewing.notes && <p style={{ marginBottom: 10 }}><strong>Notes:</strong> {viewing.notes}</p>}
            </div>
            <button
              onClick={() => setViewing(null)}
              style={{ marginTop: 20, padding: '10px 20px', background: '#666', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', width: '100%' }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}