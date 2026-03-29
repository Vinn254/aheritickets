// src/pages/marketingleads.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import API from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketingLeads() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    plusCode: '',
    location: '',
    numberOfUnits: 0,
    serviceProviders: '',
    outreachFeedback: '',
    prospectDetails: '',
    contactPerson: '',
    feedbackNotes: '',
    status: 'new',
    dateVisited: '',
    assignedPersonnel: ''
  });

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await API.get(`/api/marketing/leads?${params.toString()}`);
      setLeads(res.data.leads);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await API.put(`/api/marketing/leads/${editingLead._id}`, formData);
      } else {
        await API.post('/api/marketing/leads', formData);
      }
      setShowModal(false);
      setEditingLead(null);
      resetForm();
      fetchLeads();
    } catch (err) {
      console.error('Error saving lead:', err);
      alert('Failed to save lead');
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      plusCode: lead.plusCode || '',
      location: lead.location || '',
      numberOfUnits: lead.numberOfUnits || 0,
      serviceProviders: lead.serviceProviders || '',
      outreachFeedback: lead.outreachFeedback || '',
      prospectDetails: lead.prospectDetails || '',
      contactPerson: lead.contactPerson || '',
      feedbackNotes: lead.feedbackNotes || '',
      status: lead.status || 'new',
      dateVisited: lead.dateVisited ? lead.dateVisited.split('T')[0] : '',
      assignedPersonnel: lead.assignedPersonnel || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await API.delete(`/api/marketing/leads/${id}`);
      fetchLeads();
    } catch (err) {
      console.error('Error deleting lead:', err);
      alert('Failed to delete lead');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      plusCode: '',
      location: '',
      numberOfUnits: 0,
      serviceProviders: '',
      outreachFeedback: '',
      prospectDetails: '',
      contactPerson: '',
      feedbackNotes: '',
      status: 'new',
      dateVisited: '',
      assignedPersonnel: ''
    });
  };

  const openNewLeadModal = () => {
    resetForm();
    setEditingLead(null);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      new: '#2196F3',
      contacted: '#FF9800',
      interested: '#4CAF50',
      not_interested: '#F44336',
      converted: '#9C27B0',
      follow_up: '#00BCD4'
    };
    return colors[status] || '#757575';
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'New',
      contacted: 'Contacted',
      interested: 'Interested',
      not_interested: 'Not Interested',
      converted: 'Converted',
      follow_up: 'Follow Up'
    };
    return labels[status] || status;
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1b5e20', fontSize: '24px', fontWeight: '700' }}>Marketing Leads</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Track and manage your marketing leads</p>
        </div>
        <button
          onClick={openNewLeadModal}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #43a047 0%, #2d7a3e 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>+</span> Add New Lead
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 15px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            width: '250px',
            fontSize: '14px'
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 15px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="interested">Interested</option>
          <option value="not_interested">Not Interested</option>
          <option value="converted">Converted</option>
          <option value="follow_up">Follow Up</option>
        </select>
      </div>

      {/* Leads Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading leads...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Contact Person</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Units</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Date Visited</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Assigned To</th>
                <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No leads found</td>
                </tr>
              ) : (
                leads.map((lead, index) => (
                  <motion.tr
                    key={lead._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderBottom: '1px solid #f0f0f0' }}
                  >
                    <td style={{ padding: '15px', fontSize: '14px', fontWeight: '500', color: '#333' }}>{lead.name}</td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>{lead.location}</td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>{lead.contactPerson}</td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>{lead.numberOfUnits}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: 'white',
                        background: getStatusColor(lead.status)
                      }}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>
                      {lead.dateVisited ? new Date(lead.dateVisited).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>{lead.assignedPersonnel}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(lead)}
                        style={{ marginRight: '8px', padding: '6px 12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(lead._id)}
                        style={{ padding: '6px 12px', background: '#F44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
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
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
            >
              <h2 style={{ margin: '0 0 20px 0', color: '#1b5e20', fontSize: '20px' }}>
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Name *</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Plus Code</label>
                    <input
                      name="plusCode"
                      value={formData.plusCode}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Location</label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Number of Units</label>
                    <input
                      name="numberOfUnits"
                      type="number"
                      value={formData.numberOfUnits}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Service Providers</label>
                    <input
                      name="serviceProviders"
                      value={formData.serviceProviders}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Contact Person</label>
                    <input
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} style={inputStyle}>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="not_interested">Not Interested</option>
                      <option value="converted">Converted</option>
                      <option value="follow_up">Follow Up</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Date Visited</label>
                    <input
                      name="dateVisited"
                      type="date"
                      value={formData.dateVisited}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Assigned Personnel</label>
                    <input
                      name="assignedPersonnel"
                      value={formData.assignedPersonnel}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Outreach Feedback</label>
                    <textarea
                      name="outreachFeedback"
                      value={formData.outreachFeedback}
                      onChange={handleInputChange}
                      rows={2}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Prospect Details</label>
                    <textarea
                      name="prospectDetails"
                      value={formData.prospectDetails}
                      onChange={handleInputChange}
                      rows={2}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Feedback Notes</label>
                    <textarea
                      name="feedbackNotes"
                      value={formData.feedbackNotes}
                      onChange={handleInputChange}
                      rows={2}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ padding: '10px 20px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #43a047 0%, #2d7a3e 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    {editingLead ? 'Update Lead' : 'Create Lead'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #ddd',
  fontSize: '14px',
  boxSizing: 'border-box'
};