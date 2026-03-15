// src/pages/technicianinstallations.jsx
import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { motion } from 'framer-motion';

export default function TechnicianInstallations() {
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInstallations();
  }, []);

  const fetchInstallations = async () => {
    try {
      setLoading(true);
      const data = await API.get('/api/installation-requests/technician/my-installations');
      setInstallations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching installations:', err);
      setInstallations([]);
    } finally {
      setLoading(false);
    }
  };

  const startInstallation = async (installationId) => {
    try {
      await API.put(`/api/installation-requests/${installationId}/start`);
      alert('Installation started!');
      fetchInstallations();
      setViewing(null);
    } catch (err) {
      console.error(err);
      alert('Failed to start installation: ' + (err.message || 'Unknown error'));
    }
  };

  const completeInstallation = async (installationId) => {
    const notes = prompt('Enter completion notes (work done, issues, etc.):');
    if (notes === null) return; // User cancelled
    
    try {
      await API.put(`/api/installation-requests/${installationId}/complete`, { technicianNotes: notes || '' });
      alert('Installation marked as completed! Admin will confirm closure.');
      fetchInstallations();
      setViewing(null);
    } catch (err) {
      console.error(err);
      alert('Failed to complete installation: ' + (err.message || 'Unknown error'));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'opened': '#2196f3',
      'pending': '#ffa500',
      'completed': '#43a047',
      'closed': '#9e9e9e'
    };
    return colors[status] || '#999';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      'opened': '#e3f2fd',
      'pending': '#fff3e0',
      'completed': '#e8f5e9',
      'closed': '#f5f5f5'
    };
    return colors[status] || '#f5f5f5';
  };

  const filtered = installations.filter(inst => 
    statusFilter === 'all' || inst.status === statusFilter
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  const statusStats = [
    { status: 'opened', count: installations.filter(i => i.status === 'opened').length },
    { status: 'pending', count: installations.filter(i => i.status === 'pending').length },
    { status: 'completed', count: installations.filter(i => i.status === 'completed').length },
    { status: 'closed', count: installations.filter(i => i.status === 'closed').length }
  ];

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
          My Installations
        </h1>
        <p style={{ 
          color: '#4a4a4a', 
          fontSize: 'clamp(14px, 3vw, 16px)', 
          marginTop: '8px', 
          opacity: 0.8,
          margin: '8px 0 0 0'
        }}>
          Manage your assigned installation tasks
        </p>
      </motion.div>

      {/* Statistics */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '12px',
          marginBottom: '32px'
        }}
      >
        {statusStats.map((stat) => (
          <motion.div
            key={stat.status}
            variants={cardVariants}
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
            whileHover={{ transform: 'translateY(-4px)' }}
          >
            <div style={{ fontSize: '24px', fontWeight: '800', color: getStatusColor(stat.status) }}>
              {stat.count}
            </div>
            <div style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize', marginTop: '4px', fontWeight: '500' }}>
              {stat.status}
            </div>
          </motion.div>
        ))}
        <motion.div
          variants={cardVariants}
          onClick={() => setStatusFilter('all')}
          style={{
            background: '#f0f0f0',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            border: `2px solid ${statusFilter === 'all' ? '#333' : 'transparent'}`,
            transition: 'all 0.3s ease'
          }}
          whileHover={{ transform: 'translateY(-4px)' }}
        >
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>
            {installations.length}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontWeight: '500' }}>
            All
          </div>
        </motion.div>
      </motion.div>

      {/* Instructions */}
      <div style={{ 
        marginBottom: '24px', 
        padding: '16px', 
        background: '#e3f2fd', 
        borderRadius: '12px',
        border: '2px solid #2196f3'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#1565c0', fontSize: '14px', fontWeight: '700' }}>
          📋 Installation Workflow
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#1565c0', fontSize: '13px', lineHeight: '1.8' }}>
          <li><strong>Opened</strong> - Installation assigned, waiting for you to start</li>
          <li><strong>Pending</strong> - Installation in progress</li>
          <li><strong>Completed</strong> - Work finished, awaiting admin confirmation</li>
          <li><strong>Closed</strong> - Installation completed and confirmed by admin</li>
        </ul>
      </div>

      {/* Installations Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'block',
          background: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr 1fr 100px 80px',
          gap: '12px',
          padding: '14px 16px',
          background: '#2d7a3e',
          fontWeight: '600',
          color: 'white',
          fontSize: '12px',
          textTransform: 'uppercase'
        }}>
          <div>Request #</div>
          <div>Customer</div>
          <div>Type/Package</div>
          <div>Status</div>
          <div>Action</div>
        </div>
      {filtered.length > 0 ? (
        filtered.map((inst) => (
          <motion.div
            key={inst._id}
            variants={cardVariants}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr 1fr 100px 80px',
              gap: '12px',
              padding: '14px 16px',
              borderBottom: '1px solid #e8e8e8',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setViewing(inst)}
            whileHover={{ backgroundColor: '#f8f8f8' }}
          >
            <div style={{ fontWeight: '600', color: '#2d7a3e', fontSize: '13px' }}>
              {inst.requestNumber}
            </div>
            <div>
              <div style={{ fontWeight: '600', color: '#333', fontSize: '13px' }}>
                {inst.customer?.name}
              </div>
              <div style={{ color: '#888', fontSize: '11px' }}>
                {inst.customer?.phone}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '500', color: '#333', fontSize: '12px' }}>
                {inst.installationType === 'fiber' ? 'Fiber' : 'Wireless'} - {inst.package}
              </div>
              <div style={{ color: '#888', fontSize: '11px' }}>
                {inst.location || 'No location'}
              </div>
            </div>
            <div>
              <span style={{
                background: getStatusBgColor(inst.status),
                color: getStatusColor(inst.status),
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {inst.status}
              </span>
            </div>
            <div>
              <button
                onClick={(e) => { e.stopPropagation(); setViewing(inst); }}
                style={{
                  padding: '5px 10px',
                  background: '#2d7a3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                View
              </button>
            </div>
          </motion.div>
        ))
      ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '48px 20px',
              color: '#999',
              background: 'white'
            }}
          >
            <p style={{ fontSize: '16px', fontWeight: '500' }}>No installations assigned</p>
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
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Customer</p>
                <p style={{ margin: 0, color: '#2d7a3e', fontSize: '16px', fontWeight: '700' }}>
                  {viewing.customer?.name}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>
                  📧 {viewing.customer?.email} | 📞 {viewing.customer?.phone}
                </p>
                <p style={{ margin: '2px 0 0 0', color: '#666', fontSize: '12px' }}>
                  {viewing.customer?.location}
                </p>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px', fontWeight: '600' }}>Installation Details</p>
                <p style={{ margin: '0 0 4px 0', color: '#2d7a3e', fontSize: '14px', fontWeight: '700' }}>
                  {viewing.installationType.charAt(0).toUpperCase() + viewing.installationType.slice(1)} - {viewing.package}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>
                  Location: {viewing.location}
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

              {/* Action Buttons for Technician */}
              {viewing.status === 'opened' && (
                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => startInstallation(viewing._id)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #ffa500 0%, #ff9800 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    ▶️ Start Installation
                  </button>
                  <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '11px', textAlign: 'center' }}>
                    Click when you begin the installation work
                  </p>
                </div>
              )}

              {viewing.status === 'pending' && (
                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => completeInstallation(viewing._id)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    ✅ Mark as Completed
                  </button>
                  <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '11px', textAlign: 'center' }}>
                    Enter notes about the work done. Admin will confirm closure.
                  </p>
                </div>
              )}

              {viewing.status === 'completed' && (
                <div style={{ marginTop: '20px', padding: '12px', background: '#e8f5e9', borderRadius: '6px' }}>
                  <p style={{ margin: 0, color: '#2d7a3e', fontSize: '12px', fontWeight: '600' }}>
                    ✅ Work completed! Waiting for admin confirmation.
                  </p>
                  {viewing.technicianNotes && (
                    <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '11px' }}>
                      Your notes: {viewing.technicianNotes}
                    </p>
                  )}
                </div>
              )}

              {viewing.status === 'closed' && (
                <div style={{ marginTop: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '12px', fontWeight: '600' }}>
                    ✅ Installation completed and closed
                  </p>
                </div>
              )}

              <button
                onClick={() => setViewing(null)}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '12px',
                  background: '#f5f5f5',
                  color: '#666',
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
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
