// src/pages/TicketDetails.js
import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import MapDisplay from '../components/MapDisplay';

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [techs, setTechs] = useState([]);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      const res = await API.get(`/tickets/${id}`);
      console.log('DEBUG: ticketdetails API response', res);
      setTicket(res.data?.ticket || res.ticket || res.data || res);
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    fetch();
    if (role === 'csr') {
      API.get('/users?role=technician').then(r => {
        const payload = r.users || r.data?.users || r.data || [];
        console.log('TICKET DETAILS: /users?role=technician API response', r);
        console.log('TICKET DETAILS: extracted techs', payload);
        setTechs(payload);
      }).catch((err)=>{
        console.error('TICKET DETAILS: error fetching technicians', err);
        setTechs([]);
      });
    }
    // eslint-disable-next-line
  }, [id]);

  const handleAssign = async (techId) => {
    console.log('ASSIGN TECH: called with techId', techId);
    if (!techId) {
      setMsg('No technician selected');
      return;
    }
    try {
  const res = await API.patch(`/tickets/${id}/assign`, { technicianId: techId });
  console.log('ASSIGN TECH: API response', res);
  setTicket(res.ticket || res.data || res);
  setMsg('Assigned');
    } catch (err) {
      console.error('ASSIGN TECH: error', err);
      setMsg(err.response?.data?.message || err.message || 'Failed');
    }
  };

  const addUpdate = async () => {
    try {
      const res = await API.post(`/tickets/${id}/updates`, { message: note });
      console.log('ADD UPDATE: API response', res);
      setTicket(res.ticket || res.data || res);
      setNote('');
      setMsg('Update added');
    } catch (err) {
      console.error('ADD UPDATE: error', err);
      setMsg(err.response?.data?.message || err.message || 'Failed to add update');
    }
  };

  const resolveTicket = async () => {
    try {
      const res = await API.patch(`/tickets/${id}/resolve`, {});
      console.log('RESOLVE TICKET: API response', res);
      setTicket(res.ticket || res.data || res);
      setMsg('Resolved');
    } catch (err) {
      console.error('RESOLVE TICKET: error', err);
      setMsg(err.response?.data?.message || err.message || 'Failed to resolve');
    }
  };

  const closeTicket = async () => {
    try {
      const res = await API.patch(`/tickets/${id}/close`, {});
      console.log('CLOSE TICKET: API response', res);
      setTicket(res.ticket || res.data || res);
      setMsg('Closed');
    } catch (err) {
      console.error('CLOSE TICKET: error', err);
      setMsg(err.response?.data?.message || err.message || 'Failed to close');
    }
  };

  // Add responsive styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .ticket-details-container {
          padding: 16px !important;
        }
        .ticket-details-card {
          padding: 16px !important;
        }
        .ticket-details-flex {
          flex-direction: column !important;
          gap: 16px !important;
        }
      }
      @media (max-width: 480px) {
        .ticket-details-container {
          padding: 12px !important;
        }
        .ticket-details-card {
          padding: 12px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (!ticket) return <><p style={{padding:20}}>Loading...</p></>;

  return (
    <>
      <div className="ticket-details-container" style={{ padding: 24 }}>
        <button onClick={() => navigate('/dashboard')} style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 6, background: '#2d7a3e', color: 'white', border: 'none' }}>Back</button>
        <h2 style={{ color: '#2d7a3e', marginBottom: 8 }}>Ticket Details</h2>
        <div className="ticket-details-card" style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 4px 16px rgba(44,62,80,0.08)', marginBottom: 18, maxWidth: 700 }}>
          <div className="ticket-details-flex" style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <p><strong>Title:</strong> {ticket.title || ticket.issue}</p>
              <p><strong>Description:</strong> {ticket.description}</p>
              <p><strong>Status:</strong> <span style={{ color: ticket.status === 'open' ? '#1e88e5' : ticket.status === 'resolved' ? '#43a047' : '#0b4d1e', fontWeight: 700 }}>{ticket.status}</span></p>
              <p><strong>Priority:</strong> {ticket.priority}</p>
              <p><strong>Assigned to:</strong> {ticket.assignedTo ? (ticket.assignedTo.name || ticket.assignedTo.username) : 'Unassigned'}</p>
              <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
            <div style={{ flex: 1 }}>
              <p><strong>Customer:</strong> {ticket.customer?.name} ({ticket.customer?.email})</p>
              {ticket.customer?.phone && (
                <p><strong>Phone:</strong> {ticket.customer.phone}</p>
              )}
              <p><strong>Created By:</strong> {ticket.createdBy?.name || ticket.createdBy}</p>
              {ticket.assignedTo?.specialization && (
                <p><strong>Technician Specialization:</strong> {ticket.assignedTo.specialization}</p>
              )}
              <p><strong>Updates:</strong> {ticket.updates?.length || 0}</p>
              <p><strong>Status History:</strong> {ticket.statusHistory?.length || 0}</p>
              <div style={{ marginTop: 20 }}>
                <h4>Location</h4>
                <MapDisplay location={ticket.location} />
              </div>
            </div>
          </div>

          {role === 'csr' && ticket.status === 'open' && (
            <div style={{ marginTop: 12 }}>
              <select onChange={(e)=>handleAssign(e.target.value)} defaultValue="" style={{ padding: 8, marginRight: 8 }}>
                <option value="">Assign a technician</option>
                {techs.length === 0 && <option disabled>No technicians available</option>}
                {techs.map(t => <option key={t._id} value={t._id}>{t.name || t.username}</option>)}
              </select>
              {techs.length === 0 && (
                <div style={{ color: 'red', marginTop: 6, fontSize: 14 }}>No technicians available. Please ask admin to add technicians.</div>
              )}
            </div>
          )}

          {role === 'technician' && (
            <div style={{ marginTop: 12 }}>
              <textarea placeholder="Add update..." value={note} onChange={e=>setNote(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6 }} rows={3} />
              <div style={{ marginTop: 8 }}>
                <button onClick={addUpdate} style={primaryBtn}>Add Update</button>
                <button onClick={resolveTicket} style={{ ...primaryBtn, background: '#186a3b', marginLeft: 8 }}>Resolve</button>
              </div>
            </div>
          )}

          {['csr', 'admin'].includes(role) && ticket.status === 'resolved' && (
            <div style={{ marginTop: 12 }}>
              <button onClick={closeTicket} style={primaryBtn}>Close Ticket</button>
            </div>
          )}

          {msg && <div style={{ marginTop: 10, color: msg.includes('Failed') ? 'red' : 'green' }}>{msg}</div>}

          <div style={{ marginTop: 18 }}>
            <h4>Updates</h4>
            {ticket.updates && ticket.updates.length > 0 ? ticket.updates.map((u, idx) => (
              <div key={idx} style={{ padding: 8, borderRadius: 6, background: '#fbfff9', marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: '#333' }}><strong>{u.authorName || u.author?.name}</strong>  {new Date(u.createdAt || u.createdAt || u.timestamp).toLocaleString()}</div>
                <div style={{ color: '#333', marginTop: 6 }}>{u.message || u.note}</div>
              </div>
            )) : <p>No updates yet.</p>}
          </div>
        </div>
      </div>
    </>
  );
}

const primaryBtn = { padding: '8px 12px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' };
