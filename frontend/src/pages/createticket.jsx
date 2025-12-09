
import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker';

const inputStyle = { width: '100%', padding: 10, marginBottom: 10, borderRadius: 6, border: '1px solid #ddd' };
const primaryBtn = { padding: '10px 14px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' };

export default function CreateTicket() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [location, setLocation] = useState(null);
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-30px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes successPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      @keyframes checkmark {
        0% { transform: scale(0) rotate(45deg); opacity: 0; }
        50% { transform: scale(1.2) rotate(45deg); opacity: 1; }
        100% { transform: scale(1) rotate(45deg); opacity: 1; }
      }
      .create-form {
        animation: fadeIn 0.4s ease-out;
      }
      .create-input {
        animation: slideInLeft 0.3s ease-out both;
        animation-delay: calc(var(--index) * 0.05s);
      }
      .success-message {
        animation: successPulse 1s ease-in-out infinite;
      }
      .checkmark {
        animation: checkmark 0.5s ease-out 0.2s both;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tickets', { title, description, priority, location });
      setMsg('Ticket created successfully!');
      setSuccess(true);
        // Instead of redirecting, go back to dashboard and force reload
        setTimeout(() => {
          navigate('/dashboard', { state: { refresh: true } });
        }, 1200);
    } catch (err) {
        setMsg(err.message || 'Failed to create ticket');
      setSuccess(false);
    }
  };

  // Add responsive styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .create-ticket-container {
          padding: 16px !important;
          overflow-x: auto;
        }
        .create-ticket-form {
          padding: 20px !important;
          margin: 0 !important;
          min-width: 320px;
        }
        .create-ticket-form h2 {
          font-size: 24px !important;
          margin-bottom: 12px !important;
        }
        .create-ticket-form input,
        .create-ticket-form textarea,
        .create-ticket-form select {
          font-size: 16px !important;
          padding: 12px !important;
        }
        .create-ticket-form button {
          width: 100% !important;
          padding: 14px !important;
          font-size: 16px !important;
        }
      }
      @media (max-width: 480px) {
        .create-ticket-container {
          padding: 12px !important;
        }
        .create-ticket-form {
          padding: 16px !important;
          border-radius: 8px !important;
        }
        .create-ticket-form h2 {
          font-size: 20px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <>
      <div className="create-ticket-container" style={{ padding: 24, minHeight: '100vh', background: 'linear-gradient(135deg, #eafff3 0%, #f7fff7 100%)' }}>
        <div className="create-ticket-form" style={{ maxWidth: 700, width: '100%', background: 'white', padding: 28, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', margin: '0 auto' }}>
          <h2 style={{ color: '#2d7a3e', marginBottom: 16 }}>Create a Ticket</h2>
          {msg && <div style={{ marginBottom: 12, color: success ? 'green' : 'red', fontWeight: 600, padding: '8px 12px', borderRadius: 6, background: success ? '#d4edda' : '#f8d7da', border: `1px solid ${success ? '#c3e6cb' : '#f5c6cb'}` }}>{msg}</div>}
          <form onSubmit={submit}>
            <input placeholder="Short title" value={title} onChange={(e)=>setTitle(e.target.value)} required style={inputStyle} />
            <textarea placeholder="Describe the issue" value={description} onChange={(e)=>setDescription(e.target.value)} required rows={6} style={{ ...inputStyle, resize: 'vertical' }} />
            <select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...inputStyle, marginBottom: 20 }} required>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>
            <LocationPicker location={location} setLocation={setLocation} />
            <button type="submit" style={primaryBtn}>Submit</button>
          </form>
        </div>
      </div>
    </>
  );
}
