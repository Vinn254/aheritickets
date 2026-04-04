// src/pages/finance.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authcontext';
import { Link, useNavigate } from 'react-router-dom';
import API, { API_BASE } from '../utils/api';
import { motion } from 'framer-motion';
import { hasPermission } from '../utils/permissions';

const Finance = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalQuotations: 0,
    totalInvoices: 0,
    totalReceipts: 0,
    pendingAmount: 0,
    paidAmount: 0,
    overdueAmount: 0
  });
  const [recentQuotations, setRecentQuotations] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  
  // Data for modals
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  // Form states
  const [quotationForm, setQuotationForm] = useState({
    customer: '',
    quotationType: 'installation',
    installationType: 'fiber',
    package: '',
    otherServices: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });
  
  const [invoiceForm, setInvoiceForm] = useState({
    quotation: '',
    customer: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  
  const [receiptForm, setReceiptForm] = useState({
    invoice: '',
    amount: '',
    paymentMethod: 'mpesa',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const userRole = user?.role || '';
  const canCreateQuotations = hasPermission(userRole, 'canCreate', 'quotations');
  const canEditQuotations = hasPermission(userRole, 'canEdit', 'quotations');
  const canDeleteQuotations = hasPermission(userRole, 'canDelete', 'quotations');
  const canCreateInvoices = hasPermission(userRole, 'canCreate', 'invoices');
  const canDeleteInvoices = hasPermission(userRole, 'canDelete', 'invoices');
  const canCreateReceipts = hasPermission(userRole, 'canCreate', 'receipts');
  const canDeleteReceipts = hasPermission(userRole, 'canDelete', 'receipts');

  useEffect(() => {
    fetchFinanceData();
    fetchCustomers();
    fetchAllQuotations();
    fetchAllInvoices();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [quotationsRes, invoicesRes, receiptsRes] = await Promise.all([
        fetch(`${API_BASE}/api/quotations`, { headers }),
        fetch(`${API_BASE}/api/invoices`, { headers }),
        fetch(`${API_BASE}/api/receipts`, { headers })
      ]);
      
      const quotations = await quotationsRes.json();
      const invoices = await invoicesRes.json();
      const receipts = await receiptsRes.json();
      
      const pendingInvoices = invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'partial');
      const paidInvoices = invoices.filter(inv => inv.status === 'paid');
      const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
      
      setStats({
        totalQuotations: quotations.length,
        totalInvoices: invoices.length,
        totalReceipts: receipts.length,
        pendingAmount: pendingInvoices.reduce((sum, inv) => sum + (inv.balance || inv.totalAmount), 0),
        paidAmount: paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        overdueAmount: overdueInvoices.reduce((sum, inv) => sum + (inv.balance || inv.totalAmount), 0)
      });
      
      setRecentQuotations(Array.isArray(quotations) ? quotations.slice(0, 5) : []);
      setRecentInvoices(Array.isArray(invoices) ? invoices.slice(0, 5) : []);
      setRecentReceipts(Array.isArray(receipts) ? receipts.slice(0, 5) : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      setLoading(false);
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

  const fetchAllQuotations = async () => {
    try {
      const data = await API.get('/api/quotations');
      setQuotations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    }
  };

  const fetchAllInvoices = async () => {
    try {
      const data = await API.get('/api/invoices');
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  // Quotation handlers
  const handleQuotationSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculate total based on type
      let total = 0;
      if (quotationForm.quotationType === 'installation') {
        if (quotationForm.installationType === 'wireless') total += 4800;
        if (quotationForm.package === '10Mbps') total += 2000;
        else if (quotationForm.package === '15Mbps') total += 2600;
        else if (quotationForm.package === '20Mbps') total += 3900;
        else if (quotationForm.package === '30Mbps') total += 5400;
      }
      
      const dataWithTotal = { ...quotationForm, total };
      await API.post('/api/quotations', dataWithTotal);
      alert('Quotation created successfully!');
      setShowQuotationModal(false);
      setQuotationForm({
        customer: '',
        quotationType: 'installation',
        installationType: 'fiber',
        package: '',
        otherServices: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
      });
      fetchFinanceData();
      fetchAllQuotations();
    } catch (err) {
      console.error('Error creating quotation:', err);
      alert('Failed to create quotation');
    }
  };

  const handleDeleteQuotation = async (id) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await API.delete(`/api/quotations/${id}`);
      fetchFinanceData();
      fetchAllQuotations();
    } catch (err) {
      console.error('Error deleting quotation:', err);
    }
  };

  // Invoice handlers
  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/invoices', {
        quotationId: invoiceForm.quotation,
        customer: invoiceForm.customer,
        dueDate: invoiceForm.dueDate
      });
      alert('Invoice created successfully!');
      setShowInvoiceModal(false);
      setInvoiceForm({
        quotation: '',
        customer: '',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      fetchFinanceData();
      fetchAllInvoices();
    } catch (err) {
      console.error('Error creating invoice:', err);
      alert('Failed to create invoice');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await API.delete(`/api/invoices/${id}`);
      fetchFinanceData();
      fetchAllInvoices();
    } catch (err) {
      console.error('Error deleting invoice:', err);
    }
  };

  // Receipt handlers
  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/receipts', receiptForm);
      alert('Receipt created successfully!');
      setShowReceiptModal(false);
      setReceiptForm({
        invoice: '',
        amount: '',
        paymentMethod: 'mpesa',
        referenceNumber: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchFinanceData();
    } catch (err) {
      console.error('Error creating receipt:', err);
      alert('Failed to create receipt');
    }
  };

  const handleDeleteReceipt = async (id) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;
    try {
      await API.delete(`/api/receipts/${id}`);
      fetchFinanceData();
    } catch (err) {
      console.error('Error deleting receipt:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KES', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      paid: '#4caf50',
      unpaid: '#f44336',
      partial: '#ff9800',
      overdue: '#d32f2f'
    };
    return colors[status] || '#999';
  };

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

  const getCustomerName = (item) => {
    return item.customer?.name || item.customerName || 'N/A';
  };

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading Finance Dashboard...</div>;
  }

  return (
    <div style={{ 
      padding: 24, 
      background: 'linear-gradient(135deg, #e8f5e9 0%, #f7fff7 100%)', 
      minHeight: '100vh',
      marginTop: '56px'
    }}>
      <div className="finance-header" style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#1b5e20', margin: 0 }}>Finance Dashboard</h1>
        <p style={{ color: '#4a4a4a', marginTop: 8 }}>Welcome back, {user?.name}</p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="finance-nav" style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 24,
        flexWrap: 'wrap',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: 12
      }}>
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'dashboard' ? '#2d7a3e' : '#fff',
            color: activeTab === 'dashboard' ? '#fff' : '#2d7a3e',
            border: '2px solid #2d7a3e',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          Dashboard
        </button>
        <button 
          className={`nav-btn ${activeTab === 'quotations' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotations')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'quotations' ? '#2d7a3e' : '#fff',
            color: activeTab === 'quotations' ? '#fff' : '#2d7a3e',
            border: '2px solid #2d7a3e',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          Quotations ({stats.totalQuotations})
        </button>
        <button 
          className={`nav-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'invoices' ? '#2d7a3e' : '#fff',
            color: activeTab === 'invoices' ? '#fff' : '#2d7a3e',
            border: '2px solid #2d7a3e',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          Invoices ({stats.totalInvoices})
        </button>
        <button 
          className={`nav-btn ${activeTab === 'receipts' ? 'active' : ''}`}
          onClick={() => setActiveTab('receipts')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'receipts' ? '#2d7a3e' : '#fff',
            color: activeTab === 'receipts' ? '#fff' : '#2d7a3e',
            border: '2px solid #2d7a3e',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          Receipts ({stats.totalReceipts})
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
          {/* Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 24
          }}>
            <div style={{ 
              background: '#fff', 
              padding: 20, 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '2px solid #e8f5e9'
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#2d7a3e' }}>{stats.totalQuotations}</div>
              <div style={{ color: '#666', fontSize: 14 }}>Total Quotations</div>
            </div>
            <div style={{ 
              background: '#fff', 
              padding: 20, 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '2px solid #e3f2fd'
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1565c0' }}>{stats.totalInvoices}</div>
              <div style={{ color: '#666', fontSize: 14 }}>Total Invoices</div>
            </div>
            <div style={{ 
              background: '#fff', 
              padding: 20, 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '2px solid #fff3e0'
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ff9800' }}>{formatCurrency(stats.pendingAmount)}</div>
              <div style={{ color: '#666', fontSize: 14 }}>Pending Amount</div>
            </div>
            <div style={{ 
              background: '#fff', 
              padding: 20, 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '2px solid #e8f5e9'
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#4caf50' }}>{formatCurrency(stats.paidAmount)}</div>
              <div style={{ color: '#666', fontSize: 14 }}>Paid Amount</div>
            </div>
            <div style={{ 
              background: '#fff', 
              padding: 20, 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '2px solid #ffebee'
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#d32f2f' }}>{formatCurrency(stats.overdueAmount)}</div>
              <div style={{ color: '#666', fontSize: 14 }}>Overdue Amount</div>
            </div>
            <div style={{ 
              background: '#fff', 
              padding: 20, 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '2px solid #e8f5e9'
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#2d7a3e' }}>{stats.totalReceipts}</div>
              <div style={{ color: '#666', fontSize: 14 }}>Total Receipts</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ 
            background: '#fff', 
            padding: 20, 
            borderRadius: 12, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: 24
          }}>
            <h3 style={{ color: '#1b5e20', marginTop: 0, marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {canCreateQuotations && (
                <button 
                  onClick={() => { setActiveTab('quotations'); setShowQuotationModal(true); }}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #2d7a3e 0%, #43a047 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    Create Quotation
                  </button>
              )}
              {canCreateInvoices && (
                <button 
                  onClick={() => { setActiveTab('invoices'); setShowInvoiceModal(true); }}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  Create Invoice
                </button>
              )}
              {canCreateReceipts && (
                <button 
                  onClick={() => { setActiveTab('receipts'); setShowReceiptModal(true); }}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  Record Payment
                </button>
              )}
              <button 
                onClick={() => navigate('/quotations')}
                style={{
                  padding: '12px 24px',
                  background: '#fff',
                  color: '#2d7a3e',
                  border: '2px solid #2d7a3e',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                View Quotations
              </button>
              <button 
                onClick={() => navigate('/invoices')}
                style={{
                  padding: '12px 24px',
                  background: '#fff',
                  color: '#1565c0',
                  border: '2px solid #1565c0',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                View Invoices
              </button>
            </div>
          </div>

          {/* Recent Items */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
            {/* Recent Quotations */}
            <div style={{ 
              background: '#fff', 
              padding: 20, 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ color: '#1b5e20', marginTop: 0 }}>Recent Quotations</h3>
              {recentQuotations.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>No quotations yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>Number</th>
                      <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>Customer</th>
                      <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQuotations.map(q => (
                      <tr key={q._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: 8, fontSize: 12, color: '#2d7a3e' }}>{q.quotationNumber}</td>
                        <td style={{ padding: 8, fontSize: 12 }}>{getCustomerName(q)}</td>
                        <td style={{ padding: 8, fontSize: 12, fontWeight: 600 }}>{formatCurrency(q.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recent Invoices */}
            <div style={{ 
              background: '#fff', 
              padding: 20, 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ color: '#1565c0', marginTop: 0 }}>Recent Invoices</h3>
              {recentInvoices.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>No invoices yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>Number</th>
                      <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>Customer</th>
                      <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>Amount</th>
                      <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map(inv => (
                      <tr key={inv._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: 8, fontSize: 12, color: '#1565c0' }}>{inv.invoiceNumber}</td>
                        <td style={{ padding: 8, fontSize: 12 }}>{getCustomerName(inv)}</td>
                        <td style={{ padding: 8, fontSize: 12, fontWeight: 600 }}>{formatCurrency(inv.total)}</td>
                        <td style={{ padding: 8, fontSize: 12 }}>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: 4, 
                            fontSize: 10,
                            fontWeight: 600,
                            background: getStatusColor(inv.status) + '20',
                            color: getStatusColor(inv.status)
                          }}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recent Receipts */}
            <div style={{ 
              background: '#fff', 
              padding: 20, 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ color: '#ff9800', marginTop: 0 }}>Recent Receipts</h3>
              {recentReceipts.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>No receipts yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>Number</th>
                      <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>Invoice</th>
                      <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReceipts.map(r => (
                      <tr key={r._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: 8, fontSize: 12, color: '#ff9800' }}>{r.receiptNumber}</td>
                        <td style={{ padding: 8, fontSize: 12 }}>{r.invoice?.invoiceNumber || 'N/A'}</td>
                        <td style={{ padding: 8, fontSize: 12, fontWeight: 600 }}>{formatCurrency(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quotations Tab */}
      {activeTab === 'quotations' && (
        <div style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 12, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12
          }}>
            <h2 style={{ color: '#1b5e20', margin: 0 }}>Quotations Management</h2>
            {canCreateQuotations && (
              <button 
                onClick={() => setShowQuotationModal(true)}
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
                Create Quotation
              </button>
            )}
          </div>
          <p style={{ color: '#666', marginBottom: 20 }}>
            Manage all quotations including installation, support, transport, accessories and tools.
          </p>

          <div style={{ overflowX: 'auto' }}>
            {quotations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                No quotations found. Create your first quotation.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Number</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Type</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Customer</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Total</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q, index) => (
                    <tr key={q._id} style={{ 
                      borderBottom: '1px solid #e0e0e0',
                      background: index % 2 === 0 ? '#f8fff8' : '#fff'
                    }}>
                      <td style={{ padding: 15, fontWeight: 600, color: '#2d7a3e' }}>{q.quotationNumber}</td>
                      <td style={{ padding: 15, color: '#666' }}>{getQuotationTypeLabel(q.quotationType)}</td>
                      <td style={{ padding: 15, color: '#333' }}>{getCustomerName(q)}</td>
                      <td style={{ padding: 15, fontWeight: 700, color: '#2d7a3e' }}>{formatCurrency(q.total)}</td>
                      <td style={{ padding: 15, color: '#666' }}>{formatDate(q.createdAt)}</td>
                      <td style={{ padding: 15 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            onClick={() => setViewingItem({ type: 'quotation', data: q })}
                            style={{
                              padding: '6px 12px',
                              background: '#1565c0',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                          >
                            View
                          </button>
                          {canDeleteQuotations && (
                            <button 
                              onClick={() => handleDeleteQuotation(q._id)}
                              style={{
                                padding: '6px 12px',
                                background: '#d32f2f',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12
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
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 12, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12
          }}>
            <h2 style={{ color: '#1565c0', margin: 0 }}>Invoices Management</h2>
            {canCreateInvoices && (
              <button 
                onClick={() => setShowInvoiceModal(true)}
                style={{
                  padding: '12px 24px',
                  background: '#1565c0',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Create Invoice
              </button>
            )}
          </div>
          <p style={{ color: '#666', marginBottom: 20 }}>
            Manage all invoices. Convert quotations to invoices with a single click.
          </p>

          <div style={{ overflowX: 'auto' }}>
            {invoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                No invoices found. Create invoices from quotations.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)', color: 'white' }}>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Number</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Customer</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Amount</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Due Date</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, index) => (
                    <tr key={inv._id} style={{ 
                      borderBottom: '1px solid #e0e0e0',
                      background: index % 2 === 0 ? '#f8f8ff' : '#fff'
                    }}>
                      <td style={{ padding: 15, fontWeight: 600, color: '#1565c0' }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: 15, color: '#333' }}>{getCustomerName(inv)}</td>
                      <td style={{ padding: 15, fontWeight: 700, color: '#1565c0' }}>{formatCurrency(inv.total)}</td>
                      <td style={{ padding: 15, color: '#666' }}>{formatDate(inv.dueDate)}</td>
                      <td style={{ padding: 15 }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: getStatusColor(inv.status) + '20',
                          color: getStatusColor(inv.status)
                        }}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: 15 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            onClick={() => setViewingItem({ type: 'invoice', data: inv })}
                            style={{
                              padding: '6px 12px',
                              background: '#1565c0',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                          >
                            View
                          </button>
                          {canDeleteInvoices && (
                            <button 
                              onClick={() => handleDeleteInvoice(inv._id)}
                              style={{
                                padding: '6px 12px',
                                background: '#d32f2f',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12
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
        </div>
      )}

      {/* Receipts Tab */}
      {activeTab === 'receipts' && (
        <div style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 12, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12
          }}>
            <h2 style={{ color: '#ff9800', margin: 0 }}>Receipts Management</h2>
            {canCreateReceipts && (
              <button 
                onClick={() => setShowReceiptModal(true)}
                style={{
                  padding: '12px 24px',
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Record Payment
              </button>
            )}
          </div>
          <p style={{ color: '#666', marginBottom: 20 }}>
            Manage all receipts. Convert invoices to receipts when payments are received.
          </p>

          <div style={{ overflowX: 'auto' }}>
            {recentReceipts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                No receipts found. Record payments from invoices.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white' }}>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Number</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Invoice</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Customer</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Amount</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Method</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReceipts.map((r, index) => (
                    <tr key={r._id} style={{ 
                      borderBottom: '1px solid #e0e0e0',
                      background: index % 2 === 0 ? '#fffbf0' : '#fff'
                    }}>
                      <td style={{ padding: 15, fontWeight: 600, color: '#ff9800' }}>{r.receiptNumber || 'N/A'}</td>
                      <td style={{ padding: 15, color: '#666' }}>{r.invoice?.invoiceNumber || 'N/A'}</td>
                      <td style={{ padding: 15, color: '#333' }}>{r.customer?.name || r.invoice?.customer?.name || 'N/A'}</td>
                      <td style={{ padding: 15, fontWeight: 700, color: '#ff9800' }}>{formatCurrency(r.amount)}</td>
                      <td style={{ padding: 15, color: '#666' }}>{r.paymentMethod?.toUpperCase()}</td>
                      <td style={{ padding: 15, color: '#666' }}>{formatDate(r.paymentDate)}</td>
                      <td style={{ padding: 15 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            onClick={() => setViewingItem({ type: 'receipt', data: r })}
                            style={{
                              padding: '6px 12px',
                              background: '#1565c0',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                          >
                            View
                          </button>
                          {canDeleteReceipts && (
                            <button 
                              onClick={() => handleDeleteReceipt(r._id)}
                              style={{
                                padding: '6px 12px',
                                background: '#d32f2f',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12
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
        </div>
      )}

      {/* Create Quotation Modal */}
      {showQuotationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowQuotationModal(false)}
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
              borderRadius: 12,
              maxWidth: 500,
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ color: '#1b5e20', marginTop: 0, marginBottom: 20 }}>Create New Quotation</h3>
            <form onSubmit={handleQuotationSubmit}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Customer *</label>
                <select
                  value={quotationForm.customer}
                  onChange={(e) => setQuotationForm({ ...quotationForm, customer: e.target.value })}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Quotation Type *</label>
                <select
                  value={quotationForm.quotationType}
                  onChange={(e) => setQuotationForm({ ...quotationForm, quotationType: e.target.value })}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
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

              {quotationForm.quotationType === 'installation' && (
                <>
                  <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Installation Type</label>
                    <select
                      value={quotationForm.installationType}
                      onChange={(e) => setQuotationForm({ ...quotationForm, installationType: e.target.value })}
                      style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                    >
                      <option value="fiber">Fiber</option>
                      <option value="wireless">Wireless</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Package</label>
                    <select
                      value={quotationForm.package}
                      onChange={(e) => setQuotationForm({ ...quotationForm, package: e.target.value })}
                      style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                    >
                      <option value="">Select Package</option>
                      <option value="10Mbps">10 Mbps</option>
                      <option value="15Mbps">15 Mbps</option>
                      <option value="20Mbps">20 Mbps</option>
                      <option value="30Mbps">30 Mbps</option>
                    </select>
                  </div>
                </>
              )}

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Start Date</label>
                <input
                  type="date"
                  value={quotationForm.startDate}
                  onChange={(e) => setQuotationForm({ ...quotationForm, startDate: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>End Date</label>
                <input
                  type="date"
                  value={quotationForm.endDate}
                  onChange={(e) => setQuotationForm({ ...quotationForm, endDate: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Notes</label>
                <textarea
                  value={quotationForm.notes}
                  onChange={(e) => setQuotationForm({ ...quotationForm, notes: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', minHeight: 60 }}
                  placeholder="Additional notes"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowQuotationModal(false)}
                  style={{ padding: '10px 20px', background: '#666', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                >
                  Create Quotation
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowInvoiceModal(false)}
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
              borderRadius: 12,
              maxWidth: 500,
              width: '90%'
            }}
          >
            <h3 style={{ color: '#1565c0', marginTop: 0, marginBottom: 20 }}>Create New Invoice</h3>
            <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
              Convert a quotation to an invoice or create a standalone invoice.
            </p>
            <form onSubmit={handleInvoiceSubmit}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Customer *</label>
                <select
                  value={invoiceForm.customer}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customer: e.target.value })}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Quotation (Optional)</label>
                <select
                  value={invoiceForm.quotation}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, quotation: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                >
                  <option value="">No quotation - create standalone</option>
                  {quotations.filter(q => !q.convertedToInvoice).map(q => (
                    <option key={q._id} value={q._id}>
                      {q.quotationNumber} - {q.customer?.name} (KSh {q.total?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Due Date *</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  style={{ padding: '10px 20px', background: '#666', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#1565c0', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Create Receipt Modal */}
      {showReceiptModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowReceiptModal(false)}
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
              borderRadius: 12,
              maxWidth: 500,
              width: '90%'
            }}
          >
            <h3 style={{ color: '#ff9800', marginTop: 0, marginBottom: 20 }}>Record Payment</h3>
            <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
              Create a receipt from an invoice payment.
            </p>
            <form onSubmit={handleReceiptSubmit}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Invoice *</label>
                <select
                  value={receiptForm.invoice}
                  onChange={(e) => {
                    const inv = invoices.find(i => i._id === e.target.value);
                    setReceiptForm({ 
                      ...receiptForm, 
                      invoice: e.target.value,
                      amount: inv ? inv.total.toString() : ''
                    });
                  }}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                >
                  <option value="">Select Invoice</option>
                  {invoices.filter(inv => inv.status !== 'paid').map(inv => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} - {inv.customer?.name} (KSh {inv.total?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Amount *</label>
                <input
                  type="number"
                  value={receiptForm.amount}
                  onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                  placeholder="Enter amount received"
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Payment Method *</label>
                <select
                  value={receiptForm.paymentMethod}
                  onChange={(e) => setReceiptForm({ ...receiptForm, paymentMethod: e.target.value })}
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
                  value={receiptForm.referenceNumber}
                  onChange={(e) => setReceiptForm({ ...receiptForm, referenceNumber: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                  placeholder="e.g., M-Pesa code"
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Payment Date</label>
                <input
                  type="date"
                  value={receiptForm.paymentDate}
                  onChange={(e) => setReceiptForm({ ...receiptForm, paymentDate: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Notes</label>
                <textarea
                  value={receiptForm.notes}
                  onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', minHeight: 60 }}
                  placeholder="Any additional notes"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  style={{ padding: '10px 20px', background: '#666', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#ff9800', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                >
                  Record Payment
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* View Item Modal */}
      {viewingItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setViewingItem(null)}
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
              borderRadius: 12,
              maxWidth: 500,
              width: '90%'
            }}
          >
            <h3 style={{ color: '#1b5e20', marginTop: 0, marginBottom: 20 }}>
              {viewingItem.type === 'quotation' && 'Quotation Details'}
              {viewingItem.type === 'invoice' && 'Invoice Details'}
              {viewingItem.type === 'receipt' && 'Receipt Details'}
            </h3>
            
            <div style={{ textAlign: 'left' }}>
              {viewingItem.type === 'quotation' && (
                <>
                  <p style={{ marginBottom: 10 }}><strong>Number:</strong> {viewingItem.data.quotationNumber}</p>
                  <p style={{ marginBottom: 10 }}><strong>Type:</strong> {getQuotationTypeLabel(viewingItem.data.quotationType)}</p>
                  <p style={{ marginBottom: 10 }}><strong>Customer:</strong> {getCustomerName(viewingItem.data)}</p>
                  <p style={{ marginBottom: 10 }}><strong>Total:</strong> {formatCurrency(viewingItem.data.total)}</p>
                  <p style={{ marginBottom: 10 }}><strong>Start Date:</strong> {formatDate(viewingItem.data.startDate)}</p>
                  <p style={{ marginBottom: 10 }}><strong>End Date:</strong> {formatDate(viewingItem.data.endDate)}</p>
                  {viewingItem.data.notes && <p style={{ marginBottom: 10 }}><strong>Notes:</strong> {viewingItem.data.notes}</p>}
                </>
              )}
              
              {viewingItem.type === 'invoice' && (
                <>
                  <p style={{ marginBottom: 10 }}><strong>Number:</strong> {viewingItem.data.invoiceNumber}</p>
                  <p style={{ marginBottom: 10 }}><strong>Customer:</strong> {getCustomerName(viewingItem.data)}</p>
                  <p style={{ marginBottom: 10 }}><strong>Total:</strong> {formatCurrency(viewingItem.data.total)}</p>
                  <p style={{ marginBottom: 10 }}><strong>Due Date:</strong> {formatDate(viewingItem.data.dueDate)}</p>
                  <p style={{ marginBottom: 10 }}>
                    <strong>Status:</strong> 
                    <span style={{ 
                      marginLeft: 8,
                      padding: '2px 8px', 
                      borderRadius: 4, 
                      fontSize: 12,
                      fontWeight: 600,
                      background: getStatusColor(viewingItem.data.status) + '20',
                      color: getStatusColor(viewingItem.data.status)
                    }}>
                      {viewingItem.data.status}
                    </span>
                  </p>
                </>
              )}
              
              {viewingItem.type === 'receipt' && (
                <>
                  <p style={{ marginBottom: 10 }}><strong>Number:</strong> {viewingItem.data.receiptNumber || 'N/A'}</p>
                  <p style={{ marginBottom: 10 }}><strong>Invoice:</strong> {viewingItem.data.invoice?.invoiceNumber || 'N/A'}</p>
                  <p style={{ marginBottom: 10 }}><strong>Amount:</strong> {formatCurrency(viewingItem.data.amount)}</p>
                  <p style={{ marginBottom: 10 }}><strong>Payment Method:</strong> {viewingItem.data.paymentMethod?.toUpperCase()}</p>
                  <p style={{ marginBottom: 10 }}><strong>Reference:</strong> {viewingItem.data.referenceNumber || '-'}</p>
                  <p style={{ marginBottom: 10 }}><strong>Date:</strong> {formatDate(viewingItem.data.paymentDate)}</p>
                </>
              )}
            </div>
            
            <button
              onClick={() => setViewingItem(null)}
              style={{ 
                marginTop: 20, 
                padding: '10px 20px', 
                background: '#666', 
                color: 'white', 
                border: 'none', 
                borderRadius: 6, 
                cursor: 'pointer', 
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
};

export default Finance;