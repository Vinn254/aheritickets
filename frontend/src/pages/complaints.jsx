// frontend/src/pages/complaints.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authcontext';
import API from '../utils/api';

const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: '2px solid #43e97b',
  fontSize: 14,
  background: '#f9fff9',
  boxSizing: 'border-box'
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer'
};

const complaintTypes = [
  { value: 'no_internet', label: 'No Internet' },
  { value: 'router_not_working', label: 'Router Not Working' },
  { value: 'cable_not_working', label: 'Cable Not Working' },
  { value: 'radio_faulty', label: 'Radio Faulty' },
  { value: 'radio_line_of_sight', label: 'Radio Fallen from Line of Sight' },
  { value: 'payment_not_picking', label: 'Payment Not Picking' },
  { value: 'slow_connection', label: 'Slow Connection' },
  { value: 'other', label: 'Other Issue' }
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: '#4caf50' },
  { value: 'medium', label: 'Medium', color: '#ff9800' },
  { value: 'high', label: 'High', color: '#f44336' },
  { value: 'critical', label: 'Critical', color: '#9c27b0' }
];

export default function Complaints() {
  const { user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    description: '',
    complaintType: 'no_internet',
    priority: 'medium'
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignTechId, setAssignTechId] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersRes, techniciansRes, ticketsRes] = await Promise.all([
        API.get('/api/users?role=customer'),
        API.get('/api/users?role=technician'),
        API.get('/api/tickets')
      ]);
      setCustomers(customersRes.users || customersRes || []);
      setTechnicians(techniciansRes.users || techniciansRes || []);
      setTickets(ticketsRes.tickets || ticketsRes || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/tickets', formData);
      alert('Complaint ticket created successfully!');
      setShowForm(false);
      setFormData({
        customerId: '',
        title: '',
        description: '',
        complaintType: 'no_internet',
        priority: 'medium'
      });
      fetchData();
    } catch (err) {
      alert('Error creating ticket: ' + (err.message || 'Failed'));
    }
  };

  const handleAssign = async () => {
    if (!selectedTicket || !assignTechId) return;
    try {
      await API.patch(`/api/tickets/${selectedTicket._id}/assign`, { technicianId: assignTechId });
      alert('Technician assigned successfully!');
      setAssignTechId('');
      fetchData();
    } catch (err) {
      alert('Error assigning technician: ' + (err.message || 'Failed'));
    }
  };

  const handleAddUpdate = async () => {
    if (!selectedTicket || !updateMessage) return;
    try {
      await API.post(`/api/tickets/${selectedTicket._id}/updates`, { 
        message: updateMessage,
        status: 'in_progress'
      });
      setUpdateMessage('');
      fetchData();
    } catch (err) {
      alert('Error adding update: ' + (err.message || 'Failed'));
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket || !resolutionSummary) return;
    try {
      await API.patch(`/api/tickets/${selectedTicket._id}/resolve`, { 
        resolutionSummary,
        resolutionCategory: formData.complaintType
      });
      alert('Ticket resolved!');
      setResolutionSummary('');
      fetchData();
    } catch (err) {
      alert('Error resolving ticket: ' + (err.message || 'Failed'));
    }
  };

  const handleClose = async () => {
    if (!selectedTicket) return;
    try {
      await API.patch(`/api/tickets/${selectedTicket._id}/close`);
      alert('Ticket closed successfully!');
      fetchData();
    } catch (err) {
      alert('Error closing ticket: ' + (err.message || 'Failed'));
    }
  };

  const getComplaintLabel = (type) => {
    const found = complaintTypes.find(c => c.value === type);
    return found ? found.label : type;
  };

  const getPriorityColor = (priority) => {
    const found = priorityOptions.find(p => p.value === priority);
    return found ? found.color : '#666';
  };

  const filteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  const canClose = selectedTicket && ['admin', 'csr'].includes(user?.role) && selectedTicket.status === 'resolved';
  const canAssign = selectedTicket && ['admin', 'csr'].includes(user?.role) && ['open', 'assigned'].includes(selectedTicket.status);
  const canResolve = selectedTicket && (user?.role === 'technician' || ['admin', 'csr'].includes(user?.role)) && selectedTicket.status !== 'closed';

  return (
    <div style={{ padding: 24, background: 'linear-gradient(135deg, #e8f5e9 0%, #f0f7f0 100%)', minHeight: '100vh', marginTop: 56 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: '#186a3b', margin: 0, fontSize: 28, fontWeight: 700 }}>
          Complaint Tickets
        </h1>
        {['admin', 'csr'].includes(user?.role) && (
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(67, 233, 123, 0.4)'
            }}
          >
            {showForm ? 'Cancel' : '+ Create Ticket'}
          </button>
        )}
      </div>

      {/* Create Ticket Form */}
      {showForm && (
        <div style={{ 
          marginBottom: 24, 
          padding: 24, 
          background: '#fff', 
          borderRadius: 12, 
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '2px solid #43e97b'
        }}>
          <h2 style={{ color: '#186a3b', marginBottom: 20 }}>Create New Complaint Ticket</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Customer *</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  required
                  style={selectStyle}
                >
                  <option value="">Select Customer</option>
                  {customers.map(cust => (
                    <option key={cust._id} value={cust._id}>{cust.name} - {cust.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Complaint Type *</label>
                <select
                  value={formData.complaintType}
                  onChange={(e) => setFormData({ ...formData, complaintType: e.target.value })}
                  required
                  style={selectStyle}
                >
                  {complaintTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Title *</label>
                <input
                  type="text"
                  placeholder="Enter ticket title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={selectStyle}
                >
                  {priorityOptions.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Description *</label>
                <textarea
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button 
                type="submit"
                style={{
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Create Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {['all', 'open', 'assigned', 'in_progress', 'resolved', 'closed'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 6,
              background: filterStatus === status ? '#43e97b' : '#fff',
              color: filterStatus === status ? '#fff' : '#2d7a3e',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Tickets Table */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: '#186a3b', marginBottom: 16 }}>Tickets ({filteredTickets.length})</h3>
            {filteredTickets.length === 0 ? (
              <p style={{ color: '#666' }}>No tickets found.</p>
            ) : (
              <div style={{ maxHeight: 500, overflow: 'auto' }}>
                {filteredTickets.map(ticket => (
                  <div
                    key={ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      padding: 16,
                      marginBottom: 8,
                      background: selectedTicket?._id === ticket._id ? '#e8f5e9' : '#f9f9f9',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: selectedTicket?._id === ticket._id ? '2px solid #43e97b' : '2px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: '#2d7a3e' }}>{ticket.title}</span>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 4, 
                        background: getPriorityColor(ticket.priority), 
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600
                      }}>
                        {ticket.priority?.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                      {getComplaintLabel(ticket.complaintType)}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      Customer: {ticket.customer?.name || 'N/A'}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 4, 
                        background: ticket.status === 'closed' ? '#4caf50' : ticket.status === 'resolved' ? '#ff9800' : '#2196f3', 
                        color: '#fff',
                        fontSize: 11
                      }}>
                        {ticket.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ticket Details */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            {selectedTicket ? (
              <>
                <h3 style={{ color: '#186a3b', marginBottom: 16 }}>Ticket Details</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                    <span style={{ color: '#666' }}>Title:</span>
                    <span style={{ fontWeight: 600 }}>{selectedTicket.title}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                    <span style={{ color: '#666' }}>Complaint Type:</span>
                    <span>{getComplaintLabel(selectedTicket.complaintType)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                    <span style={{ color: '#666' }}>Customer:</span>
                    <span>{selectedTicket.customer?.name} ({selectedTicket.customer?.phone})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                    <span style={{ color: '#666' }}>Assigned To:</span>
                    <span>{selectedTicket.assignedTo?.name || 'Not Assigned'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                    <span style={{ color: '#666' }}>Status:</span>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: 4, 
                      background: selectedTicket.status === 'closed' ? '#4caf50' : selectedTicket.status === 'resolved' ? '#ff9800' : '#2196f3', 
                      color: '#fff'
                    }}>
                      {selectedTicket.status?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                    <span style={{ color: '#666', display: 'block', marginBottom: 4 }}>Description:</span>
                    <p style={{ margin: 0 }}>{selectedTicket.description}</p>
                  </div>
                  {selectedTicket.resolutionSummary && (
                    <div style={{ borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                      <span style={{ color: '#666', display: 'block', marginBottom: 4 }}>Resolution:</span>
                      <p style={{ margin: 0, color: '#2d7a3e' }}>{selectedTicket.resolutionSummary}</p>
                    </div>
                  )}
                </div>

                {/* Assign Technician */}
                {canAssign && (
                  <div style={{ marginTop: 20, padding: 16, background: '#e8f5e9', borderRadius: 8 }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#2d7a3e' }}>Assign Technician</h4>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select
                        value={assignTechId}
                        onChange={(e) => setAssignTechId(e.target.value)}
                        style={{ flex: 1, ...selectStyle }}
                      >
                        <option value="">Select Technician</option>
                        {technicians.map(tech => (
                          <option key={tech._id} value={tech._id}>{tech.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssign}
                        disabled={!assignTechId}
                        style={{
                          padding: '8px 16px',
                          background: '#2196f3',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          cursor: assignTechId ? 'pointer' : 'not-allowed',
                          opacity: assignTechId ? 1 : 0.6
                        }}
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                )}

                {/* Add Update */}
                {canResolve && (
                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#2d7a3e' }}>Add Update</h4>
                    <textarea
                      value={updateMessage}
                      onChange={(e) => setUpdateMessage(e.target.value)}
                      placeholder="Enter update message..."
                      rows={3}
                      style={{ ...inputStyle, marginBottom: 8 }}
                    />
                    {selectedTicket.status !== 'resolved' && (
                      <>
                        <textarea
                          value={resolutionSummary}
                          onChange={(e) => setResolutionSummary(e.target.value)}
                          placeholder="Resolution summary (if resolving)..."
                          rows={2}
                          style={{ ...inputStyle, marginBottom: 8 }}
                        />
                        <button
                          onClick={handleResolve}
                          style={{
                            padding: '8px 16px',
                            background: '#ff9800',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            marginRight: 8
                          }}
                        >
                          Mark as Resolved
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleAddUpdate}
                      disabled={!updateMessage}
                      style={{
                        padding: '8px 16px',
                        background: '#43e97b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        cursor: updateMessage ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Add Update
                    </button>
                  </div>
                )}

                {/* Close Ticket */}
                {canClose && (
                  <div style={{ marginTop: 20 }}>
                    <button
                      onClick={handleClose}
                      style={{
                        padding: '12px 24px',
                        background: '#4caf50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Close Ticket (Confirm Resolved)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                Select a ticket to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
