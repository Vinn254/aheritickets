// frontend/src/pages/procurement.jsx
import React, { useEffect, useState, useContext } from 'react';
import API from '../utils/api';
import { AuthContext } from '../context/authcontext';
import { motion } from 'framer-motion';

// Style objects
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', width: '100%' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#1b5e20' };
const cardStyle = { 
  background: 'white', 
  borderRadius: '10px', 
  padding: '20px', 
  marginBottom: '15px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
};
const primaryBtn = { 
  padding: '10px 20px', 
  background: '#2d7a3e', 
  color: 'white', 
  border: 'none', 
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600'
};
const secondaryBtn = { 
  padding: '10px 20px', 
  background: '#666', 
  color: 'white', 
  border: 'none', 
  borderRadius: '6px',
  cursor: 'pointer',
  marginRight: '10px'
};
const rejectBtn = { 
  padding: '10px 20px', 
  background: '#d32f2f', 
  color: 'white', 
  border: 'none', 
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600'
};

export default function Procurement() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requiredItems, setRequiredItems] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await API.get('/api/installation-requests/procurement');
      setRequests(data);
    } catch (err) {
      console.error('Error fetching procurement requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (request) => {
    setSelectedRequest(request);
    setRequiredItems(request.procurementReview?.requiredItems || '');
    setReviewNotes(request.procurementReview?.reviewNotes || '');
    setShowModal(true);
  };

  const handleReview = async (status) => {
    if (!selectedRequest) return;
    
    try {
      await API.put(`/api/installation-requests/${selectedRequest._id}/procurement-review`, {
        requiredItems,
        reviewNotes,
        status
      });
      setMsg(`Request ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setShowModal(false);
      fetchRequests();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error('Error reviewing request:', err);
      setMsg('Error reviewing request');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending_procurement: { bg: '#fff3e0', color: '#e65100', text: 'Pending Review' },
      procurement_approved: { bg: '#e8f5e9', color: '#2d7a3e', text: 'Approved' },
      rejected_procurement: { bg: '#ffebee', color: '#c62828', text: 'Rejected' }
    };
    const badge = badges[status] || badges.pending_procurement;
    return (
      <span style={{ 
        background: badge.bg, 
        color: badge.color, 
        padding: '4px 12px', 
        borderRadius: '15px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {badge.text}
      </span>
    );
  };

  const filteredRequests = requests.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1b5e20' }}>Procurement Review</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Review installation requirements and approve items
          </p>
        </div>
      </div>

      {msg && (
        <div style={{ 
          padding: '12px', 
          background: msg.includes('Error') ? '#ffebee' : '#e8f5e9',
          color: msg.includes('Error') ? '#c62828' : '#2d7a3e',
          borderRadius: '6px',
          marginBottom: '15px'
        }}>
          {msg}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['all', 'pending_procurement', 'procurement_approved', 'rejected_procurement'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              background: filterStatus === status ? '#2d7a3e' : '#e0e0e0',
              color: filterStatus === status ? 'white' : '#333',
              fontWeight: '500'
            }}
          >
            {status === 'all' ? 'All' : 
             status === 'pending_procurement' ? 'Pending' :
             status === 'procurement_approved' ? 'Approved' : 'Rejected'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No requests found
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {filteredRequests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={cardStyle}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '700', color: '#1b5e20', fontSize: '16px' }}>
                      {request.requestNumber || 'New Request'}
                    </span>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <label style={labelStyle}>Customer</label>
                      <p style={{ margin: 0 }}>{request.customer?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label style={labelStyle}>Installation Type</label>
                      <p style={{ margin: 0, textTransform: 'capitalize' }}>{request.installationType}</p>
                    </div>
                    <div>
                      <label style={labelStyle}>Package</label>
                      <p style={{ margin: 0 }}>{request.package}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <label style={labelStyle}>Requirements (from Admin)</label>
                      <p style={{ margin: 0, color: '#555', background: '#f5f5f5', padding: '10px', borderRadius: '6px' }}>
                        {request.requirements || 'No requirements specified'}
                      </p>
                    </div>
                    <div>
                      <label style={labelStyle}>Tools Needed</label>
                      <p style={{ margin: 0, color: '#555', background: '#f5f5f5', padding: '10px', borderRadius: '6px' }}>
                        {request.tools || 'No tools specified'}
                      </p>
                    </div>
                  </div>

                  {request.procurementReview && (
                    <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        <div>
                          <label style={labelStyle}>Required Items</label>
                          <p style={{ margin: 0 }}>{request.procurementReview.requiredItems || 'Not specified'}</p>
                        </div>
                        <div>
                          <label style={labelStyle}>Reviewed By</label>
                          <p style={{ margin: 0 }}>{request.procurementReview.reviewedBy?.name || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {request.status === 'pending_procurement' && (
                    <button 
                      onClick={() => openReviewModal(request)}
                      style={primaryBtn}
                    >
                      Review Request
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showModal && (
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
          >
            <h3 style={{ margin: '0 0 20px 0', color: '#1b5e20' }}>Review Installation Request</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Request Details</label>
              <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
                <p><strong>Customer:</strong> {selectedRequest?.customer?.name}</p>
                <p><strong>Type:</strong> {selectedRequest?.installationType}</p>
                <p><strong>Package:</strong> {selectedRequest?.package}</p>
                <p><strong>Requirements:</strong> {selectedRequest?.requirements}</p>
                <p><strong>Tools:</strong> {selectedRequest?.tools}</p>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Required Items *</label>
              <textarea
                value={requiredItems}
                onChange={(e) => setRequiredItems(e.target.value)}
                placeholder="List the items/materials needed for this installation..."
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Review Notes</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Additional notes..."
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={secondaryBtn}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleReview('rejected')}
                style={rejectBtn}
              >
                Reject
              </button>
              <button 
                onClick={() => handleReview('approved')}
                style={primaryBtn}
              >
                Approve
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}