// src/pages/marketingplanning.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import API from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketingPlanning() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    weekStartDate: '',
    areasPlanned: [],
    areasToRevisit: [],
    notes: ''
  });
  const [newArea, setNewArea] = useState('');
  const [newRevisit, setNewRevisit] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/marketing/plans');
      setPlans(res.data.plans);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddArea = () => {
    if (newArea.trim()) {
      setFormData(prev => ({
        ...prev,
        areasPlanned: [...prev.areasPlanned, newArea.trim()]
      }));
      setNewArea('');
    }
  };

  const handleRemoveArea = (index) => {
    setFormData(prev => ({
      ...prev,
      areasPlanned: prev.areasPlanned.filter((_, i) => i !== index)
    }));
  };

  const handleAddRevisit = () => {
    if (newRevisit.trim()) {
      setFormData(prev => ({
        ...prev,
        areasToRevisit: [...prev.areasToRevisit, newRevisit.trim()]
      }));
      setNewRevisit('');
    }
  };

  const handleRemoveRevisit = (index) => {
    setFormData(prev => ({
      ...prev,
      areasToRevisit: prev.areasToRevisit.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await API.put(`/api/marketing/plans/${editingPlan._id}`, formData);
      } else {
        await API.post('/api/marketing/plans', formData);
      }
      setShowModal(false);
      setEditingPlan(null);
      resetForm();
      fetchPlans();
    } catch (err) {
      console.error('Error saving plan:', err);
      alert('Failed to save plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      weekStartDate: plan.weekStartDate ? plan.weekStartDate.split('T')[0] : '',
      areasPlanned: plan.areasPlanned || [],
      areasToRevisit: plan.areasToRevisit || [],
      notes: plan.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await API.delete(`/api/marketing/plans/${id}`);
      fetchPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
      alert('Failed to delete plan');
    }
  };

  const resetForm = () => {
    setFormData({
      weekStartDate: '',
      areasPlanned: [],
      areasToRevisit: [],
      notes: ''
    });
    setNewArea('');
    setNewRevisit('');
  };

  const openNewPlanModal = () => {
    resetForm();
    setEditingPlan(null);
    setShowModal(true);
  };

  const getWeekLabel = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    return `${date.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  // Get current week's plan
  const currentWeekPlan = plans.find(plan => {
    const planDate = new Date(plan.weekStartDate);
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return planDate >= weekStart && planDate <= weekEnd;
  });

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1b5e20', fontSize: '24px', fontWeight: '700' }}>Marketing Planning</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Plan and track marketing activities by week</p>
        </div>
        <button
          onClick={openNewPlanModal}
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
          <span>+</span> Create Weekly Plan
        </button>
      </div>

      {/* Current Week Summary */}
      {currentWeekPlan && (
        <div style={{ 
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '20px',
          border: '1px solid #a5d6a7'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1b5e20', fontSize: '18px' }}>This Week's Plan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#2d7a3e', fontSize: '14px', fontWeight: '600' }}>Areas Planned for Marketing</h4>
              {currentWeekPlan.areasPlanned?.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#333' }}>
                  {currentWeekPlan.areasPlanned.map((area, idx) => (
                    <li key={idx} style={{ marginBottom: '5px' }}>{area}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#666', margin: 0 }}>No areas planned</p>
              )}
            </div>
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#2d7a3e', fontSize: '14px', fontWeight: '600' }}>Areas to be Revisited</h4>
              {currentWeekPlan.areasToRevisit?.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#333' }}>
                  {currentWeekPlan.areasToRevisit.map((area, idx) => (
                    <li key={idx} style={{ marginBottom: '5px' }}>{area}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#666', margin: 0 }}>No areas to revisit</p>
              )}
            </div>
          </div>
          {currentWeekPlan.notes && (
            <div style={{ marginTop: '15px', padding: '10px', background: 'white', borderRadius: '6px' }}>
              <strong style={{ color: '#2d7a3e' }}>Notes:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#333' }}>{currentWeekPlan.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Plans Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading plans...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Week Starting</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Areas Planned</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Areas to Revisit</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Notes</th>
                <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No plans found</td>
                </tr>
              ) : (
                plans.map((plan, index) => (
                  <motion.tr
                    key={plan._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderBottom: '1px solid #f0f0f0' }}
                  >
                    <td style={{ padding: '15px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                      {getWeekLabel(plan.weekStartDate)}
                    </td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>
                      {plan.areasPlanned?.length > 0 ? (
                        <div style={{ maxWidth: '200px' }}>
                          {plan.areasPlanned.slice(0, 2).map((area, idx) => (
                            <span key={idx} style={{ display: 'inline-block', background: '#e8f5e9', padding: '2px 8px', borderRadius: '4px', margin: '2px', fontSize: '12px' }}>{area}</span>
                          ))}
                          {plan.areasPlanned.length > 2 && (
                            <span style={{ color: '#666', fontSize: '12px' }}> +{plan.areasPlanned.length - 2} more</span>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>
                      {plan.areasToRevisit?.length > 0 ? (
                        <div style={{ maxWidth: '200px' }}>
                          {plan.areasToRevisit.slice(0, 2).map((area, idx) => (
                            <span key={idx} style={{ display: 'inline-block', background: '#fff3e0', padding: '2px 8px', borderRadius: '4px', margin: '2px', fontSize: '12px' }}>{area}</span>
                          ))}
                          {plan.areasToRevisit.length > 2 && (
                            <span style={{ color: '#666', fontSize: '12px' }}> +{plan.areasToRevisit.length - 2} more</span>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#666', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {plan.notes || '-'}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(plan)}
                        style={{ marginRight: '8px', padding: '6px 12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(plan._id)}
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
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
            >
              <h2 style={{ margin: '0 0 20px 0', color: '#1b5e20', fontSize: '20px' }}>
                {editingPlan ? 'Edit Weekly Plan' : 'Create Weekly Plan'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Week Start Date *</label>
                  <input
                    name="weekStartDate"
                    type="date"
                    value={formData.weekStartDate}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Areas Planned for Marketing</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      placeholder="Enter area name"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArea())}
                    />
                    <button
                      type="button"
                      onClick={handleAddArea}
                      style={{ padding: '10px 15px', background: '#43a047', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formData.areasPlanned.map((area, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#e8f5e9',
                          color: '#2d7a3e',
                          padding: '5px 10px',
                          borderRadius: '16px',
                          fontSize: '13px'
                        }}
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => handleRemoveArea(idx)}
                          style={{
                            marginLeft: '8px',
                            background: 'none',
                            border: 'none',
                            color: '#2d7a3e',
                            cursor: 'pointer',
                            padding: '0',
                            fontSize: '16px'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Areas to be Revisited</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      value={newRevisit}
                      onChange={(e) => setNewRevisit(e.target.value)}
                      placeholder="Enter area to revisit"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRevisit())}
                    />
                    <button
                      type="button"
                      onClick={handleAddRevisit}
                      style={{ padding: '10px 15px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formData.areasToRevisit.map((area, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#fff3e0',
                          color: '#e65100',
                          padding: '5px 10px',
                          borderRadius: '16px',
                          fontSize: '13px'
                        }}
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => handleRemoveRevisit(idx)}
                          style={{
                            marginLeft: '8px',
                            background: 'none',
                            border: 'none',
                            color: '#e65100',
                            cursor: 'pointer',
                            padding: '0',
                            fontSize: '16px'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
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
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
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