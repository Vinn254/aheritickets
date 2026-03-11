// src/pages/MyTickets.js
import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';

  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    API.get('/tickets').then(res => {
      let payload = [];
      if (res && res.data && Array.isArray(res.data.tickets)) {
        payload = res.data.tickets;
      }
      setTickets(payload);
    }).catch(console.error);
  }, [location]);

  // Add responsive styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .my-tickets-container {
          padding: 12px !important;
        }
      }
      @media (max-width: 480px) {
        .my-tickets-container {
          padding: 8px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <>
  <div className="my-tickets-container" style={{ padding: 16, marginTop: 4 }}>
        <h2 style={{ color: '#2d7a3e' }}>My Tickets</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {tickets.length === 0 ? (
            <p style={{ color: '#2d7a3e', fontWeight: 600, fontSize: 18, textAlign: 'center', marginTop: 40 }}>No tickets</p>
          ) : tickets.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map(t => (
            <div key={t._id} style={{ background: 'white', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><strong>{t.title || t.issue}</strong><div style={{ color: '#666' }}>{t.description?.slice(0,120)}</div></div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: t.status === 'done' ? 'green' : '#2d7a3e', fontWeight: 700 }}>{t.status ? t.status.toUpperCase() : 'OPEN'}</div>
                  <button onClick={() => navigate(`/tickets/${t._id}`)} style={{ marginTop: 8, padding: '6px 10px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: 6 }}>
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
