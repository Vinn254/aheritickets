// frontend/src/pages/networkmanagement.jsx
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

// Styled button styles
const tabButtonStyle = (isActive) => ({
  padding: '12px 24px',
  border: 'none',
  borderRadius: '8px 8px 0 0',
  background: isActive ? '#43e97b' : '#e8f5e9',
  color: isActive ? '#fff' : '#2d7a3e',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  textTransform: 'capitalize',
  transition: 'all 0.3s ease',
  boxShadow: isActive ? '0 -2px 10px rgba(67, 233, 123, 0.3)' : 'none',
  borderBottom: isActive ? 'none' : '2px solid #43e97b'
});

const actionButtonStyle = (variant = 'primary') => ({
  padding: '8px 16px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13,
  transition: 'all 0.3s ease',
  ...(variant === 'edit' && {
    background: '#2196f3',
    color: '#fff',
    boxShadow: '0 2px 6px rgba(33, 150, 243, 0.3)'
  }),
  ...(variant === 'delete' && {
    background: '#f44336',
    color: '#fff',
    boxShadow: '0 2px 6px rgba(244, 67, 54, 0.3)'
  }),
  ...(variant === 'primary' && {
    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#fff',
    boxShadow: '0 2px 10px rgba(67, 233, 123, 0.3)'
  })
});

export default function NetworkManagement() {
  const { user } = useContext(AuthContext);
  const [pops, setPops] = useState([]);
  const [aps, setAps] = useState([]);
  const [stations, setStations] = useState([]);
  const [backbones, setBackbones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('pop');
  const [showForm, setShowForm] = useState(false);
  const [deviceType, setDeviceType] = useState('pop'); // For unified form

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [popsRes, apsRes, stationsRes, backbonesRes] = await Promise.all([
        API.get('/api/network/pops'),
        API.get('/api/network/aps'),
        API.get('/api/network/stations'),
        API.get('/api/network/backbones')
      ]);
      setPops(popsRes.pops || []);
      setAps(apsRes.aps || []);
      setStations(stationsRes.stations || []);
      setBackbones(backbonesRes.backbones || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const type = activeTab + 's';
    try {
      if (editing) {
        await API.put(`/api/network/${type}/${editing}`, formData);
      } else {
        await API.post(`/api/network/${type}`, formData);
      }
      fetchAllData();
      setEditing(null);
      setFormData({});
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err.message || 'Failed to save'));
    }
  };

  const handleEdit = (item, type) => {
    setEditing(item._id);
    setActiveTab(type.replace('s', ''));
    setFormData({ ...item });
    setShowForm(true);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await API.delete(`/api/network/${type}/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert('Error deleting item');
    }
  };

  const handleNewClick = () => {
    setActiveTab('pop');
    setDeviceType('pop');
    setFormData({});
    setEditing(null);
    setShowForm(true);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'pop': return pops;
      case 'ap': return aps;
      case 'station': return stations;
      case 'backbone': return backbones;
      default: return [];
    }
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', marginTop: 56 }}>
      <div style={{ fontSize: 18, color: '#2d7a3e' }}>Loading Network Devices...</div>
    </div>
  );

  return (
    <div style={{ padding: 24, background: 'linear-gradient(135deg, #e8f5e9 0%, #f0f7f0 100%)', minHeight: '100vh', marginTop: 56 }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: '#186a3b', margin: 0, fontSize: 28, fontWeight: 700 }}>
          Network Management
        </h1>
        <button 
          onClick={handleNewClick}
          style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(67, 233, 123, 0.4)',
            transition: 'transform 0.2s'
          }}
        >
          + Add New Device
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: 4, 
        marginBottom: 0,
        background: '#e8f5e9',
        borderRadius: '12px 12px 0 0',
        padding: '8px 8px 0 8px'
      }}>
        {[
          { key: 'pop', label: 'POPs', count: pops.length },
          { key: 'ap', label: 'Access Points', count: aps.length },
          { key: 'station', label: 'Stations', count: stations.length },
          { key: 'backbone', label: 'Backbones', count: backbones.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setShowForm(false); setEditing(null); setFormData({}); }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            style={{
              ...tabButtonStyle(activeTab === tab.key),
              position: 'relative'
            }}
          >
            {tab.icon} {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Form Section - Only shows when adding/editing */}
      {showForm && (
        <div style={{ 
          marginBottom: 24, 
          padding: 24, 
          background: '#fff', 
          borderRadius: '0 12px 12px 12px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '2px solid #43e97b'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ color: '#186a3b', margin: 0, fontSize: 20 }}>
              {editing ? 'Edit' : 'Add'} {activeTab.toUpperCase()}
            </h2>
            <button 
              onClick={() => { setShowForm(false); setEditing(null); setFormData({}); }}
              style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#666' }}
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Device Type Selector - Only show when adding new (not editing) */}
            {!editing && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Device Type *</label>
                <select
                  value={deviceType}
                  onChange={(e) => { setDeviceType(e.target.value); setActiveTab(e.target.value); setFormData({}); }}
                  style={selectStyle}
                >
                  <option value="pop">POP (Point of Presence)</option>
                  <option value="ap">Access Point</option>
                  <option value="station">Station</option>
                  <option value="backbone">Backbone</option>
                </select>
                <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  {deviceType === 'backbone' && 'Backbone is the main network infrastructure (fiber/wireless). No connection needed.'}
                  {deviceType === 'pop' && 'POP connects to a Backbone. Contains APs.'}
                  {deviceType === 'ap' && 'AP connects to a POP. Contains Stations.'}
                  {deviceType === 'station' && 'Station connects to an AP. End user设备.'}
                </p>
              </div>
            )}

            {/* Unified Form Fields based on Device Type */}
            {((activeTab === 'pop' && !editing) || (editing && formData.address)) && activeTab !== 'backbone' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Name *</label>
                  <input
                    type="text"
                    placeholder={activeTab === 'pop' ? 'Enter POP name' : activeTab === 'ap' ? 'Enter AP name' : 'Enter Station name'}
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Brand/Model *</label>
                  <input
                    type="text"
                    placeholder="Enter brand/model"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Address *</label>
                  <input
                    type="text"
                    placeholder="Enter address/location"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required={activeTab !== 'station'}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>MAC Address</label>
                  <input
                    type="text"
                    placeholder="Enter MAC address"
                    value={formData.macAddress || ''}
                    onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                
                {/* Connection Fields based on hierarchy */}
                {activeTab === 'pop' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Connected Backbone</label>
                    <select
                      value={formData.backbone || ''}
                      onChange={(e) => setFormData({ ...formData, backbone: e.target.value })}
                      style={selectStyle}
                    >
                      <option value="">Select Backbone</option>
                      {backbones.map(bb => <option key={bb._id} value={bb._id}>{bb.type} - {bb.details}</option>)}
                    </select>
                  </div>
                )}
                
                {activeTab === 'ap' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Connected POP *</label>
                    <select
                      value={formData.pop || ''}
                      onChange={(e) => setFormData({ ...formData, pop: e.target.value })}
                      required
                      style={selectStyle}
                    >
                      <option value="">Select POP</option>
                      {pops.map(pop => <option key={pop._id} value={pop._id}>{pop.name}</option>)}
                    </select>
                  </div>
                )}
                
                {activeTab === 'station' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Connected AP *</label>
                    <select
                      value={formData.ap || ''}
                      onChange={(e) => setFormData({ ...formData, ap: e.target.value })}
                      required
                      style={selectStyle}
                    >
                      <option value="">Select AP</option>
                      {aps.map(ap => <option key={ap._id} value={ap._id}>{ap.name}</option>)}
                    </select>
                  </div>
                )}
                
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Details</label>
                  <input
                    type="text"
                    placeholder="Enter additional details"
                    value={formData.details || ''}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {/* Backbone Form */}
            {((activeTab === 'backbone' && !editing) || (editing && formData.type)) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Device Type *</label>
                  <select
                    value={formData.type || ''}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    style={selectStyle}
                  >
                    <option value="">Select Device Type</option>
                    <option value="wireless">Wireless</option>
                    <option value="fibre">Fibre</option>
                    <option value="microwave">Microwave</option>
                    <option value="ftth">FTTH</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>IP Address</label>
                  <input
                    type="text"
                    placeholder="Enter IP address"
                    value={formData.ipAddress || ''}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>MAC Address</label>
                  <input
                    type="text"
                    placeholder="Enter MAC address"
                    value={formData.macAddress || ''}
                    onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2d7a3e' }}>Details</label>
                  <input
                    type="text"
                    placeholder="Enter additional details"
                    value={formData.details || ''}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button 
                type="button" 
                onClick={() => { setShowForm(false); setEditing(null); setFormData({}); }}
                style={{ padding: '12px 24px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={actionButtonStyle('primary')}
              >
                {editing ? 'Update' : 'Add'} {activeTab.toUpperCase()}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div style={{ 
        background: '#fff', 
        borderRadius: activeTab === 'backbone' ? 12 : '0 0 12px 12px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {/* POPs Table */}
        {activeTab === 'pop' && (
          <div style={{ padding: 20 }}>
            <h3 style={{ color: '#186a3b', marginBottom: 16, fontSize: 18 }}>
              POPs ({pops.length})
            </h3>
            {pops.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', background: '#f9f9f9', borderRadius: 8 }}>
                <p style={{ color: '#666', marginBottom: 16 }}>No POPs found. Click "Add New Device" to create one.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' }}>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Brand</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Address</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>MAC Address</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Backbone</th>
                    <th style={{ padding: 14, textAlign: 'center', color: '#fff', fontWeight: 600, width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pops.map((pop, idx) => (
                    <tr key={pop._id} style={{ background: idx % 2 === 0 ? '#f9fcf9' : '#fff', transition: 'background 0.2s' }}>
                      <td style={{ padding: 14, fontWeight: 600, color: '#2d7a3e' }}>{pop.name}</td>
                      <td style={{ padding: 14 }}>{pop.brand || '-'}</td>
                      <td style={{ padding: 14 }}>{pop.address}</td>
                      <td style={{ padding: 14, fontFamily: 'monospace', fontSize: 13 }}>{pop.macAddress || '-'}</td>
                      <td style={{ padding: 14 }}>{pop.backbone?.details || pop.backbone?.type || '-'}</td>
                      <td style={{ padding: 14, textAlign: 'center' }}>
                        <button 
                          onClick={() => handleEdit(pop, 'pops')}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          style={actionButtonStyle('edit')}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(pop._id, 'pops')}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          style={{ ...actionButtonStyle('delete'), marginLeft: 8 }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}

        {/* APs Table */}
        {activeTab === 'ap' && (
          <div style={{ padding: 20 }}>
            <h3 style={{ color: '#186a3b', marginBottom: 16, fontSize: 18 }}>
              Access Points ({aps.length})
            </h3>
            {aps.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', background: '#f9f9f9', borderRadius: 8 }}>
                <p style={{ color: '#666', marginBottom: 16 }}>No Access Points found. Click "Add New Device" to create one.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' }}>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Brand</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Address</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>MAC Address</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Connected POP</th>
                    <th style={{ padding: 14, textAlign: 'center', color: '#fff', fontWeight: 600, width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {aps.map((ap, idx) => (
                    <tr key={ap._id} style={{ background: idx % 2 === 0 ? '#f9fcf9' : '#fff', transition: 'background 0.2s' }}>
                      <td style={{ padding: 14, fontWeight: 600, color: '#2d7a3e' }}>{ap.name}</td>
                      <td style={{ padding: 14 }}>{ap.brand || '-'}</td>
                      <td style={{ padding: 14 }}>{ap.address}</td>
                      <td style={{ padding: 14, fontFamily: 'monospace', fontSize: 13 }}>{ap.macAddress || '-'}</td>
                      <td style={{ padding: 14 }}>{ap.pop?.name || '-'}</td>
                      <td style={{ padding: 14, textAlign: 'center' }}>
                        <button 
                          onClick={() => handleEdit(ap, 'aps')}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          style={actionButtonStyle('edit')}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(ap._id, 'aps')}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          style={{ ...actionButtonStyle('delete'), marginLeft: 8 }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}

        {/* Stations Table */}
        {activeTab === 'station' && (
          <div style={{ padding: 20 }}>
            <h3 style={{ color: '#186a3b', marginBottom: 16, fontSize: 18 }}>
              Stations ({stations.length})
            </h3>
            {stations.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', background: '#f9f9f9', borderRadius: 8 }}>
                <p style={{ color: '#666', marginBottom: 16 }}>No Stations found. Click "Add New Device" to create one.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' }}>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Brand</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>IP Address</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>MAC Address</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Connected AP</th>
                    <th style={{ padding: 14, textAlign: 'center', color: '#fff', fontWeight: 600, width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map((station, idx) => (
                    <tr key={station._id} style={{ background: idx % 2 === 0 ? '#f9fcf9' : '#fff', transition: 'background 0.2s' }}>
                      <td style={{ padding: 14, fontWeight: 600, color: '#2d7a3e' }}>{station.name}</td>
                      <td style={{ padding: 14 }}>{station.brand || '-'}</td>
                      <td style={{ padding: 14, fontFamily: 'monospace', fontSize: 13 }}>{station.address || '-'}</td>
                      <td style={{ padding: 14, fontFamily: 'monospace', fontSize: 13 }}>{station.macAddress || '-'}</td>
                      <td style={{ padding: 14 }}>{station.ap?.name || '-'}</td>
                      <td style={{ padding: 14, textAlign: 'center' }}>
                        <button 
                          onClick={() => handleEdit(station, 'stations')}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          style={actionButtonStyle('edit')}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(station._id, 'stations')}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          style={{ ...actionButtonStyle('delete'), marginLeft: 8 }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}

        {/* Backbones Table */}
        {activeTab === 'backbone' && (
          <div style={{ padding: 20 }}>
            <h3 style={{ color: '#186a3b', marginBottom: 16, fontSize: 18 }}>
              Backbones ({backbones.length})
            </h3>
            {backbones.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', background: '#f9f9f9', borderRadius: 8 }}>
                <p style={{ color: '#666', marginBottom: 16 }}>No Backbones found. Click "Add New Device" to create one.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' }}>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Device Type</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>IP Address</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>MAC Address</th>
                    <th style={{ padding: 14, textAlign: 'left', color: '#fff', fontWeight: 600 }}>Details</th>
                    <th style={{ padding: 14, textAlign: 'center', color: '#fff', fontWeight: 600, width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backbones.map((bb, idx) => (
                    <tr key={bb._id} style={{ background: idx % 2 === 0 ? '#f9fcf9' : '#fff', transition: 'background 0.2s' }}>
                      <td style={{ padding: 14, fontWeight: 600, color: '#2d7a3e', textTransform: 'capitalize' }}>{bb.type || '-'}</td>
                      <td style={{ padding: 14, fontFamily: 'monospace', fontSize: 13 }}>{bb.ipAddress || '-'}</td>
                      <td style={{ padding: 14, fontFamily: 'monospace', fontSize: 13 }}>{bb.macAddress || '-'}</td>
                      <td style={{ padding: 14 }}>{bb.details || '-'}</td>
                      <td style={{ padding: 14, textAlign: 'center' }}>
                        <button 
                          onClick={() => handleEdit(bb, 'backbones')}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          style={actionButtonStyle('edit')}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(bb._id, 'backbones')}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          style={{ ...actionButtonStyle('delete'), marginLeft: 8 }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
