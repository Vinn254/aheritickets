// ...existing code...

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/authcontext';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/api';
import { SkeletonCard } from '../components/SkeletonLoader';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  // Stats for admin
  const [stats, setStats] = useState({ total: 0, open: 0, assigned: 0, in_progress: 0, waiting_customer: 0, on_site: 0, resolved: 0, closed: 0 });
  const [roleStats, setRoleStats] = useState({});
  const [techStats, setTechStats] = useState({});
  const [csrStats, setCsrStats] = useState({});
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortAZ, setSortAZ] = useState(false);

  // Search handler for Enter button
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  // If redirected from ticket creation, force fetch and clear state
  useEffect(() => {
    if (location.state && location.state.refresh) {
      (async () => {
        try {
          const res = await API.get('/tickets');
          let ticketsArr = [];
          if (res && Array.isArray(res.tickets)) {
            ticketsArr = res.tickets;
          } else if (res && res.data && Array.isArray(res.data.tickets)) {
            ticketsArr = res.data.tickets;
          }
          setTickets(ticketsArr);
        } catch (err) {
          setTickets([]);
        }
      })();
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    let interval;
    const fetch = async () => {
      try {
        const res = await API.get('/tickets');
        console.log('DEBUG: /tickets API response', res);
        let ticketsArr = [];
        // Accept tickets from res.tickets or res.data.tickets
        if (res && Array.isArray(res.tickets)) {
          ticketsArr = res.tickets;
        } else if (res && res.data && Array.isArray(res.data.tickets)) {
          ticketsArr = res.data.tickets;
        }
        console.log('DEBUG: tickets array after parsing', ticketsArr);
        setTickets(ticketsArr);
  console.log('DASHBOARD: tickets after fetch', ticketsArr);
        // Calculate stats if admin
        if (user && user.role === 'admin') {
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
        }
      } catch (err) {
        console.error(err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [user, navigate, location]);

  // Add responsive styles and animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes float1 {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      .dashboard-container {
        animation: fadeIn 0.4s ease-out;
      }
      .dashboard-stats {
        animation: slideInUp 0.3s ease-out 0.1s both;
      }
      .dashboard-stats-grid > div:nth-child(1) { animation: slideInUp 0.25s ease-out 0.2s both; }
      .dashboard-stats-grid > div:nth-child(2) { animation: slideInUp 0.25s ease-out 0.25s both; }
      .dashboard-stats-grid > div:nth-child(3) { animation: slideInUp 0.25s ease-out 0.3s both; }
      .dashboard-stats-grid > div:nth-child(4) { animation: slideInUp 0.25s ease-out 0.35s both; }
      .dashboard-stats-grid > div:nth-child(5) { animation: slideInUp 0.25s ease-out 0.4s both; }
      .dashboard-stats-grid > div:nth-child(6) { animation: slideInUp 0.25s ease-out 0.45s both; }
      .dashboard-stats-grid > div:nth-child(7) { animation: slideInUp 0.25s ease-out 0.5s both; }
      .dashboard-stats-grid > div:nth-child(8) { animation: slideInUp 0.25s ease-out 0.55s both; }
      .dashboard-stats-grid > div:nth-child(9) { animation: slideInUp 0.25s ease-out 0.6s both; }
      .dashboard-detailed-grid > div:nth-child(1) { animation: slideInUp 0.25s ease-out 0.65s both; }
      .dashboard-detailed-grid > div:nth-child(2) { animation: slideInUp 0.25s ease-out 0.7s both; }
      .dashboard-detailed-grid > div:nth-child(3) { animation: slideInUp 0.25s ease-out 0.75s both; }
      .dashboard-ticket-card {
        animation: slideInUp 0.25s ease-out both;
        animation-delay: calc(var(--index) * 0.05s + 0.8s);
      }
      .loading-spinner {
        animation: spin 1s linear infinite;
      }
      @media (max-width: 768px) {
        .dashboard-container {
          padding: 16px !important;
        }
        .dashboard-stats {
          padding: 16px !important;
        }
        .dashboard-stats h3 {
          font-size: 20px !important;
          margin-bottom: 16px !important;
        }
        .dashboard-stats-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px !important;
        }
        .dashboard-stats-grid > div {
          padding: 12px !important;
        }
        .dashboard-stats-grid > div > div:first-child {
          font-size: 20px !important;
        }
        .dashboard-detailed-grid {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }
        .dashboard-ticket-card {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 16px !important;
        }
        .dashboard-ticket-card > div:last-child {
          align-self: stretch !important;
          align-items: center !important;
        }
        .dashboard-ticket-card button {
          width: 100% !important;
          min-width: unset !important;
        }
      }
      @media (max-width: 480px) {
        .dashboard-stats-grid {
          grid-template-columns: repeat(1, 1fr) !important;
        }
        .dashboard-stats h3 {
          font-size: 18px !important;
        }
        .dashboard-ticket-card {
          padding: 16px !important;
        }
        .dashboard-ticket-card > div:first-child > div:first-child {
          font-size: 18px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    // redirect to role-specific pages if you prefer
    // e.g. navigate('/csr/open') for CSR, etc.
  }, [user, navigate]);

  if (!user) return null;

  return (
    <>
      {/* Search box only for admin/csr/tech, never for customer */}
      <div className="dashboard-container" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f7fff7 0%, #e8f5e9 100%)', padding: 32, marginTop: 56 }}>
        {['admin','csr','technician'].includes(user.role) && (
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, marginTop: 0, flexWrap: 'wrap', animation: 'slideInUp 0.3s ease-out 0.05s both' }}>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search customer by name..."
              style={{ padding: 12, borderRadius: 8, border: '2px solid #43e97b', minWidth: 220, fontSize: 16, background: '#fff', boxShadow: '0 2px 8px rgba(67, 233, 123, 0.1)', transition: 'border-color 0.3s ease, box-shadow 0.3s ease', ':focus': { borderColor: '#38f9d7', boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)' } }}
            />
            <button type="submit" style={{ ...primaryBtn, padding: '12px 20px', fontSize: 16, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)' }} whileHover={{ scale: 1.05, boxShadow: '0 6px 16px rgba(67, 233, 123, 0.4)', transition: { duration: 0.15 } }} whileTap={{ scale: 0.95 }}>Search</button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: '#2d7a3e', fontWeight: 600, background: '#fff', padding: '8px 12px', borderRadius: 6, border: '1px solid #43e97b', transition: 'background 0.3s ease', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = '#f7fff7'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>
              <input type="checkbox" checked={sortAZ} onChange={e => setSortAZ(e.target.checked)} style={{ marginRight: 4 }} />
              Sort A-Z
            </label>
          </form>
        )}
        {user.role !== 'customer' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8, marginBottom: 20, animation: 'slideInUp 0.3s ease-out 0.08s both' }}>
            <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/tickets/create')} style={{ ...navBtn, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)' }} whileHover={{ scale: 1.05, boxShadow: '0 6px 16px rgba(67, 233, 123, 0.4)', transition: { duration: 0.15 } }} whileTap={{ scale: 0.95 }}>Create Ticket</button>
              <button onClick={() => navigate('/login')} style={{ ...navBtn, background: '#fff', color: '#2d7a3e', border: '2px solid #43e97b', boxShadow: '0 2px 8px rgba(67, 233, 123, 0.1)' }} whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(67, 233, 123, 0.2)', transition: { duration: 0.15 } }} whileTap={{ scale: 0.95 }}>Logout</button>
            </nav>
          </div>
        )}
        <div style={{ textAlign: 'center', marginBottom: 32, animation: 'slideInUp 0.3s ease-out' }}>
          <h1 style={{ color: '#2d7a3e', margin: 0, fontSize: 32, fontWeight: 800, textShadow: '0 2px 8px rgba(0,0,0,0.1)', letterSpacing: 1, animation: 'fadeIn 0.4s ease-out 0.05s both' }}>Welcome back, {user.name || user.username}!</h1>
          <p style={{ color: '#4a4a4a', fontSize: 16, marginTop: 8, opacity: 0.8, animation: 'fadeIn 0.4s ease-out 0.15s both' }}>Here's your dashboard overview</p>
        </div>
        {user.role === 'admin' && (
          <div className="dashboard-stats" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 8px 32px rgba(44, 130, 89, 0.18)', border: '1px solid #43e97b', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 24, fontWeight: 700, textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Dashboard Statistics</h3>

            {/* Main Stats Grid */}
            <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
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
            </div>

            {/* Detailed Stats */}
            <div className="dashboard-detailed-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
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
        )}

        <div style={{ marginTop: 32 }}>
          <h2 style={{ color: '#2d7a3e', marginTop: 0, marginBottom: 20, textAlign: 'center', fontSize: 28, fontWeight: 700 }}>Recent Tickets</h2>
          <section className="dashboard-tickets" style={{ marginTop: 0 }}>
            {loading ? (
              <div style={{ display: 'grid', gap: 24 }}>
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {tickets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, background: 'linear-gradient(135deg, #f7fff7 0%, #e8f5e9 100%)', borderRadius: 16, border: '2px dashed #43e97b', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ fontSize: 48, marginBottom: 16, animation: 'float1 3s ease-in-out infinite' }}>📋</div>
                    <div style={{ fontSize: 20, color: '#2d7a3e', fontWeight: 700, marginBottom: 8 }}>No tickets found</div>
                    <div style={{ fontSize: 16, color: '#4a4a4a', opacity: 0.8 }}>Your recent tickets will appear here</div>
                  </div>
                ) : (
                  <div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.05
                        }
                      }
                    }}
                  >
                    {tickets
                      .filter(t => {
                        if (!search) return true;
                        // Search by customer name (case-insensitive)
                        return t.customer && t.customer.name && t.customer.name.toLowerCase().includes(search.toLowerCase());
                      })
                      .sort((a, b) => {
                        if (sortAZ) {
                          const nameA = (a.customer?.name || '').toLowerCase();
                          const nameB = (b.customer?.name || '').toLowerCase();
                          if (nameA < nameB) return -1;
                          if (nameA > nameB) return 1;
                          return 0;
                        }
                        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                      })
                      .slice(0,8)
                      .map((t, i) => (
                        <div
                          key={t._id}
                          className="dashboard-ticket-card"
                          style={{
                            '--index': i,
                            padding: 24,
                            background: 'linear-gradient(135deg, #fff 0%, #f7fff7 100%)',
                            borderRadius: 16,
                            borderLeft: '8px solid #27ae60',
                            boxShadow: '0 8px 32px rgba(39, 174, 96, 0.12), 0 4px 12px rgba(44,62,80,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            position: 'relative',
                            border: '1px solid #e8f5e9',
                            cursor: 'pointer',
                          }}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: 20, color: '#222', marginBottom: 6, letterSpacing: 0.3 }}>{t.title || t.issue}</div>
                            <div style={{ color: '#4a4a4a', marginTop: 6, fontSize: 15, opacity: 0.9, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {t.description?.slice(0,150) || 'No description provided'}
                            </div>
                            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                background: t.status === 'open' ? '#fff3cd' : t.status === 'resolved' ? '#d4edda' : t.status === 'closed' ? '#f8d7da' : '#e2e3e5',
                                color: t.status === 'open' ? '#856404' : t.status === 'resolved' ? '#155724' : t.status === 'closed' ? '#721c24' : '#383d41',
                                border: `1px solid ${t.status === 'open' ? '#ffeaa7' : t.status === 'resolved' ? '#c3e6cb' : t.status === 'closed' ? '#f5c6cb' : '#d1d3d4'}`
                              }}>
                                {t.status ? t.status.replace('_', ' ') : 'open'}
                              </span>
                              <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                                {t.customer?.name || 'Unknown Customer'}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/tickets/${t._id}`);
                              }}
                              style={{
                                padding: '14px 24px',
                                background: 'linear-gradient(135deg, #27ae60 0%, #43e97b 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 12,
                                fontWeight: 700,
                                fontSize: 16,
                                boxShadow: '0 4px 16px rgba(39,174,96,0.2)',
                                cursor: 'pointer',
                                letterSpacing: 0.5,
                                minWidth: 120,
                              }}
                            >
                              View Details
                            </button>
                            <div style={{ fontSize: 12, color: '#666', textAlign: 'right' }}>
                              {new Date(t.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

const primaryBtn = { padding: '10px 14px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' };
const navBtn = { background: '#2d7a3e', color: '#fff', border: 'none', borderRadius: 5, padding: '7px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 15, transition: 'background 0.2s' };
