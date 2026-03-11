// src/pages/planning.jsx
import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { motion } from 'framer-motion';

export default function Planning() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ planType: 'all', status: 'all' });
  const [technicians, setTechnicians] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [userRole, setUserRole] = useState('');
  
  const [formData, setFormData] = useState({
    planType: 'daily',
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    client: '',
    activity: '',
    resources: '',
    personnel: [],
    remarks: '',
    status: 'draft'
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
    fetchPlans();
    if (user.role === 'admin' || user.role === 'csr') {
      fetchTechnicians();
      fetchCustomers();
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [filter]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.planType !== 'all') params.append('planType', filter.planType);
      if (filter.status !== 'all') params.append('status', filter.status);
      
      const data = await API.get(`/plans?${params.toString()}`);
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const data = await API.get('/users?role=technician');
      setTechnicians(Array.isArray(data) ? data : (data.users || []));
    } catch (err) {
      console.error('Error fetching technicians:', err);
      setTechnicians([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await API.get('/users?role=customer');
      setCustomers(Array.isArray(data) ? data : (data.users || []));
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (viewing) {
        await API.put(`/plans/${viewing._id}`, formData);
        alert('Plan updated successfully!');
      } else {
        await API.post('/plans', formData);
        alert('Plan created successfully!');
      }
      setShowForm(false);
      setViewing(null);
      resetForm();
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Failed to save plan: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await API.delete(`/plans/${id}`);
      alert('Plan deleted!');
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Failed to delete plan');
    }
  };

  const resetForm = () => {
    setFormData({
      planType: 'daily',
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      client: '',
      activity: '',
      resources: '',
      personnel: [],
      remarks: '',
      status: 'draft'
    });
  };

  const editPlan = (plan) => {
    setViewing(plan);
    setFormData({
      planType: plan.planType,
      title: plan.title || '',
      description: plan.description || '',
      date: plan.date ? new Date(plan.date).toISOString().split('T')[0] : '',
      time: plan.time || '',
      location: plan.location || '',
      client: plan.client?._id || '',
      activity: plan.activity || '',
      resources: plan.resources || '',
      personnel: plan.personnel?.map(p => p._id || p) || [],
      remarks: plan.remarks || '',
      status: plan.status || 'draft'
    });
    setShowForm(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': '#9e9e9e',
      'active': '#2196f3',
      'completed': '#43a047',
      'cancelled': '#d32f2f'
    };
    return colors[status] || '#999';
  };

  const filteredPlans = plans;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const canEdit = userRole === 'admin' || userRole === 'csr' || userRole === 'technician';

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
          Planning
        </h1>
        <p style={{ 
          color: '#4a4a4a', 
          fontSize: 'clamp(14px, 3vw, 16px)', 
          marginTop: '8px', 
          opacity: 0.8,
          margin: '8px 0 0 0'
        }}>
          Manage daily, weekly, and quarterly plans
        </p>
      </motion.div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <select
          value={filter.planType}
          onChange={(e) => setFilter({ ...filter, planType: e.target.value })}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '2px solid #43e97b',
            fontSize: '14px',
            background: 'white'
          }}
        >
          <option value="all">All Types</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="quarterly">Quarterly</option>
        </select>
        
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '2px solid #43e97b',
            fontSize: '14px',
            background: 'white'
          }}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {canEdit && (
          <button
            onClick={() => { resetForm(); setViewing(null); setShowForm(true); }}
            style={{
              padding: '10px 24px',
              marginLeft: 'auto',
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
            + Create Plan
          </button>
        )}
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
          Loading plans...
        </div>
      ) : (
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
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <motion.div
                key={plan._id}
                variants={cardVariants}
                whileHover={{ transform: 'translateY(-4px)' }}
                onClick={() => setViewing(plan)}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: `2px solid ${getStatusColor(plan.status)}20`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  background: `${getStatusColor(plan.status)}15`,
                  padding: '12px 16px',
                  borderBottom: `3px solid ${getStatusColor(plan.status)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{
                      background: '#43e97b',
                      color: '#2d7a3e',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}>
                      {plan.planType}
                    </span>
                  </div>
                  <span style={{
                    background: getStatusColor(plan.status),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'capitalize'
                  }}>
                    {plan.status}
                  </span>
                </div>

                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2d7a3e', fontSize: '16px', fontWeight: '700' }}>
                    {plan.title}
                  </h3>
                  
                  {plan.date && (
                    <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '13px' }}>
                      📅 {new Date(plan.date).toLocaleDateString()}
                    </p>
                  )}
                  
                  {plan.location && (
                    <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '13px' }}>
                      📍 {plan.location}
                    </p>
                  )}
                  
                  {plan.activity && (
                    <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '13px' }}>
                      🔧 {plan.activity}
                    </p>
                  )}
                  
                  {plan.personnel?.length > 0 && (
                    <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>
                      👤 {plan.personnel.map(p => p.name || p).join(', ')}
                    </p>
                  )}
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
                padding: '48px',
                color: '#999'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No plans found</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { setShowForm(false); setViewing(null); }}
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
              maxWidth: '600px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              background: '#43e97b',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, color: '#2d7a3e' }}>
                {viewing ? 'Edit Plan' : 'Create Plan'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setViewing(null); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#2d7a3e'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    Plan Type *
                  </label>
                  <select
                    value={formData.planType}
                    onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '2px solid #43e97b',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Plan title"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '2px solid #43e97b',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                {formData.planType === 'daily' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                          Date
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '2px solid #43e97b',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                          Time
                        </label>
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '2px solid #43e97b',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Installation location"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '2px solid #43e97b',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        Client/Customer
                      </label>
                      <select
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '2px solid #43e97b',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Select Customer</option>
                        {customers.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        Activity
                      </label>
                      <input
                        type="text"
                        value={formData.activity}
                        onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                        placeholder="What needs to be done"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '2px solid #43e97b',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        Resources
                      </label>
                      <input
                        type="text"
                        value={formData.resources}
                        onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                        placeholder="Equipment, materials needed"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '2px solid #43e97b',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        Personnel/Technicians
                      </label>
                      <select
                        multiple
                        value={formData.personnel}
                        onChange={(e) => setFormData({ ...formData, personnel: Array.from(e.target.selectedOptions, option => option.value) })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '2px solid #43e97b',
                          fontSize: '14px',
                          minHeight: '80px'
                        }}
                      >
                        {technicians.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>Hold Ctrl/Cmd to select multiple</p>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        Remarks
                      </label>
                      <textarea
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="Additional notes"
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '2px solid #43e97b',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '2px solid #43e97b',
                      fontSize: '14px'
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setViewing(null); }}
                    style={{
                      padding: '12px',
                      background: '#f5f5f5',
                      color: '#666',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
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
                      cursor: 'pointer'
                    }}
                  >
                    {viewing ? 'Update Plan' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* View Plan Modal */}
      {viewing && !showForm && (
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
              background: `${getStatusColor(viewing.status)}15`,
              padding: '20px',
              borderBottom: `3px solid ${getStatusColor(viewing.status)}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{
                  background: '#43e97b',
                  color: '#2d7a3e',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  {viewing.planType}
                </span>
              </div>
              <span style={{
                background: getStatusColor(viewing.status),
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'capitalize'
              }}>
                {viewing.status}
              </span>
            </div>

            <div style={{ padding: '20px' }}>
              <h2 style={{ margin: '0 0 16px 0', color: '#2d7a3e' }}>{viewing.title}</h2>
              
              {viewing.date && (
                <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
                  <strong>📅 Date:</strong> {new Date(viewing.date).toLocaleDateString()}
                </p>
              )}
              
              {viewing.time && (
                <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
                  <strong>🕐 Time:</strong> {viewing.time}
                </p>
              )}
              
              {viewing.location && (
                <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
                  <strong>📍 Location:</strong> {viewing.location}
                </p>
              )}
              
              {viewing.client && (
                <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
                  <strong>👤 Client:</strong> {viewing.client.name}
                </p>
              )}
              
              {viewing.activity && (
                <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
                  <strong>🔧 Activity:</strong> {viewing.activity}
                </p>
              )}
              
              {viewing.resources && (
                <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
                  <strong>🛠️ Resources:</strong> {viewing.resources}
                </p>
              )}
              
              {viewing.personnel?.length > 0 && (
                <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
                  <strong>👷 Personnel:</strong> {viewing.personnel.map(p => p.name).join(', ')}
                </p>
              )}
              
              {viewing.remarks && (
                <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
                  <strong>📝 Remarks:</strong> {viewing.remarks}
                </p>
              )}
              
              <p style={{ margin: '0 0 12px 0', color: '#999', fontSize: '12px' }}>
                Created by: {viewing.createdBy?.name}
              </p>

              {canEdit && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                  <button
                    onClick={() => editPlan(viewing)}
                    style={{
                      padding: '12px',
                      background: '#e3f2fd',
                      color: '#1976d2',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(viewing._id)}
                    style={{
                      padding: '12px',
                      background: '#ffebee',
                      color: '#d32f2f',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setViewing(null)}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '12px',
                  background: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
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
