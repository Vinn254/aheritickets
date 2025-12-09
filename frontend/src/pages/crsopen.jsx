// src/pages/CSROpen.js
import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';
import TicketsMap from '../components/TicketsMap';

export default function CSROpen() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const navigate = useNavigate();

  useEffect(() => {
    let interval = setInterval(() => {
      API.get('/tickets').then(res => {
        let payload = [];
        if (Array.isArray(res.tickets)) {
          payload = res.tickets;
        } else if (res.data && Array.isArray(res.data.tickets)) {
          payload = res.data.tickets;
        } else if (Array.isArray(res.data)) {
          payload = res.data;
        }
        setTickets(payload);
      }).catch(console.error);
    }, 10000);
    // fetch immediately on mount
    API.get('/tickets').then(res => {
      let payload = [];
      if (Array.isArray(res.tickets)) {
        payload = res.tickets;
      } else if (res.data && Array.isArray(res.data.tickets)) {
        payload = res.data.tickets;
      } else if (Array.isArray(res.data)) {
        payload = res.data;
      }
      setTickets(payload);
    }).catch(console.error);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  React.useEffect(() => {
    if (searchInput === '') setSearch('');
  }, [searchInput]);

  // Add responsive styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .csr-dashboard-container {
          padding: 16px !important;
        }
        .csr-ticket-card {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 16px !important;
        }
        .csr-ticket-card > div:last-child {
          align-self: stretch !important;
          align-items: center !important;
        }
        .csr-ticket-card button {
          width: 100% !important;
          min-width: unset !important;
        }
      }
      @media (max-width: 480px) {
        .csr-dashboard-container {
          padding: 12px !important;
        }
        .csr-ticket-card {
          padding: 16px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <>
    <div className="csr-dashboard-container" style={{
      padding: 32,
      marginTop: 56,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eafff3 0%, #f7fff7 100%)',
      boxSizing: 'border-box',
    }}>
    <div style={{ textAlign: 'center', marginBottom: 32 }}>
      <h1 style={{ color: '#2d7a3e', margin: 0, fontSize: 32, fontWeight: 800, textShadow: '0 2px 8px rgba(0,0,0,0.1)', letterSpacing: 1 }}>CSR Dashboard</h1>
      <p style={{ color: '#4a4a4a', fontSize: 16, marginTop: 8, opacity: 0.8 }}>Manage and assign all customer tickets</p>
    </div>

    {/* Search bar for CRS */}
    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, marginTop: 0, maxWidth: 500, justifyContent: 'center', flexWrap: 'wrap' }}>
      <input
        type="text"
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        placeholder="Search customer by name..."
        style={{ padding: 12, borderRadius: 8, border: '2px solid #43e97b', minWidth: 220, fontSize: 16, background: '#fff', boxShadow: '0 2px 8px rgba(67, 233, 123, 0.1)' }}
      />
      <button type="submit" style={{ padding: '12px 20px', background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)' }}>Search</button>
    </form>

    {/* View Toggle */}
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
      <button
        onClick={() => setViewMode('list')}
        style={{
          padding: '10px 20px',
          background: viewMode === 'list' ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' : '#f0f0f0',
          color: viewMode === 'list' ? 'white' : '#333',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        List View
      </button>
      <button
        onClick={() => setViewMode('map')}
        style={{
          padding: '10px 20px',
          background: viewMode === 'map' ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' : '#f0f0f0',
          color: viewMode === 'map' ? 'white' : '#333',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Map View
      </button>
    </div>
    <div style={{ marginTop: 32 }}>
      <h2 style={{ color: '#2d7a3e', marginTop: 0, marginBottom: 20, textAlign: 'center', fontSize: 28, fontWeight: 700 }}>
        {viewMode === 'list' ? 'All Tickets' : 'Tickets Map'}
      </h2>
      {viewMode === 'list' ? (
        <div className="csr-tickets-container" style={{ display: 'grid', gap: 40 }}>
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'linear-gradient(135deg, #f7fff7 0%, #e8f5e9 100%)', borderRadius: 16, border: '2px dashed #43e97b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 20, color: '#2d7a3e', fontWeight: 700, marginBottom: 8 }}>No tickets found</div>
            <div style={{ fontSize: 16, color: '#4a4a4a', opacity: 0.8 }}>All customer tickets will appear here</div>
          </div>
        ) : tickets
          .filter(t => !search || (t.customer && t.customer.name && t.customer.name.toLowerCase().includes(search.toLowerCase())))
          .map(t => (
            <div
              key={t._id}
              className="csr-ticket-card"
              style={{
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
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#222', marginBottom: 6, letterSpacing: 0.3 }}>{t.title || t.issue}</div>
                <div style={{ color: '#4a4a4a', marginTop: 6, fontSize: 15, opacity: 0.9, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {t.description?.slice(0,150) || 'No description provided'}
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
                  <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>
                    <strong>Customer:</strong> {t.customer?.name || 'Unknown'}
                  </span>
                  {t.customer?.email && (
                    <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>
                      ({t.customer.email})
                    </span>
                  )}
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
                    minWidth: 140,
              }}
                >
                  View & Assign
                </button>
                <div style={{ fontSize: 12, color: '#666', textAlign: 'right' }}>
                  {new Date(t.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TicketsMap tickets={tickets.filter(t => !search || (t.customer && t.customer.name && t.customer.name.toLowerCase().includes(search.toLowerCase())))} />
      )}
    </div>
      </div>
    </>
  );
}
