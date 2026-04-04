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
  const [editing, setEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [linkedInvoice, setLinkedInvoice] = useState(null);

  const userRole = user?.role || '';
  const canCreateReceipts = hasPermission(userRole, 'canCreate', 'receipts');
  const canEditReceipts = hasPermission(userRole, 'canEdit', 'receipts');
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
      const data = await API.get('/api/invoices');
      // Show all invoices - paid ones will show their receipts
      setInvoices(data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/api/receipts/${editing._id}`, formData);
        alert('Receipt updated successfully!');
      } else {
        await API.post('/api/receipts', formData);
        alert('Receipt created successfully!');
        
        // Update invoice status if fully paid
        const inv = invoices.find(i => i._id === formData.invoice);
        if (inv && parseFloat(formData.amount) >= inv.total) {
          await API.put(`/api/invoices/${formData.invoice}`, { status: 'paid' });
          fetchInvoices();
        }
      }
      setShowForm(false);
      setEditing(null);
      setLinkedInvoice(null);
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
      console.error('Error saving receipt:', err);
      alert('Failed to save receipt: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEdit = (receipt) => {
    setEditing(receipt);
    setLinkedInvoice(receipt.invoice);
    setFormData({
      invoice: receipt.invoice?._id || '',
      customer: receipt.customer?._id || '',
      amount: receipt.amount?.toString() || '',
      paymentMethod: receipt.paymentMethod || 'mpesa',
      referenceNumber: receipt.referenceNumber || '',
      paymentDate: receipt.paymentDate ? new Date(receipt.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: receipt.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this receipt? This action cannot be undone.')) return;
    try {
      await API.delete(`/api/receipts/${id}`);
      alert('Receipt deleted successfully');
      fetchReceipts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete receipt');
    }
  };

  const selectInvoiceForReceipt = (invoice) => {
    setLinkedInvoice(invoice);
    setFormData({
      invoice: invoice._id,
      customer: invoice.customer?._id || '',
      amount: invoice.total?.toString() || '',
      paymentMethod: 'mpesa',
      referenceNumber: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: `Payment for invoice ${invoice.invoiceNumber}`
    });
    setShowForm(true);
  };

  const markInvoiceAsPaid = async (invoice) => {
    if (!confirm(`Mark invoice ${invoice.invoiceNumber} as paid?\n\nThis will automatically create a receipt for the full amount (KSh ${invoice.total?.toLocaleString()}).`)) {
      return;
    }
    
    try {
      // Update invoice status to paid
      await API.put(`/api/invoices/${invoice._id}`, { status: 'paid' });
      
      // Create receipt automatically
      const receipt = await API.post('/api/receipts', {
        invoice: invoice._id,
        customer: invoice.customer?._id,
        amount: invoice.total,
        paymentMethod: 'mpesa',
        referenceNumber: 'AUTO-PAID',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: `Auto-created when invoice marked as paid`
      });
      
      alert(`Invoice marked as paid and receipt ${receipt.receiptNumber} created successfully!`);
      fetchInvoices();
      fetchReceipts();
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
      alert('Failed to mark invoice as paid');
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

  const getReceiptForInvoice = (invoiceId) => {
    return receipts.find(r => r.invoice?._id === invoiceId);
  };

  const filteredReceipts = receipts.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.paymentMethod === filterStatus;
    const matchesSearch = searchTerm === '' || 
      getInvoiceNumber(r).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerName(r).toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');
  const paidInvoicesWithReceipts = invoices.filter(inv => inv.status === 'paid' && getReceiptForInvoice(inv._id));

  const getPaymentMethodLabel = (method) => {
    const labels = {
      mpesa: 'M-Pesa',
      bank: 'Bank Transfer',
      cash: 'Cash'
    };
    return labels[method?.toLowerCase()] || method?.toUpperCase() || 'N/A';
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading receipts...</div>;

  return (
    <div style={{ 
      padding: 32, 
      background: 'linear-gradient(135deg, #fff3e0 0%, #fffbf0 100%)', 
      minHeight: '100vh', 
      marginTop: '56px',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ color: '#e65100', margin: 0, fontSize: 28, fontWeight: 800 }}>Receipts Management</h1>
          <p style={{ color: '#666', marginTop: 8 }}>All receipts linked to paid invoices</p>
        </div>
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
          padding: 20, 
          borderRadius: 12, 
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#ff9800' }}>{receipts.length}</div>
          <div style={{ fontSize: 14, color: '#666' }}>Total Receipts</div>
        </div>
        <div style={{ 
          background: '#fff', 
          padding: 20, 
          borderRadius: 12, 
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#2e7d32' }}>
            KSh {(receipts.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)).toLocaleString()}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Total Collected</div>
        </div>
        <div style={{ 
          background: '#fff', 
          padding: 20, 
          borderRadius: 12, 
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#1565c0' }}>
            {paidInvoicesWithReceipts.length}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Paid Invoices</div>
        </div>
        <div style={{ 
          background: '#fff', 
          padding: 20, 
          borderRadius: 12, 
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#9c27b0' }}>
            {unpaidInvoices.length}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Unpaid Invoices</div>
        </div>
      </div>

      {/* Unpaid Invoices - Create Receipt */}
      {unpaidInvoices.length > 0 && (
        <div style={{
          background: '#fff',
          padding: 20,
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '2px solid #ff9800'
        }}>
          <h3 style={{ color: '#e65100', marginTop: 0, marginBottom: 16 }}>
            Unpaid Invoices - Create Receipt
          </h3>
          <p style={{ color: '#666', marginBottom: 16, fontSize: 14 }}>
            Select an invoice to record payment and generate a receipt
          </p>
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            flexWrap: 'wrap',
            overflowX: 'auto',
            paddingBottom: 8
          }}>
            {unpaidInvoices.slice(0, 6).map(inv => (
              <div key={inv._id} style={{
                padding: 16,
                background: '#fff3e0',
                borderRadius: 8,
                border: '1px solid #ffcc80',
                minWidth: 220,
                flex: 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#e65100', fontSize: 14 }}>{inv.invoiceNumber}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 600,
                    background: '#ffebee',
                    color: '#d32f2f'
                  }}>
                    {inv.status?.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{inv.customer?.name}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#e65100', marginTop: 8 }}>
                  KSh {(inv.total || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</div>
                <button
                  onClick={() => selectInvoiceForReceipt(inv)}
                  style={{
                    marginTop: 12,
                    padding: '8px 16px',
                    background: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    width: '100%'
                  }}
                >
                  Record Payment
                </button>
                <button
                  onClick={() => markInvoiceAsPaid(inv)}
                  style={{
                    marginTop: 8,
                    padding: '6px 12px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 600,
                    width: '100%'
                  }}
                >
                  Mark as Paid (Auto-Receipt)
                </button>
              </div>
            ))}
            {unpaidInvoices.length > 6 && (
              <div style={{
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                color: '#666',
                fontSize: 12
              }}>
                +{unpaidInvoices.length - 6} more unpaid invoices
              </div>
            )}
          </div>
        </div>
      )}

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
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search receipts..."
          style={{ 
            padding: '10px 16px', 
            borderRadius: 8, 
            border: '2px solid #e0e0e0', 
            fontSize: 14,
            flex: 1,
            minWidth: 250
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ 
            padding: '10px 16px', 
            borderRadius: 8, 
            border: '2px solid #e0e0e0', 
            fontSize: 14
          }}
        >
          <option value="all">All Methods</option>
          <option value="mpesa">M-Pesa</option>
          <option value="bank">Bank Transfer</option>
          <option value="cash">Cash</option>
        </select>
      </div>

      {/* Receipts Table */}
      <div style={{ overflowX: 'auto' }}>
        {filteredReceipts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>No Receipts</div>
            <p style={{ fontSize: 18, color: '#666', fontWeight: 600 }}>
              No receipts found
            </p>
            <p style={{ fontSize: 14, color: '#999', marginTop: 8 }}>
              Receipts are created when invoices are marked as paid
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
            minWidth: 900
          }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white' }}>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Receipt Number</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Invoice Number</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Customer</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Amount</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Payment Method</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Reference</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Date</th>
                <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt, index) => (
                <tr key={receipt._id} style={{ 
                  borderBottom: '1px solid #e0e0e0',
                  transition: 'background 0.2s',
                  background: index % 2 === 0 ? '#fffbf0' : '#fff'
                }} onMouseOver={(e) => e.target.closest('tr').style.background = '#fff3e0'} onMouseOut={(e) => e.target.closest('tr').style.background = index % 2 === 0 ? '#fffbf0' : '#fff'}>
                  <td style={{ padding: 15, fontWeight: 600, color: '#e65100' }}>{receipt.receiptNumber || 'N/A'}</td>
                  <td style={{ padding: 15 }}>
                    <span style={{ 
                      color: '#1565c0', 
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}>
                      {getInvoiceNumber(receipt)}
                    </span>
                  </td>
                  <td style={{ padding: 15, color: '#333' }}>{getCustomerName(receipt)}</td>
                  <td style={{ padding: 15, fontWeight: 700, color: '#2e7d32', fontSize: 16 }}>KSh {parseFloat(receipt.amount || 0).toLocaleString()}</td>
                  <td style={{ padding: 15 }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: '#e8f5e9',
                      color: '#2e7d32'
                    }}>
                      {getPaymentMethodLabel(receipt.paymentMethod)}
                    </span>
                  </td>
                  <td style={{ padding: 15, color: '#666', fontFamily: 'monospace', fontSize: 12 }}>{receipt.referenceNumber || '-'}</td>
                  <td style={{ padding: 15, color: '#666' }}>{receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ padding: 15 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => setViewing(receipt)}
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
                        View
                      </button>
                      {canDeleteReceipts && (
                        <button 
                          onClick={() => handleDelete(receipt._id)}
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
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Receipt Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { setShowForm(false); setLinkedInvoice(null); }}
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
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            style={{
              background: 'white',
              padding: 30,
              borderRadius: 16,
              maxWidth: 500,
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#e65100', marginTop: 0, marginBottom: 20 }}>
              {editing ? 'Edit Receipt' : 'Create Receipt'}
            </h3>
            
            {linkedInvoice && (
              <div style={{
                padding: 12,
                background: '#e8f5e9',
                borderRadius: 8,
                marginBottom: 16,
                border: '1px solid #a5d6a7'
              }}>
                <div style={{ fontSize: 12, color: '#2e7d32', marginBottom: 4 }}>Linked Invoice:</div>
                <div style={{ fontWeight: 600, color: '#1565c0' }}>{linkedInvoice.invoiceNumber}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{linkedInvoice.customer?.name}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#2e7d32', marginTop: 8 }}>
                  KSh {(linkedInvoice.total || 0).toLocaleString()}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                  placeholder="Enter amount received"
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
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
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                  placeholder="e.g., M-Pesa code, Transaction ID"
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Payment Date</label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e0e0e0', minHeight: 80 }}
                  placeholder="Any additional notes"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setLinkedInvoice(null); }}
                  style={{ padding: '10px 20px', background: '#666', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#ff9800', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                >
                  {editing ? 'Update Receipt' : 'Create Receipt'}
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
          onClick={() => setViewing(null)}
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
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            style={{
              background: 'white',
              padding: 30,
              borderRadius: 16,
              maxWidth: 500,
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#e65100', marginTop: 0, marginBottom: 20 }}>Receipt Details</h3>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
                <tbody>
                  <tr style={{ background: '#f5f5f5' }}>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#e65100' }}>Receipt Number:</td>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#333', fontWeight: 600 }}>{viewing.receiptNumber || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#e65100', background: '#f5f5f5' }}>Invoice:</td>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#1565c0', fontWeight: 500 }}>{getInvoiceNumber(viewing)}</td>
                  </tr>
                  <tr style={{ background: '#f5f5f5' }}>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#e65100' }}>Customer:</td>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#333' }}>{getCustomerName(viewing)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#e65100', background: '#f5f5f5' }}>Payment Method:</td>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0' }}>{getPaymentMethodLabel(viewing.paymentMethod)}</td>
                  </tr>
                  <tr style={{ background: '#f5f5f5' }}>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#e65100' }}>Reference:</td>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#333', fontFamily: 'monospace' }}>{viewing.referenceNumber || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#e65100', background: '#f5f5f5' }}>Date:</td>
                    <td style={{ padding: 10, border: '1px solid #e0e0e0', color: '#333' }}>{viewing.paymentDate ? new Date(viewing.paymentDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ 
                padding: 20, 
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                borderRadius: 12,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>Amount Received</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>
                  KSh {parseFloat(viewing.amount || 0).toLocaleString()}
                </div>
              </div>

              {viewing.notes && (
                <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                  <strong style={{ color: '#e65100' }}>Notes:</strong>
                  <p style={{ margin: '8px 0 0 0', color: '#666' }}>{viewing.notes}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setViewing(null)}
              style={{ 
                marginTop: 20, 
                padding: '12px 16px', 
                background: '#666', 
                color: 'white', 
                border: 'none', 
                borderRadius: 8, 
                cursor: 'pointer',
                fontWeight: 600,
                width: '100%'
              }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}