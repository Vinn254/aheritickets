import React, { useEffect, useState, useContext } from 'react';
import API from '../utils/api';
import { AuthContext } from '../context/authcontext';

export default function Analytics() {
  // Only render Navbar if not already rendered by App.jsx
  const { user } = useContext(AuthContext);
  // Remove duplicate Navbar by checking location
  const location = window.location.pathname;
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, assigned: 0, in_progress: 0, waiting_customer: 0, on_site: 0, resolved: 0, closed: 0 });
  const [roleStats, setRoleStats] = useState({});
  const [techStats, setTechStats] = useState({});
  const [csrStats, setCsrStats] = useState({});
  const [customerCount, setCustomerCount] = useState(0);

  useEffect(() => {
    let interval;
    const fetch = async () => {
      try {
        // Fetch tickets
        const res = await API.get('/tickets');
        let payload = [];
        if (res && Array.isArray(res.tickets)) {
          payload = res.tickets;
        } else if (res && res.data && Array.isArray(res.data.tickets)) {
          payload = res.data.tickets;
        } else if (res && Array.isArray(res.data)) {
          payload = res.data;
        }
        console.log('ANALYTICS: /tickets API response', res);
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

        // Fetch customer count
        try {
          const usersRes = await API.get('/users');
          const users = usersRes.users || usersRes || [];
          const customers = users.filter(u => u.role === 'customer');
          setCustomerCount(customers.length);
        } catch (userErr) {
          console.error('Error fetching users:', userErr);
          setCustomerCount(0);
        }
      } catch (err) {
        setTickets([]);
        setCustomerCount(0);
      }
    };
    fetch();
    interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  // Search bar for admin/csr/technician
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  // Delete ticket
  const handleDelete = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this closed ticket?')) return;
    try {
      await API.delete(`/tickets/${ticketId}`);
      // Refetch tickets immediately
      const res = await API.get('/tickets');
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

  // Add responsive styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .analytics-container {
          padding: 16px !important;
        }
        .analytics-table {
          font-size: 12px !important;
        }
        .analytics-table th,
        .analytics-table td {
          padding: 6px !important;
          white-space: nowrap;
        }
        .analytics-stats {
          padding: 16px !important;
        }
        .analytics-stats h3 {
          font-size: 20px !important;
          margin-bottom: 16px !important;
        }
        .analytics-stats-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px !important;
        }
        .analytics-stats-grid > div {
          padding: 12px !important;
        }
        .analytics-stats-grid > div > div:first-child {
          font-size: 24px !important;
        }
        .analytics-stats-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        .analytics-detailed-grid {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }
      }
      @media (max-width: 480px) {
        .analytics-container {
          padding: 12px !important;
        }
        .analytics-stats-grid {
          grid-template-columns: repeat(1, 1fr) !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <>
  <div className="analytics-container" style={{ padding: 32, background: '#fff', minHeight: '60vh', marginTop: 56 }}>
        {['admin','csr','technician'].includes(user?.role) && (
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, marginTop: 0, maxWidth: 400 }}>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search customer by name..."
              style={{ padding: 10, borderRadius: 6, border: '1.5px solid #43e97b', minWidth: 120, fontSize: 16 }}
            />
            <button type="submit" style={{ padding: '8px 18px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: 6, fontSize: 15 }}>Enter</button>
          </form>
        )}
        <h2 style={{ color: '#0b4d1e', fontWeight: 800, fontSize: 32, marginBottom: 22, letterSpacing: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>Analytics</h2>
        <div className="analytics-stats" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 8px 32px rgba(44, 130, 89, 0.18)', border: '1px solid #43e97b', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: 24, fontWeight: 700, textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Ticket Statistics</h3>

          {/* Main Stats Grid */}
          <div className="analytics-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 12, textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{stats.total}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Total Tickets</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 12, textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#ffeb3b' }}>{stats.open}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Open</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 12, textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#2196f3' }}>{stats.assigned}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Assigned</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 12, textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#ff9800' }}>{stats.in_progress}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>In Progress</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 12, textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#9c27b0' }}>{stats.waiting_customer}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Waiting Customer</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 12, textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#607d8b' }}>{stats.on_site}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>On Site</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 12, textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#4caf50' }}>{stats.resolved}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Resolved</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 12, textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#795548' }}>{stats.closed}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Closed</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 12, textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#e91e63' }}>{customerCount}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Total Customers</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>Tickets by Customer Role</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(roleStats).map(([role, count]) => (
                  <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ textTransform: 'capitalize' }}>{role}</span>
                    <span style={{ fontWeight: 600, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 8, fontSize: 14 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>Tickets per Technician</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(techStats).map(([tech, count]) => (
                  <div key={tech} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ textTransform: 'capitalize' }}>{tech}</span>
                    <span style={{ fontWeight: 600, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 8, fontSize: 14 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>Tickets per CSR</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(csrStats).map(([csr, count]) => (
                  <div key={csr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ textTransform: 'capitalize' }}>{csr}</span>
                    <span style={{ fontWeight: 600, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 8, fontSize: 14 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Customer ticket details table */}
        <div style={{
          background: 'linear-gradient(135deg, #eafff3 0%, #f7fff7 100%)',
          borderRadius: 14,
          boxShadow: '0 4px 24px rgba(44, 130, 89, 0.13)',
          padding: 18,
          marginTop: 18,
          maxWidth: 1200,
          marginLeft: 'auto',
          marginRight: 'auto',
          overflowX: 'auto',
        }}>
          <h3 style={{ color: '#0b4d1e', fontWeight: 700, marginBottom: 16 }}>Customer Tickets</h3>
          <table className="analytics-table" style={{ minWidth: '600px', width: '100%', borderCollapse: 'collapse', fontSize: 15, color: '#1a2d1a', fontWeight: 500 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', fontWeight: 800 }}>
                <th style={{ padding: 10, border: 'none', letterSpacing: 1 }}>Customer Name</th>
                <th style={{ padding: 10, border: 'none', letterSpacing: 1 }}>Phone</th>
                <th style={{ padding: 10, border: 'none', letterSpacing: 1 }}>Email</th>
                <th style={{ padding: 10, border: 'none', letterSpacing: 1 }}>Ticket Title</th>
                <th style={{ padding: 10, border: 'none', letterSpacing: 1 }}>Technician Specialization</th>
                <th style={{ padding: 10, border: 'none', letterSpacing: 1 }}>Status</th>
                <th style={{ padding: 10, border: 'none', letterSpacing: 1 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets
                .filter(t => t.customer && t.customer.name && (!search || t.customer.name.toLowerCase().includes(search.toLowerCase())))
                .map((t, i) => (
                <tr key={t._id || i} style={{ background: i % 2 === 0 ? '#e8f5e9' : '#fff' }}>
                  <td style={{ padding: 10, color: '#134d2a', fontWeight: 600 }}>{t.customer.name}</td>
                  <td style={{ padding: 10, color: '#1a2d1a' }}>{t.customer.phone || '-'}</td>
                  <td style={{ padding: 10, color: '#1a2d1a' }}>{t.customer.email}</td>
                  <td style={{ padding: 10, color: '#186a3b', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => window.location.href = `/tickets/${t._id}`}>{t.title}</td>
                  <td style={{ padding: 10, color: '#1a2d1a' }}>{t.assignedTo?.specialization || '-'}</td>
                  <td style={{ padding: 10, color: t.status === 'open' ? '#1e88e5' : t.status === 'resolved' ? '#43a047' : '#0b4d1e', fontWeight: 700, textTransform: 'capitalize' }}>{t.status}</td>
                  <td style={{ padding: 10 }}>
                    {t.status === 'closed' && ['admin', 'csr'].includes(user?.role) && (
                      <button
                        onClick={() => handleDelete(t._id)}
                        style={{ padding: '4px 8px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
