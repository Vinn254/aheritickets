// src/pages/reports.jsx
import React, { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('installations');
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [pops, setPops] = useState([]);
  const [aps, setAps] = useState([]);
  const [stations, setStations] = useState([]);
  const [backbones, setBackbones] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Always fetch network data
      const [popsRes, apsRes, stationsRes, backbonesRes] = await Promise.all([
        API.get('/api/network/pops'),
        API.get('/api/network/aps'),
        API.get('/api/network/stations'),
        API.get('/api/network/backbones')
      ]);
      setPops(popsRes.pops || []);
      setAps(apsRes.aps || []);
      setStations(stationsRes.stations || []);
      setBackbones(backbonesRes.backbones || []);

      switch (activeTab) {
        case 'invoices':
          const invoiceData = await API.get('/api/plans/reports/invoices');
          setInvoices(invoiceData.invoices || []);
          break;
        case 'quotations':
          const quotationData = await API.get('/api/quotations');
          setQuotations(quotationData.quotations || quotationData || []);
          break;
        case 'customers':
          const customerData = await API.get('/api/users?role=customer');
          setCustomers(customerData.users || customerData || []);
          break;
        case 'installations':
          const installData = await API.get('/api/installation-requests');
          setInstallations(installData || []);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    let csvContent = '';
    let filename = '';
    
    switch (activeTab) {
      case 'invoices':
        csvContent = 'Invoice Number,Customer,Email,Phone,Total,Status,Date\n';
        invoices.forEach(inv => {
          csvContent += `${inv.invoiceNumber || ''},${inv.customer?.name || ''},${inv.customer?.email || ''},${inv.customer?.phone || ''},${inv.total || 0},${inv.status || ''},${new Date(inv.createdAt).toLocaleDateString()}\n`;
        });
        filename = `invoices_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'quotations':
        csvContent = 'Quotation Number,Customer,Email,Phone,Total,Status,Date\n';
        quotations.forEach(quot => {
          csvContent += `${quot.quotationNumber || ''},${quot.customer?.name || ''},${quot.customer?.email || ''},${quot.customer?.phone || ''},${quot.total || 0},${quot.status || ''},${new Date(quot.createdAt).toLocaleDateString()}\n`;
        });
        filename = `quotations_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'customers':
        csvContent = 'Name,Email,Phone,Location,Segment,Created Date\n';
        customers.forEach(cust => {
          csvContent += `${cust.name || ''},${cust.email || ''},${cust.phone || ''},${cust.location || ''},${cust.customerSegment || ''},${new Date(cust.createdAt).toLocaleDateString()}\n`;
        });
        filename = `customers_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'network':
        csvContent = `Network Components Report\n`;
        csvContent += `POPs,${pops.length}\n`;
        csvContent += `Access Points,${aps.length}\n`;
        csvContent += `Stations,${stations.length}\n`;
        csvContent += `Backbones,${backbones.length}\n`;
        filename = `network_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'installations':
        csvContent = 'Request Number,Customer,Phone,Type,Package,Location,Technician,Status,Date\n';
        installations.forEach(inst => {
          csvContent += `${inst.requestNumber || ''},${inst.customer?.name || ''},${inst.customer?.phone || ''},${inst.installationType || ''},${inst.package || ''},${inst.location || ''},${inst.technician?.name || 'Not assigned'},${inst.status || ''},${new Date(inst.createdAt).toLocaleDateString()}\n`;
        });
        filename = `installations_report_${new Date().toISOString().split('T')[0]}.csv`;
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
    { id: 'installations', label: 'Installations' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'quotations', label: 'Quotations' },
    { id: 'customers', label: 'Customers' },
    { id: 'network', label: 'Network' }
  ];

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: 'linear-gradient(135deg, #eafff3 0%, #f7fff7 100%)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{ color: '#2d7a3e', margin: '0 0 8px 0', fontSize: 32, fontWeight: 800 }}>
          Reports
        </h1>
        <p style={{ color: '#4a4a4a', fontSize: 14, marginTop: 8 }}>
          Generate and download business reports
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: 8,
              background: activeTab === tab.id ? '#43e97b' : '#fff',
              color: activeTab === tab.id ? '#fff' : '#2d7a3e',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Download Button */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          onClick={downloadCSV}
          style={{
            padding: '12px 32px',
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(67, 233, 123, 0.4)'
          }}
        >
          Download {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {/* Installations Table */}
          {activeTab === 'installations' && (
            <div>
              <h3 style={{ color: '#2d7a3e', marginBottom: 16 }}>Installations ({installations.length})</h3>
              {installations.length === 0 ? (
                <p>No installations found.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#43e97b', color: '#fff' }}>
                      <th style={{ padding: 12, textAlign: 'left' }}>Request #</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Customer</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Type</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Package</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installations.slice(0, 50).map((inst, i) => (
                      <tr key={inst._id} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                        <td style={{ padding: 10 }}>{inst.requestNumber}</td>
                        <td style={{ padding: 10 }}>{inst.customer?.name}</td>
                        <td style={{ padding: 10 }}>{inst.installationType}</td>
                        <td style={{ padding: 10 }}>{inst.package}</td>
                        <td style={{ padding: 10 }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: 4, 
                            background: inst.status === 'opened' ? '#2196f3' : inst.status === 'pending' ? '#ff9800' : inst.status === 'completed' ? '#4caf50' : '#9e9e9e',
                            color: '#fff',
                            fontSize: 12
                          }}>
                            {inst.status}
                          </span>
                        </td>
                        <td style={{ padding: 10 }}>{new Date(inst.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Invoices Table */}
          {activeTab === 'invoices' && (
            <div>
              <h3 style={{ color: '#2d7a3e', marginBottom: 16 }}>Invoices ({invoices.length})</h3>
              {invoices.length === 0 ? (
                <p>No invoices found.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#43e97b', color: '#fff' }}>
                      <th style={{ padding: 12, textAlign: 'left' }}>Invoice #</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Customer</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Total</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 50).map((inv, i) => (
                      <tr key={inv._id} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                        <td style={{ padding: 10 }}>{inv.invoiceNumber}</td>
                        <td style={{ padding: 10 }}>{inv.customer?.name}</td>
                        <td style={{ padding: 10 }}>{inv.total}</td>
                        <td style={{ padding: 10 }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: 4, 
                            background: inv.status === 'paid' ? '#4caf50' : inv.status === 'pending' ? '#ff9800' : '#f44336',
                            color: '#fff',
                            fontSize: 12
                          }}>
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ padding: 10 }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Quotations Table */}
          {activeTab === 'quotations' && (
            <div>
              <h3 style={{ color: '#2d7a3e', marginBottom: 16 }}>Quotations ({quotations.length})</h3>
              {quotations.length === 0 ? (
                <p>No quotations found.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#43e97b', color: '#fff' }}>
                      <th style={{ padding: 12, textAlign: 'left' }}>Quotation #</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Customer</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Total</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.slice(0, 50).map((quot, i) => (
                      <tr key={quot._id} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                        <td style={{ padding: 10 }}>{quot.quotationNumber}</td>
                        <td style={{ padding: 10 }}>{quot.customer?.name}</td>
                        <td style={{ padding: 10 }}>{quot.total}</td>
                        <td style={{ padding: 10 }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: 4, 
                            background: quot.status === 'approved' ? '#4caf50' : quot.status === 'pending' ? '#ff9800' : '#9e9e9e',
                            color: '#fff',
                            fontSize: 12
                          }}>
                            {quot.status}
                          </span>
                        </td>
                        <td style={{ padding: 10 }}>{new Date(quot.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Customers Table */}
          {activeTab === 'customers' && (
            <div>
              <h3 style={{ color: '#2d7a3e', marginBottom: 16 }}>Customers ({customers.length})</h3>
              {customers.length === 0 ? (
                <p>No customers found.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#43e97b', color: '#fff' }}>
                      <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Phone</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Location</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Segment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.slice(0, 50).map((cust, i) => (
                      <tr key={cust._id} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                        <td style={{ padding: 10 }}>{cust.name}</td>
                        <td style={{ padding: 10 }}>{cust.email}</td>
                        <td style={{ padding: 10 }}>{cust.phone}</td>
                        <td style={{ padding: 10 }}>{cust.location}</td>
                        <td style={{ padding: 10 }}>{cust.customerSegment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Network Overview */}
          {activeTab === 'network' && (
            <div>
              <h3 style={{ color: '#2d7a3e', marginBottom: 16 }}>Network Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ background: '#e8f5e9', padding: 20, borderRadius: 8, textAlign: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: 36, color: '#43e97b' }}>{pops.length}</h2>
                  <p style={{ margin: '8px 0 0 0', color: '#2d7a3e', fontWeight: 600 }}>POPs</p>
                </div>
                <div style={{ background: '#e8f5e9', padding: 20, borderRadius: 8, textAlign: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: 36, color: '#43e97b' }}>{aps.length}</h2>
                  <p style={{ margin: '8px 0 0 0', color: '#2d7a3e', fontWeight: 600 }}>Access Points</p>
                </div>
                <div style={{ background: '#e8f5e9', padding: 20, borderRadius: 8, textAlign: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: 36, color: '#43e97b' }}>{stations.length}</h2>
                  <p style={{ margin: '8px 0 0 0', color: '#2d7a3e', fontWeight: 600 }}>Stations</p>
                </div>
                <div style={{ background: '#e8f5e9', padding: 20, borderRadius: 8, textAlign: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: 36, color: '#43e97b' }}>{backbones.length}</h2>
                  <p style={{ margin: '8px 0 0 0', color: '#2d7a3e', fontWeight: 600 }}>Backbones</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
