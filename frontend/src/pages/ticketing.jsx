// frontend/src/pages/ticketing.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api.jsx';

const Ticketing = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [userRole, setUserRole] = useState('');

  const [createForm, setCreateForm] = useState({
    customerId: '',
    title: '',
    description: '',
    priority: 'medium',
    tags: ''
  });

  const [assignForm, setAssignForm] = useState({
    assignedTo: '',
    notes: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
    fetchTickets();
    fetchCustomers();
    fetchTechnicians();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await API.get('/api/tickets');
      setTickets(Array.isArray(data) ? data : (data.tickets || []));
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await API.get('/api/users?role=customer');
      setCustomers(Array.isArray(data) ? data : (data.users || []));
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const data = await API.get('/api/users?role=technician');
      setTechnicians(Array.isArray(data) ? data : (data.users || []));
    } catch (err) {
      console.error('Error fetching technicians:', err);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/tickets', {
        customer: createForm.customerId,
        title: createForm.title,
        description: createForm.description,
        priority: createForm.priority,
        tags: createForm.tags
      });
      alert('Ticket created successfully!');
      setShowCreateModal(false);
      setCreateForm({ customerId: '', title: '', description: '', priority: 'medium', tags: '' });
      fetchTickets();
    } catch (err) {
      console.error('Error creating ticket:', err);
      alert('Failed to create ticket: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAssignTicket = async (ticketId) => {
    try {
      await API.patch(`/api/tickets/${ticketId}/assign`, {
        assignedTo: assignForm.assignedTo,
        notes: assignForm.notes
      });
      alert('Ticket assigned successfully!');
      setViewing(null);
      setAssignForm({ assignedTo: '', notes: '' });
      fetchTickets();
    } catch (err) {
      console.error('Error assigning ticket:', err);
      alert('Failed to assign ticket: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      await API.patch(`/api/tickets/${ticketId}/resolve`, {
        resolutionSummary: 'Issue resolved'
      });
      alert('Ticket marked as resolved!');
      fetchTickets();
    } catch (err) {
      console.error('Error resolving ticket:', err);
      alert('Failed to resolve ticket: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      await API.patch(`/api/tickets/${ticketId}/close`, {});
      alert('Ticket closed successfully!');
      fetchTickets();
    } catch (err) {
      console.error('Error closing ticket:', err);
      alert('Failed to close ticket: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': '#ff9800',
      'assigned': '#2196f3',
      'in_progress': '#9c27b0',
      'waiting_customer': '#ffeb3b',
      'on_site': '#00bcd4',
      'resolved': '#4caf50',
      'closed': '#9e9e9e'
    };
    return colors[status] || '#666';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      'open': '#fff3e0',
      'assigned': '#e3f2fd',
      'in_progress': '#f3e5f5',
      'waiting_customer': '#fffde7',
      'on_site': '#e0f7fa',
      'resolved': '#e8f5e9',
      'closed': '#f5f5f5'
    };
    return colors[status] || '#f5f5f5';
  };

  const formatStatus = (status) => {
    const statusMap = {
      'open': 'Open',
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'waiting_customer': 'Waiting Customer',
      'on_site': 'On Site',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return statusMap[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#4caf50',
      'medium': '#ff9800',
      'high': '#f44336',
      'critical': '#d32f2f'
    };
    return colors[priority] || '#666';
  };

  const filtered = tickets.filter(ticket => 
    statusFilter === 'all' || ticket.status === statusFilter
  );

  const isAdminOrCSR = userRole === 'admin' || userRole === 'csr';

  const statusStats = [
    { status: 'open', count: tickets.filter(t => t.status === 'open').length },
    { status: 'assigned', count: tickets.filter(t => t.status === 'assigned').length },
    { status: 'in_progress', count: tickets.filter(t => t.status === 'in_progress').length },
    { status: 'resolved', count: tickets.filter(t => t.status === 'resolved').length },
    { status: 'closed', count: tickets.filter(t => t.status === 'closed').length }
  ];

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <div style={{ fontSize: '18px', color: '#666' }}>Loading tickets...</div>
    </div>
  );

  return (
    <div style={{
      padding: '20px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ 
          color: '#2d7a3e', 
          margin: '0 0 8px 0', 
          fontSize: 'clamp(24px, 5vw, 36px)', 
          fontWeight: '800' 
        }}>
          Ticketing System
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Manage customer issues and complaints
        </p>
      </div>

      {/* Create Button */}
      {isAdminOrCSR && (
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            marginBottom: '20px',
            padding: '12px 24px',
            background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
            color: '#2d7a3e',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          + Create New Ticket
        </button>
      )}

      {/* Status Filter Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {statusStats.map((stat) => (
          <div
            key={stat.status}
            onClick={() => setStatusFilter(stat.status)}
            style={{
              background: getStatusBgColor(stat.status),
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              border: `2px solid ${statusFilter === stat.status ? getStatusColor(stat.status) : 'transparent'}`,
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: '800', color: getStatusColor(stat.status) }}>
              {stat.count}
            </div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', fontWeight: '500' }}>
              {formatStatus(stat.status)}
            </div>
          </div>
        ))}
        <div
          onClick={() => setStatusFilter('all')}
          style={{
            background: statusFilter === 'all' ? '#e8f5e9' : '#f0f0f0',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            border: `2px solid ${statusFilter === 'all' ? '#2d7a3e' : 'transparent'}`
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>
            {tickets.length}
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', fontWeight: '500' }}>
            All
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 1.5fr 1fr 1fr 100px 100px 120px 100px',
          gap: '12px',
          padding: '14px 16px',
          background: '#2d7a3e',
          fontWeight: '600',
          color: 'white',
          fontSize: '11px',
          textTransform: 'uppercase'
        }}>
          <div>Ticket #</div>
          <div>Title</div>
          <div>Customer</div>
          <div>Assigned To</div>
          <div>Tags</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Actions</div>
        </div>

        {filtered.length > 0 ? (
          filtered.map((ticket) => (
            <div
              key={ticket._id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1.5fr 1fr 1fr 100px 100px 120px 100px',
                gap: '12px',
                padding: '14px 16px',
                borderBottom: '1px solid #e8e8e8',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setViewing(ticket)}
            >
              <div style={{ fontWeight: '600', color: '#2d7a3e', fontSize: '12px' }}>
                {ticket.ticketNumber || ticket._id.slice(-6)}
              </div>
              <div style={{ fontWeight: '500', color: '#333', fontSize: '13px' }}>
                {ticket.title}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {ticket.customer?.name || 'N/A'}
              </div>
              <div style={{ fontSize: '12px', color: ticket.assignedTo ? '#333' : '#888' }}>
                {ticket.assignedTo?.name || 'Unassigned'}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {ticket.tags || '-'}
              </div>
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: '600',
                  background: getStatusBgColor(ticket.status),
                  color: getStatusColor(ticket.status)
                }}>
                  {formatStatus(ticket.status)}
                </span>
              </div>
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: getPriorityColor(ticket.priority),
                  textTransform: 'capitalize'
                }}>
                  {ticket.priority}
                </span>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                {isAdminOrCSR && !ticket.assignedTo && ticket.status === 'open' && (
                  <button
                    onClick={() => setViewing(ticket)}
                    style={{
                      padding: '6px 12px',
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Assign
                  </button>
                )}
                {ticket.assignedTo && (ticket.status === 'in_progress' || ticket.status === 'assigned') && (
                  <button
                    onClick={() => handleResolveTicket(ticket._id)}
                    style={{
                      padding: '6px 12px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Resolve
                  </button>
                )}
                {ticket.status === 'resolved' && isAdminOrCSR && (
                  <button
                    onClick={() => handleCloseTicket(ticket._id)}
                    style={{
                      padding: '6px 12px',
                      background: '#9e9e9e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No tickets found
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#2d7a3e' }}>Create New Ticket</h2>
            <form onSubmit={handleCreateTicket}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '12px', fontWeight: '600' }}>
                  Customer *
                </label>
                <select
                  value={createForm.customerId}
                  onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Customer</option>
                  {customers.map(cust => (
                    <option key={cust._id} value={cust._id}>
                      {cust.name} ({cust.email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '12px', fontWeight: '600' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  required
                  placeholder="Brief description of the issue"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '12px', fontWeight: '600' }}>
                  Description *
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  required
                  placeholder="Detailed description of the issue"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '12px', fontWeight: '600' }}>
                  Priority
                </label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '12px', fontWeight: '600' }}>
                  Tags
                </label>
                <input
                  type="text"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                  placeholder="e.g., internet, slow connection, no signal"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#f5f5f5',
                    color: '#666',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#43e97b',
                    color: '#2d7a3e',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View/Assign Modal */}
      {viewing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: '0', color: '#2d7a3e' }}>Ticket #{viewing.ticketNumber || viewing._id.slice(-6)}</h2>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: getStatusBgColor(viewing.status),
                  color: getStatusColor(viewing.status),
                  marginTop: '8px'
                }}>
                  {formatStatus(viewing.status)}
                </span>
              </div>
              <button
                onClick={() => setViewing(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                X
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '16px' }}>{viewing.title}</h3>
              <p style={{ margin: '0', color: '#666', fontSize: '13px' }}>{viewing.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Customer</p>
                <p style={{ margin: '0', color: '#333', fontSize: '14px' }}>{viewing.customer?.name}</p>
                <p style={{ margin: '0', color: '#888', fontSize: '12px' }}>{viewing.customer?.phone}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Assigned To</p>
                <p style={{ margin: '0', color: '#333', fontSize: '14px' }}>
                  {viewing.assignedTo?.name || 'Not assigned'}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Priority</p>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: getPriorityColor(viewing.priority),
                  textTransform: 'capitalize'
                }}>
                  {viewing.priority}
                </span>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Tags</p>
                <p style={{ margin: '0', color: '#333', fontSize: '14px' }}>{viewing.tags || '-'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Created</p>
                <p style={{ margin: '0', color: '#333', fontSize: '14px' }}>
                  {new Date(viewing.createdAt).toLocaleDateString()}
                </p>
              </div>
              {viewing.resolvedAt && (
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Resolved</p>
                  <p style={{ margin: '0', color: '#333', fontSize: '14px' }}>
                    {new Date(viewing.resolvedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Assign Section */}
            {isAdminOrCSR && !viewing.assignedTo && viewing.status === 'open' && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Assign to Technician</h4>
                <select
                  value={assignForm.assignedTo}
                  onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '14px',
                    marginBottom: '12px'
                  }}
                >
                  <option value="">Select Technician</option>
                  {technicians.map(tech => (
                    <option key={tech._id} value={tech._id}>
                      {tech.name} ({tech.specialization || 'General'})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssignTicket(viewing._id)}
                  disabled={!assignForm.assignedTo}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: assignForm.assignedTo ? '#2196f3' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: assignForm.assignedTo ? 'pointer' : 'not-allowed'
                  }}
                >
                  Assign Ticket
                </button>
              </div>
            )}

            {/* Resolution Section */}
            {viewing.assignedTo && (viewing.status === 'in_progress' || viewing.status === 'assigned') && (
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => handleResolveTicket(viewing._id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Mark as Resolved
                </button>
              </div>
            )}

            {/* Close Section */}
            {viewing.status === 'resolved' && isAdminOrCSR && (
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => handleCloseTicket(viewing._id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#9e9e9e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close Ticket (Confirm with Customer)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ticketing;
