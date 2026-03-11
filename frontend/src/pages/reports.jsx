// src/pages/reports.jsx
import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { motion } from 'framer-motion';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReport();
  }, [activeTab, dateRange.startDate, dateRange.endDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (activeTab) {
        case 'invoices':
          endpoint = `/plans/reports/invoices?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          break;
        case 'customers':
          endpoint = `/plans/reports/customers?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          break;
        case 'network':
          endpoint = '/plans/reports/network';
          break;
        case 'installations':
          endpoint = `/plans/reports/installations?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          break;
        default:
          endpoint = '/plans/reports/invoices';
      }
      
      const data = await API.get(endpoint);
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData) return;
    
    let csvContent = '';
    let filename = '';
    
    switch (activeTab) {
      case 'invoices':
        csvContent = 'Invoice Number,Customer,Email,Phone,Total,Status,Date\n';
        reportData.invoices.forEach(inv => {
          csvContent += `${inv.invoiceNumber || ''},${inv.customer?.name || ''},${inv.customer?.email || ''},${inv.customer?.phone || ''},${inv.total || 0},${inv.status || ''},${new Date(inv.createdAt).toLocaleDateString()}\n`;
        });
        filename = `invoice_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'customers':
        csvContent = 'Name,Email,Phone,Location,Segment,Created Date\n';
        reportData.customers.forEach(cust => {
          csvContent += `${cust.name || ''},${cust.email || ''},${cust.phone || ''},${cust.location || ''},${cust.customerSegment || ''},${new Date(cust.createdAt).toLocaleDateString()}\n`;
        });
        filename = `customer_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'network':
        csvContent = `Network Components Report\n`;
        csvContent += `POPs,${reportData.network.pops}\n`;
        csvContent += `Stations,${reportData.network.stations}\n`;
        csvContent += `Access Points,${reportData.network.accessPoints}\n`;
        csvContent += `Backbones,${reportData.network.backbones}\n`;
        filename = `network_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'installations':
        csvContent = 'Request Number,Customer,Phone,Type,Package,Technician,Status,Date\n';
        reportData.installations.forEach(inst => {
          csvContent += `${inst.requestNumber || ''},${inst.customer?.name || ''},${inst.customer?.phone || ''},${inst.installationType || ''},${inst.package || ''},${inst.technician?.name || 'Not assigned'},${inst.status || ''},${new Date(inst.createdAt).toLocaleDateString()}\n`;
        });
        filename = `installation_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      default:
        return;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const tabs = [
    { id: 'invoices', label: 'Invoices', icon: '📄' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'installations', label: 'Installations', icon: '🔧' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
          Reports
        </h1>
        <p style={{ 
          color: '#4a4a4a', 
          fontSize: 'clamp(14px, 3vw, 16px)', 
          marginTop: '8px', 
          opacity: 0.8,
          margin: '8px 0 0 0'
        }}>
          Generate and download business reports
        </p>
      </motion.div>

      {/* Date Range Filter */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '2px solid #43e97b',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
            End Date
          </label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '2px solid #43e97b',
              fontSize: '14px'
            }}
          />
        </div>
        <button
          onClick={() => setDateRange({ startDate: '', endDate: '' })}
          style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            color: '#666',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Clear Filter
        </button>
        <button
          onClick={downloadCSV}
          disabled={!reportData}
          style={{
            padding: '10px 24px',
            marginLeft: 'auto',
            marginTop: '20px',
            background: reportData ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' : '#ccc',
            color: reportData ? '#2d7a3e' : '#999',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: reportData ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease'
          }}
        >
          📥 Download CSV
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab.id ? '#43a047' : 'white',
              color: activeTab === tab.id ? 'white' : '#666',
              border: `2px solid ${activeTab === tab.id ? '#43a047' : '#ddd'}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
          Loading report...
        </div>
      ) : reportData ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Summary Cards */}
          {activeTab === 'invoices' && reportData.summary && (
            <motion.div
              variants={cardVariants}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}
            >
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#43a047' }}>
                  {reportData.summary.totalInvoices}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total Invoices</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#2196f3' }}>
                  ${reportData.summary.totalAmount?.toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total Amount</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#43a047' }}>
                  ${reportData.summary.paidAmount?.toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Paid Amount</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffa500' }}>
                  ${reportData.summary.pendingAmount?.toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Pending Amount</div>
              </div>
            </motion.div>
          )}

          {activeTab === 'customers' && reportData.summary && (
            <motion.div
              variants={cardVariants}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}
            >
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#43a047' }}>
                  {reportData.summary.totalCustomers}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total Customers</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#2196f3' }}>
                  {reportData.summary.activeCustomers}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Active Customers</div>
              </div>
            </motion.div>
          )}

          {activeTab === 'network' && reportData.network && (
            <motion.div
              variants={cardVariants}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}
            >
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#43a047' }}>
                  {reportData.network.pops}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>POPs</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#2196f3' }}>
                  {reportData.network.stations}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Stations</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffa500' }}>
                  {reportData.network.accessPoints}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Access Points</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#9c27b0' }}>
                  {reportData.network.backbones}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Backbones</div>
              </div>
            </motion.div>
          )}

          {activeTab === 'installations' && reportData.summary && (
            <motion.div
              variants={cardVariants}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}
            >
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#43a047' }}>
                  {reportData.summary.totalInstallations}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
              </div>
              {reportData.summary.statusCounts && Object.entries(reportData.summary.statusCounts).map(([status, count]) => (
                <div key={status} style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: status === 'opened' ? '#2196f3' : status === 'pending' ? '#ffa500' : status === 'completed' ? '#43a047' : '#9e9e9e' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize' }}>{status}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Data Table */}
          <motion.div
            variants={cardVariants}
            style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    {activeTab === 'invoices' && (
                      <>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Invoice #</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Customer</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Total</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Date</th>
                      </>
                    )}
                    {activeTab === 'customers' && (
                      <>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Phone</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Location</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Segment</th>
                      </>
                    )}
                    {activeTab === 'installations' && (
                      <>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Request #</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Customer</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Type</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Technician</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'invoices' && reportData.invoices?.slice(0, 50).map((inv, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{inv.customer?.name}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>${inv.total?.toFixed(2)}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: inv.status === 'paid' ? '#e8f5e9' : inv.status === 'pending' ? '#fff3e0' : '#ffebee',
                          color: inv.status === 'paid' ? '#43a047' : inv.status === 'pending' ? '#ffa500' : '#d32f2f'
                        }}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {activeTab === 'customers' && reportData.customers?.slice(0, 50).map((cust, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{cust.name}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{cust.email}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{cust.phone}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{cust.location}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{cust.customerSegment}</td>
                    </tr>
                  ))}
                  {activeTab === 'installations' && reportData.installations?.slice(0, 50).map((inst, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{inst.requestNumber}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{inst.customer?.name}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{inst.installationType} - {inst.package}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{inst.technician?.name || 'Not assigned'}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: inst.status === 'opened' ? '#e3f2fd' : inst.status === 'pending' ? '#fff3e0' : inst.status === 'completed' ? '#e8f5e9' : '#f5f5f5',
                          color: inst.status === 'opened' ? '#2196f3' : inst.status === 'pending' ? '#ffa500' : inst.status === 'completed' ? '#43a047' : '#9e9e9e'
                        }}>
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
              Showing up to 50 records. Download CSV for full report.
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px', color: '#999' }}>
          No data available
        </div>
      )}
    </div>
  );
}
