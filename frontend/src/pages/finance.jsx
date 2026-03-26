import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authcontext';
import { Link } from 'react-router-dom';
import './finance.css';

const Finance = () => {
  const { user } = useContext(AuthContext);
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

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [quotationsRes, invoicesRes, receiptsRes] = await Promise.all([
        fetch('/api/quotations', { headers }),
        fetch('/api/invoices', { headers }),
        fetch('/api/receipts', { headers })
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
      
      setRecentQuotations(quotations.slice(0, 5));
      setRecentInvoices(invoices.slice(0, 5));
      setRecentReceipts(receipts.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      setLoading(false);
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
      pending: 'orange',
      paid: 'green',
      unpaid: 'red',
      partial: 'yellow',
      overdue: 'darkred'
    };
    return colors[status] || 'gray';
  };

  if (loading) {
    return <div className="loading">Loading Finance Dashboard...</div>;
  }

  return (
    <div className="finance-page">
      <div className="finance-header">
        <h1>Finance Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>
      
      <div className="finance-nav">
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-btn ${activeTab === 'quotations' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotations')}
        >
          Quotations
        </button>
        <button 
          className={`nav-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices
        </button>
        <button 
          className={`nav-btn ${activeTab === 'receipts' ? 'active' : ''}`}
          onClick={() => setActiveTab('receipts')}
        >
          Receipts
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-info">
                <h3>Total Quotations</h3>
                <p className="stat-value">{stats.totalQuotations}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <h3>Total Invoices</h3>
                <p className="stat-value">{stats.totalInvoices}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Total Receipts</h3>
                <p className="stat-value">{stats.totalReceipts}</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>Pending Amount</h3>
                <p className="stat-value">{formatCurrency(stats.pendingAmount)}</p>
              </div>
            </div>
            <div className="stat-card paid">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Paid Amount</h3>
                <p className="stat-value">{formatCurrency(stats.paidAmount)}</p>
              </div>
            </div>
            <div className="stat-card overdue">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h3>Overdue Amount</h3>
                <p className="stat-value">{formatCurrency(stats.overdueAmount)}</p>
              </div>
            </div>
          </div>

          <div className="quick-links">
            <h2>Quick Actions</h2>
            <div className="links-grid">
              <Link to="/quotations" className="quick-link">
                <span className="link-icon">➕</span>
                <span>New Quotation</span>
              </Link>
              <Link to="/invoices" className="quick-link">
                <span className="link-icon">📝</span>
                <span>New Invoice</span>
              </Link>
              <Link to="/receipts" className="quick-link">
                <span className="link-icon">💵</span>
                <span>Record Payment</span>
              </Link>
            </div>
          </div>

          <div className="recent-items">
            <div className="recent-section">
              <h3>Recent Quotations</h3>
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Quote #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuotations.map(q => (
                    <tr key={q._id}>
                      <td>{q.quoteNumber}</td>
                      <td>{q.customerName}</td>
                      <td>{formatCurrency(q.totalAmount)}</td>
                      <td>{formatDate(q.createdAt)}</td>
                      <td>
                        <span className={`status ${q.status}`}>{q.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="recent-section">
              <h3>Recent Invoices</h3>
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map(inv => (
                    <tr key={inv._id}>
                      <td>{inv.invoiceNumber}</td>
                      <td>{inv.customerName}</td>
                      <td>{formatCurrency(inv.totalAmount)}</td>
                      <td>{formatDate(inv.createdAt)}</td>
                      <td>
                        <span className={`status ${inv.status}`} style={{color: getStatusColor(inv.status)}}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="recent-section">
              <h3>Recent Receipts</h3>
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Invoice #</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReceipts.map(r => (
                    <tr key={r._id}>
                      <td>{r.receiptNumber}</td>
                      <td>{r.invoiceNumber}</td>
                      <td>{formatCurrency(r.amount)}</td>
                      <td>{formatDate(r.paymentDate)}</td>
                      <td>{r.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quotations' && (
        <div className="tab-content">
          <div className="tab-header">
            <h2>Quotations Management</h2>
            <Link to="/quotations" className="btn-primary">View All Quotations</Link>
          </div>
          <p>Manage all quotations including installation, support, transport, and other company operations.</p>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="tab-content">
          <div className="tab-header">
            <h2>Invoices Management</h2>
            <Link to="/invoices" className="btn-primary">View All Invoices</Link>
          </div>
          <p>Manage all invoices and convert quotations to invoices.</p>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="tab-content">
          <div className="tab-header">
            <h2>Receipts Management</h2>
            <Link to="/receipts" className="btn-primary">View All Receipts</Link>
          </div>
          <p>Manage all receipts and convert invoices to receipts.</p>
        </div>
      )}
    </div>
  );
};

export default Finance;