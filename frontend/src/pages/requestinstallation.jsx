// src/pages/requestinstallation.jsx
import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RequestInstallation() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState(null);

  const packages = {
    fiber: ['10Mbps', '15Mbps', '20Mbps'],
    wireless: ['10Mbps', '15Mbps', '20Mbps']
  };

  const [formData, setFormData] = useState({
    installationType: 'fiber',
    package: 'fiber' in packages ? packages.fiber[0] : '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await API.get('/api/installation-requests/my-requests');
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location.trim()) {
      alert('Please enter a location');
      return;
    }

    try {
      await API.post('/api/installation-requests', {
        installationType: formData.installationType,
        package: formData.package,
        location: formData.location,
        description: formData.description
      });

      alert('Installation request submitted successfully!');
      setFormData({ installationType: 'fiber', package: 'fiber' in packages ? packages.fiber[0] : '', location: '', description: '' });
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      console.error('Error creating request:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      alert(`Failed to submit request: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this request?')) return;
    try {
      await API.delete(`/installation-requests/${id}`);
      fetchRequests();
      alert('Request deleted');
    } catch (err) {
      console.error(err);
      alert('Failed to delete request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffa500',
      'approved': '#43a047',
      'rejected': '#d32f2f',
      'quoted': '#2196f3'
    };
    return colors[status] || '#999';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      'pending': '#fff3e0',
      'approved': '#e8f5e9',
      'rejected': '#ffebee',
      'quoted': '#e3f2fd'
    };
    return colors[status] || '#f5f5f5';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{
      padding: '20px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eafff3 0%, #f7fff7 100%)',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px', textAlign: 'center' }}
      >
        <h1 style={{ 
          color: '#2d7a3e', 
          margin: '0 0 8px 0', 
          fontSize: 'clamp(24px, 5vw, 36px)', 
          fontWeight: '800',
          textShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          Installation Requests
        </h1>
        <p style={{ 
          color: '#4a4a4a', 
          fontSize: 'clamp(14px, 3vw, 16px)', 
          marginTop: '8px', 
          opacity: 0.8,
          margin: '8px 0 0 0'
        }}>
          Request a new fiber or wireless installation
        </p>
      </motion.div>

      {/* Create Request Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setShowForm(!showForm)}
        style={{
          marginBottom: '24px',
          padding: '12px 24px',
          background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
          color: '#2d7a3e',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)',
          transition: 'all 0.3s ease'
        }}
        whileHover={{ transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(67, 233, 123, 0.4)' }}
      >
        + New Installation Request
      </motion.button>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '2px solid #43e97b'
          }}
        >
          <h2 style={{ color: '#2d7a3e', margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700' }}>
            Request Installation
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                Installation Type *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {['fiber', 'wireless'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, installationType: type, package: packages[type][0] });
                    }}
                    style={{
                      padding: '12px',
                      background: formData.installationType === type ? '#43e97b' : '#f5f5f5',
                      color: formData.installationType === type ? '#2d7a3e' : '#666',
                      border: `2px solid ${formData.installationType === type ? '#43e97b' : '#eee'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textTransform: 'capitalize'
                    }}
                  >
                                        {type === 'fiber' ? 'Fiber' : 'Wireless'} {type}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                Package *
              </label>
              <select
                value={formData.package}
                onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid #43e97b',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                {packages[formData.installationType].map(pkg => (
                  <option key={pkg} value={pkg}>{pkg}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., 123 Main Street, City"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid #43e97b',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                Additional Details
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Any additional information about your installation needs..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid #43e97b',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '80px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '12px',
                  background: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '12px',
                  background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                  color: '#2d7a3e',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Submit Request
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Requests List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}
      >
        {requests.length > 0 ? (
          requests.map((req) => (
            <motion.div
              key={req._id}
              variants={cardVariants}
              whileHover={{ transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
              onClick={() => setViewing(req)}
              style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: `2px solid ${getStatusBgColor(req.status)}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                background: getStatusBgColor(req.status),
                padding: '16px 20px',
                borderBottom: `4px solid ${getStatusColor(req.status)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, color: '#2d7a3e', fontSize: '18px', fontWeight: '700' }}>
                  {req.requestNumber}
                </h3>
                <div style={{
                  background: getStatusColor(req.status),
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'capitalize',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {req.status}
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Type & Package</p>
                  <p style={{ margin: 0, color: '#2d7a3e', fontSize: '14px', fontWeight: '700', textTransform: 'capitalize' }}>
                    {req.installationType} - {req.package}
                  </p>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Location</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                    {req.location || 'Not specified'}
                  </p>
                </div>

                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Requested</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                    {new Date(req.requestedDate).toLocaleDateString()}
                  </p>
                </div>

                {req.quotation && (
                  <div style={{ marginTop: '12px', padding: '8px', background: '#e3f2fd', borderRadius: '6px' }}>
                    <p style={{ margin: 0, color: '#1976d2', fontSize: '12px', fontWeight: '600' }}>
                      Quotation: {req.quotation.quotationNumber}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(req._id);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#ffebee',
                      color: '#d32f2f',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#ffcdd2'}
                    onMouseOut={(e) => e.target.style.background = '#ffebee'}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 20px',
              color: '#999'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>No installation requests yet</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Click "New Installation Request" to get started</p>
          </motion.div>
        )}
      </motion.div>

      {/* Viewing Modal */}
      {viewing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setViewing(null)}
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
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              background: getStatusBgColor(viewing.status),
              padding: '20px',
              borderBottom: `3px solid ${getStatusColor(viewing.status)}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, color: '#2d7a3e' }}>{viewing.requestNumber}</h2>
              <button
                onClick={() => setViewing(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Status</p>
                <div style={{
                  display: 'inline-block',
                  background: getStatusColor(viewing.status),
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'capitalize'
                }}>
                  {viewing.status}
                </div>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Installation Type & Package</p>
                <p style={{ margin: 0, color: '#2d7a3e', fontSize: '16px', fontWeight: '700' }}>
                  {viewing.installationType.charAt(0).toUpperCase() + viewing.installationType.slice(1)} - {viewing.package}
                </p>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Location</p>
                <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>
                  {viewing.location}
                </p>
              </div>

              {viewing.description && (
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Additional Details</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '13px', lineHeight: '1.5' }}>
                    {viewing.description}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Requested Date</p>
                <p style={{ margin: 0, color: '#333', fontSize: '14px', fontWeight: '600' }}>
                  {new Date(viewing.requestedDate).toLocaleDateString()}
                </p>
              </div>

              {viewing.quotation && (
                <div style={{ marginBottom: '16px', padding: '12px', background: '#e3f2fd', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#1976d2', fontSize: '12px', fontWeight: '600' }}>✓ Quotation Created</p>
                  <p style={{ margin: 0, color: '#1976d2', fontSize: '14px', fontWeight: '700' }}>
                    {viewing.quotation.quotationNumber}
                  </p>
                  {viewing.quotation.total && (
                    <p style={{ margin: '4px 0 0 0', color: '#1976d2', fontSize: '13px' }}>
                      Total: KSh {viewing.quotation.total.toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {viewing.approvalNotes && (
                <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Notes</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '13px', lineHeight: '1.5' }}>
                    {viewing.approvalNotes}
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                <button
                  onClick={() => {
                    handleDelete(viewing._id);
                    setViewing(null);
                  }}
                  style={{
                    padding: '12px',
                    background: '#ffe8e8',
                    color: '#d32f2f',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setViewing(null)}
                  style={{
                    padding: '12px',
                    background: '#43e97b',
                    color: '#2d7a3e',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
