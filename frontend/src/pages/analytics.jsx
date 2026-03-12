import React, { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import API from '../utils/api';
import { AuthContext } from '../context/authcontext';

export default function Analytics() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, assigned: 0, in_progress: 0, waiting_customer: 0, on_site: 0, resolved: 0, closed: 0 });
  const [roleStats, setRoleStats] = useState({});
  const [techStats, setTechStats] = useState({});
  const [csrStats, setCsrStats] = useState({});
  const [customerCount, setCustomerCount] = useState(0);
  const [approvedInstallations, setApprovedInstallations] = useState(0);

  useEffect(() => {
    let interval;
    const fetch = async () => {
      try {
        const res = await API.get('/api/tickets');
        let payload = [];
        if (res && Array.isArray(res.tickets)) {
          payload = res.tickets;
        } else if (res && res.data && Array.isArray(res.data.tickets)) {
          payload = res.data.tickets;
        } else if (res && Array.isArray(res.data)) {
          payload = res.data;
        }
        setTickets(payload);
        const statObj = { total: payload.length, open: 0, assigned: 0, in_progress: 0, waiting_customer: 0, on_site: 0, resolved: 0, closed: 0 };
        const roleObj = {};
        const techObj = {};
        const csrObj = {};
        payload.forEach(t => {
          if (t.status && statObj.hasOwnProperty(t.status)) statObj[t.status]++;
          if (t.assignedTo && t.assignedTo.name) {
            techObj[t.assignedTo.name] = (techObj[t.assignedTo.name] || 0) + 1;
          }
          if (t.createdBy && t.createdBy.role === 'csr' && t.createdBy.name) {
            csrObj[t.createdBy.name] = (csrObj[t.createdBy.name] || 0) + 1;
          }
          if (t.customer && t.customer.role) {
            roleObj[t.customer.role] = (roleObj[t.customer.role] || 0) + 1;
          }
        });
        setStats(statObj);
        setRoleStats(roleObj);
        setTechStats(techObj);
        setCsrStats(csrObj);

        try {
          const usersRes = await API.get('/api/users');
          const users = usersRes.users || usersRes || [];
          const customers = users.filter(u => u.role === 'customer');
          setCustomerCount(customers.length);
        } catch (userErr) {
          console.error('Error fetching users:', userErr);
          setCustomerCount(0);
        }

        try {
          const installRes = await API.get('/api/installation-requests');
          const requests = installRes.data || installRes.installationRequests || [];
          const approved = requests.filter(r => r.status === 'approved').length;
          setApprovedInstallations(approved);
        } catch (installErr) {
          console.error('Error fetching installation requests:', installErr);
          setApprovedInstallations(0);
        }
      } catch (err) {
        setTickets([]);
        setCustomerCount(0);
      }
    };
    fetch();
    interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, []);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this closed ticket?')) return;
    try {
      await API.delete(`/api/tickets/${ticketId}`);
      const res = await API.get('/api/tickets');
      let payload = [];
      if (res && Array.isArray(res.tickets)) {
        payload = res.tickets;
      } else if (res && res.data && Array.isArray(res.data.tickets)) {
        payload = res.data.tickets;
      } else if (res && Array.isArray(res.data)) {
        payload = res.data;
      }
      setTickets(payload);
    } catch (err) {
      alert('Failed to delete ticket: ' + (err.message || 'Unknown error'));
    }
  };

  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .analytics-container { padding: 16px !important; }
        .analytics-table { font-size: 12px !important; }
        .analytics-table th, .analytics-table td { padding: 8px !important; }
        .analytics-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
        .analytics-detailed-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
      }
      @media (max-width: 480px) {
        .analytics-stats-grid { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const StatCard = ({ label, value, color }) => (
    <motion.div
      whileHover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
      style={{
        background: '#fff',
        padding: 20,
        borderRadius: 12,
        textAlign: 'center',
        border: `2px solid ${color}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ fontSize: 32, fontWeight: '800', color: color, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </motion.div>
  );

  return (
    <div style={{ padding: '32px', marginTop: '56px', minHeight: '60vh', background: 'linear-gradient(90deg, #e8f5e9 0%, #f7fff7 100%)' }}>
      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <motion.div whileHover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)' }} style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)', padding: '15px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}>
          <strong style={{ color: 'white' }}>Total Tickets</strong><br /><span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{stats.total}</span>
        </motion.div>
        <motion.div whileHover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(33, 150, 243, 0.3)' }} style={{ background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)', padding: '15px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}>
          <strong style={{ color: 'white' }}>Open</strong><br /><span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{stats.open}</span>
        </motion.div>
        <motion.div whileHover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(156, 39, 176, 0.3)' }} style={{ background: 'linear-gradient(135deg, #9C27B0 0%, #CE93D8 100%)', padding: '15px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}>
          <strong style={{ color: 'white' }}>Resolved</strong><br /><span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{stats.resolved}</span>
        </motion.div>
        <motion.div whileHover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(255, 152, 0, 0.3)' }} style={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)', padding: '15px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}>
          <strong style={{ color: 'white' }}>Assigned</strong><br /><span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{stats.assigned}</span>
        </motion.div>
        <motion.div whileHover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(244, 67, 54, 0.3)' }} style={{ background: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)', padding: '15px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}>
          <strong style={{ color: 'white' }}>Closed</strong><br /><span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{stats.closed}</span>
        </motion.div>
        <motion.div whileHover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0, 188, 212, 0.3)' }} style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)', padding: '15px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}>
          <strong style={{ color: 'white' }}>Customers</strong><br /><span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{customerCount}</span>
        </motion.div>
        <motion.div whileHover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(233, 30, 99, 0.3)' }} style={{ background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)', padding: '15px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}>
          <strong style={{ color: 'white' }}>Approved Installations</strong><br /><span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{approvedInstallations}</span>
        </motion.div>
      </div>

      {/* Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {/* By Customer Role */}
        <div style={{ background: '#eafff3', padding: '20px', borderRadius: '8px', border: '1.5px solid #43e97b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#186a3b', fontWeight: 700 }}>By Customer Role</h3>
          {Object.entries(roleStats).map(([role, count]) => (
            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#2d7a3e' }}>
              <span>{role}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>

        {/* By Technician */}
        <div style={{ background: '#eafff3', padding: '20px', borderRadius: '8px', border: '1.5px solid #43e97b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#186a3b', fontWeight: 700 }}>By Technician</h3>
          {Object.entries(techStats).map(([tech, count]) => (
            <div key={tech} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#2d7a3e' }}>
              <span>{tech}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>

        {/* By CSR */}
        <div style={{ background: '#eafff3', padding: '20px', borderRadius: '8px', border: '1.5px solid #43e97b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#186a3b', fontWeight: 700 }}>By CSR</h3>
          {Object.entries(csrStats).map(([csr, count]) => (
            <div key={csr} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#2d7a3e' }}>
              <span>{csr}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div>
        <h3 style={{ color: '#186a3b', fontWeight: 700 }}>All Tickets</h3>
        {['admin','csr','technician'].includes(user?.role) && (
          <form onSubmit={handleSearch} style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
            <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search tickets..." style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1.5px solid #43e97b', background: '#eafff3' }} />
            <button type="submit" style={{ padding: '8px 16px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Search</button>
          </form>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead><tr style={{ background: '#2d7a3e', color: 'white' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Title</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Assigned To</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Priority</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
          </tr></thead>
          <tbody>
            {tickets
              .filter(t => !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.ticketId?.includes(search))
              .map((t, i) => (
              <tr key={t._id} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{t.ticketId}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{t.title}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: '600', color: t.status === 'resolved' ? '#2d7a3e' : t.status === 'closed' ? '#666' : t.status === 'open' ? '#f39c12' : '#2196f3' }}>{t.status}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{t.assignedTo?.name || '-'}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{t.priority || '-'}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {t.status === 'closed' && ['admin', 'csr'].includes(user?.role) && (
                    <button onClick={() => handleDelete(t._id)} style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
