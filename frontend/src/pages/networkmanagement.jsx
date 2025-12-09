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

const textareaStyle = {
  ...inputStyle,
  minHeight: 80,
  resize: 'vertical'
};

export default function NetworkManagement() {
  const { user } = useContext(AuthContext);
  const [pops, setPops] = useState([]);
  const [aps, setAps] = useState([]);
  const [stations, setStations] = useState([]);
  const [backbones, setBackbones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [expandedPOPs, setExpandedPOPs] = useState(new Set());

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [popsRes, apsRes, stationsRes, backbonesRes] = await Promise.all([
        API.get('/network/pops'),
        API.get('/network/aps'),
        API.get('/network/stations'),
        API.get('/network/backbones')
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

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/network/${type}/${editing}`, formData);
      } else {
        await API.post(`/network/${type}`, formData);
      }
      fetchAllData();
      setEditing(null);
      setFormData({});
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item, type) => {
    setEditing(item._id);
    if (type === 'backbones') {
      setFormData({ ...item, pops: item.pops?.map(p => p._id) || [] });
    } else {
      setFormData({ ...item });
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure?')) return;
    try {
      await API.delete(`/network/${type}/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };


  const togglePOPExpansion = (popId) => {
    const newExpanded = new Set(expandedPOPs);
    if (newExpanded.has(popId)) {
      newExpanded.delete(popId);
    } else {
      newExpanded.add(popId);
    }
    setExpandedPOPs(newExpanded);
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: 20, background: 'linear-gradient(135deg, #f7fff7 0%, #e8f5e9 100%)', minHeight: '100vh' }}>
      <h1 style={{ color: '#2d7a3e', textAlign: 'center', marginBottom: 30 }}>Network Management</h1>

      {/* Add Device Form */}
      <div style={{ marginBottom: 30, padding: 20, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(67, 233, 123, 0.1)', border: '1px solid #e8f5e9', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 style={{ color: '#2d7a3e', marginBottom: 20 }}>Add/Edit Device</h2>
        <DeviceForm
          formData={formData}
          setFormData={setFormData}
          editing={editing}
          handleSubmit={handleSubmit}
          setEditing={setEditing}
          pops={pops}
          aps={aps}
        />
      </div>

      {/* Network Table View */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(67, 233, 123, 0.1)', border: '1px solid #e8f5e9', overflow: 'hidden' }}>
        <div style={{ padding: 20, background: '#43e97b', color: '#fff' }}>
          <h2 style={{ margin: 0 }}>Network Devices</h2>
          <div style={{ fontSize: '14px', marginTop: 10 }}>
            <strong>Status Legend:</strong> 🟢 Active | 🔴 Down
          </div>
          <div style={{ fontSize: '12px', marginTop: 5 }}>
            Devices are grouped by POP for clarity.
          </div>
        </div>

        <div style={{ padding: 0 }}>
          {pops.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
              No POPs found. Add a POP to get started.
            </div>
          ) : (
            <NetworkTable
              pops={pops}
              aps={aps}
              stations={stations}
              backbones={backbones}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Device Form Component
function DeviceForm({ formData, setFormData, editing, handleSubmit, setEditing, pops, aps }) {
  const [deviceType, setDeviceType] = useState('pop');

  const renderForm = () => {
    const tableStyle = {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px'
    };

    const tdStyle = {
      padding: '12px 8px',
      verticalAlign: 'top'
    };

    const labelStyle = {
      fontWeight: 600,
      color: '#2d7a3e',
      marginBottom: 5,
      display: 'block'
    };

    switch (deviceType) {
      case 'pop':
        return (
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={{ ...tdStyle, width: '30%', fontWeight: 'bold' }}>Name</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter POP name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>MAC Address</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter MAC address"
                    value={formData.macAddress || ''}
                    onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                    style={inputStyle}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>Address</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>Brand/Model</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter brand/model (e.g., Cambium Gen2)"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        );
      case 'ap':
        return (
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={{ ...tdStyle, width: '30%', fontWeight: 'bold' }}>Name</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter AP name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>MAC Address</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter MAC address"
                    value={formData.macAddress || ''}
                    onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                    style={inputStyle}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>POP</td>
                <td style={tdStyle}>
                  <select
                    value={formData.pop || ''}
                    onChange={(e) => setFormData({ ...formData, pop: e.target.value })}
                    required
                    style={selectStyle}
                  >
                    <option value="">Select POP</option>
                    {pops.map(pop => <option key={pop._id} value={pop._id}>{pop.name}</option>)}
                  </select>
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>Address</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>Brand/Model</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter brand/model (e.g., Cambium Gen2)"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        );
      case 'station':
        return (
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={{ ...tdStyle, width: '30%', fontWeight: 'bold' }}>Name</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter station name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>IP Address</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter IP address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={inputStyle}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>MAC Address</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter MAC address"
                    value={formData.macAddress || ''}
                    onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                    style={inputStyle}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>Connected AP</td>
                <td style={tdStyle}>
                  <select
                    value={formData.ap || ''}
                    onChange={(e) => setFormData({ ...formData, ap: e.target.value })}
                    required
                    style={selectStyle}
                  >
                    <option value="">Select AP</option>
                    {aps.map(ap => <option key={ap._id} value={ap._id}>{ap.name}</option>)}
                  </select>
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>Device Type</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter device type (e.g., Gen2, Cambium)"
                    value={formData.details || ''}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    style={inputStyle}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        );
      case 'backbone':
        return (
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={{ ...tdStyle, width: '30%', fontWeight: 'bold' }}>Type</td>
                <td style={tdStyle}>
                  <select
                    value={formData.type || ''}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    style={selectStyle}
                  >
                    <option value="">Select Type</option>
                    <option value="wireless">Wireless</option>
                    <option value="fibre">Fibre</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>Device Type</td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    placeholder="Enter device type (e.g., Fiber, Wireless)"
                    value={formData.details || ''}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    style={inputStyle}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>Connected POPs</td>
                <td style={tdStyle}>
                  <select
                    multiple
                    value={formData.pops || []}
                    onChange={(e) => setFormData({ ...formData, pops: Array.from(e.target.selectedOptions, option => option.value) })}
                    style={{ ...selectStyle, minHeight: 120 }}
                  >
                    {pops.map(pop => <option key={pop._id} value={pop._id}>{pop.name} - {pop.address}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, color: '#2d7a3e' }}>Device Type</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {['pop', 'ap', 'station', 'backbone'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setDeviceType(type);
                setFormData({});
                setEditing(null);
              }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 6,
                background: deviceType === type ? '#43e97b' : '#f0f0f0',
                color: deviceType === type ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, deviceType + 's')} style={{ marginBottom: 20 }}>
        {renderForm()}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="submit" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)' }}>
            {editing ? 'Update' : 'Add'} {deviceType.toUpperCase()}
          </button>
          {editing && <button type="button" onClick={() => { setEditing(null); setFormData({}); }} style={{ padding: '12px 24px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}

// Tree Node Components
function POPTreeNode({ pop, aps, stations, backbones, expanded, onToggle, onEdit, onDelete, onStatusUpdate }) {
  return (
    <div style={{ border: '1px solid #e0e0e0', marginBottom: 2 }}>
      {/* POP Header */}
      <div
        style={{
          padding: window.innerWidth <= 768 ? '12px 15px' : '15px 20px',
          background: '#f8f9fa',
          borderBottom: expanded ? '1px solid #e0e0e0' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10
        }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth <= 768 ? 10 : 15, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: window.innerWidth <= 768 ? '16px' : '18px', color: '#666' }}>
            {expanded ? '▼' : '▶'}
          </span>
          <span style={{ fontSize: '16px' }}>
            {pop.status === 'active' ? '🟢' : '🔴'}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: window.innerWidth <= 768 ? '14px' : '16px', color: '#2d7a3e' }}>
              🏢 {pop.name}
            </div>
            <div style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px', color: '#666', marginTop: 2 }}>
              {pop.address} • MAC: {pop.macAddress || 'N/A'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth <= 768 ? 5 : 10, flexWrap: 'wrap' }}>
          <span style={{
            padding: window.innerWidth <= 768 ? '3px 8px' : '4px 12px',
            borderRadius: 12,
            fontSize: window.innerWidth <= 768 ? '10px' : '12px',
            fontWeight: 'bold',
            background: pop.status === 'active' ? '#d4edda' : '#f8d7da',
            color: pop.status === 'active' ? '#155724' : '#721c24'
          }}>
            {pop.status === 'active' ? '🟢' : '🔴'} {pop.status.toUpperCase()}
          </span>
          <div style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px', color: '#666' }}>
            APs: {aps.length} • Backbones: {backbones.length}
          </div>
          <div style={{ display: 'flex', gap: window.innerWidth <= 768 ? 2 : 5 }}>
            <button onClick={(e) => { e.stopPropagation(); onEdit(pop, 'pops'); }} style={{ padding: window.innerWidth <= 768 ? '3px 6px' : '4px 8px', fontSize: window.innerWidth <= 768 ? '10px' : '12px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(pop._id, 'pops'); }} style={{ padding: window.innerWidth <= 768 ? '3px 6px' : '4px 8px', fontSize: window.innerWidth <= 768 ? '10px' : '12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ background: '#fafafa' }}>
          {/* APs */}
          {aps.map(ap => (
            <APTreeNode
              key={ap._id}
              ap={ap}
              stations={stations.filter(s => s.ap?._id === ap._id)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {/* Backbones */}
          {backbones.map(backbone => (
            <BackboneTreeNode
              key={backbone._id}
              backbone={backbone}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function APTreeNode({ ap, stations, onEdit, onDelete, onStatusUpdate }) {
  const isMobile = window.innerWidth <= 768;
  return (
    <div style={{ borderLeft: `3px solid #43e97b`, marginLeft: isMobile ? 20 : 40, background: '#fff' }}>
      <div style={{ padding: isMobile ? '10px 15px' : '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 15, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#666' }}>📡</span>
          <span style={{ fontSize: '14px' }}>
            {ap.status === 'active' ? '🟢' : '🔴'}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: isMobile ? '13px' : '14px', color: '#2d7a3e' }}>
              {ap.name}
            </div>
            <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#666', marginTop: 2 }}>
              {ap.address} • MAC: {ap.macAddress || 'N/A'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 5 : 10, flexWrap: 'wrap' }}>
          <span style={{
            padding: isMobile ? '2px 6px' : '3px 10px',
            borderRadius: 10,
            fontSize: isMobile ? '9px' : '11px',
            fontWeight: 'bold',
            background: ap.status === 'active' ? '#d4edda' : '#f8d7da',
            color: ap.status === 'active' ? '#155724' : '#721c24'
          }}>
            {ap.status === 'active' ? '🟢' : '🔴'} {ap.status.toUpperCase()}
          </span>
          <div style={{ fontSize: isMobile ? '9px' : '11px', color: '#666' }}>
            Stations: {stations.length}
          </div>
          <div style={{ display: 'flex', gap: isMobile ? 2 : 3 }}>
            <button onClick={() => onEdit(ap, 'aps')} style={{ padding: isMobile ? '2px 4px' : '3px 6px', fontSize: isMobile ? '9px' : '11px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Edit</button>
            <button onClick={() => onDelete(ap._id, 'aps')} style={{ padding: isMobile ? '2px 4px' : '3px 6px', fontSize: isMobile ? '9px' : '11px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      </div>

      {/* Stations */}
      {stations.map(station => (
        <StationTreeNode
          key={station._id}
          station={station}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function StationTreeNode({ station, onEdit, onDelete, onStatusUpdate }) {
  const isMobile = window.innerWidth <= 768;
  return (
    <div style={{ borderLeft: `3px solid #38f9d7`, marginLeft: isMobile ? 30 : 60, background: '#f9f9f9' }}>
      <div style={{ padding: isMobile ? '8px 15px' : '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 15, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#666' }}>📱</span>
          <span style={{ fontSize: '12px' }}>
            {station.status === 'active' ? '🟢' : '🔴'}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: isMobile ? '12px' : '13px', color: '#2d7a3e' }}>
              {station.name}
            </div>
            <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#666', marginTop: 1 }}>
              {station.details} • IP: {station.address || 'N/A'} • MAC: {station.macAddress || 'N/A'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 10 }}>
          <span style={{
            padding: isMobile ? '1px 6px' : '2px 8px',
            borderRadius: 8,
            fontSize: isMobile ? '8px' : '10px',
            fontWeight: 'bold',
            background: station.status === 'active' ? '#d4edda' : '#f8d7da',
            color: station.status === 'active' ? '#155724' : '#721c24'
          }}>
            {station.status === 'active' ? '🟢' : '🔴'} {station.status.toUpperCase()}
          </span>
          <div style={{ display: 'flex', gap: isMobile ? 1 : 2 }}>
            <button onClick={() => onEdit(station, 'stations')} style={{ padding: isMobile ? '1px 3px' : '2px 5px', fontSize: isMobile ? '8px' : '10px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Edit</button>
            <button onClick={() => onDelete(station._id, 'stations')} style={{ padding: isMobile ? '1px 3px' : '2px 5px', fontSize: isMobile ? '8px' : '10px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackboneTreeNode({ backbone, onEdit, onDelete, onStatusUpdate }) {
  const isMobile = window.innerWidth <= 768;
  return (
    <div style={{ borderLeft: `3px solid #ff9800`, marginLeft: isMobile ? 20 : 40, background: '#fff' }}>
      <div style={{ padding: isMobile ? '10px 15px' : '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 15, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#666' }}>
            {backbone.type === 'wireless' ? '📶' : '🖧'}
          </span>
          <span style={{ fontSize: '14px' }}>
            {backbone.status === 'active' ? '🟢' : '🔴'}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: isMobile ? '13px' : '14px', color: '#2d7a3e' }}>
              {backbone.type.toUpperCase()} Backbone
            </div>
            <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#666', marginTop: 2 }}>
              {backbone.details}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 5 : 10 }}>
          <span style={{
            padding: isMobile ? '2px 6px' : '3px 10px',
            borderRadius: 10,
            fontSize: isMobile ? '9px' : '11px',
            fontWeight: 'bold',
            background: backbone.status === 'active' ? '#d4edda' : '#f8d7da',
            color: backbone.status === 'active' ? '#155724' : '#721c24'
          }}>
            {backbone.status === 'active' ? '🟢' : '🔴'} {backbone.status.toUpperCase()}
          </span>
          <div style={{ fontSize: isMobile ? '9px' : '11px', color: '#666' }}>
            POPs: {backbone.pops?.length || 0}
          </div>
          <div style={{ display: 'flex', gap: isMobile ? 2 : 3 }}>
            <button onClick={() => onEdit(backbone, 'backbones')} style={{ padding: isMobile ? '2px 4px' : '3px 6px', fontSize: isMobile ? '9px' : '11px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Edit</button>
            <button onClick={() => onDelete(backbone._id, 'backbones')} style={{ padding: isMobile ? '2px 4px' : '3px 6px', fontSize: isMobile ? '9px' : '11px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Network Table Component
function NetworkTable({ pops, aps, stations, backbones, onEdit, onDelete }) {
  const isMobile = window.innerWidth <= 768;

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: isMobile ? '12px' : '14px'
  };

  const thStyle = {
    padding: isMobile ? '8px 4px' : '12px 8px',
    textAlign: 'left',
    background: '#f8f9fa',
    borderBottom: '2px solid #e9ecef',
    fontWeight: 'bold',
    color: '#2d7a3e'
  };

  const tdStyle = {
    padding: isMobile ? '8px 4px' : '12px 8px',
    borderBottom: '1px solid #e9ecef',
    verticalAlign: 'top'
  };

  const groupHeaderStyle = {
    ...thStyle,
    background: '#e8f5e9',
    fontSize: isMobile ? '14px' : '16px'
  };

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Type</th>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>IP Address</th>
          <th style={thStyle}>MAC Address</th>
          <th style={thStyle}>Brand/Model</th>
          <th style={thStyle}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {pops.map(pop => (
          <React.Fragment key={pop._id}>
            {/* POP Row */}
            <tr style={{ background: '#e8f5e9' }}>
              <td style={{ ...tdStyle, fontWeight: 'bold', color: '#2d7a3e' }}>
                POP
              </td>
              <td style={tdStyle}>
                <div style={{ fontWeight: 'bold' }}>{pop.name}</div>
              </td>
              <td style={tdStyle}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 12,
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: pop.status === 'active' ? '#d4edda' : '#f8d7da',
                  color: pop.status === 'active' ? '#155724' : '#721c24'
                }}>
                  {pop.status.toUpperCase()}
                </span>
              </td>
              <td style={tdStyle}>{pop.address || 'N/A'}</td>
              <td style={tdStyle}>{pop.macAddress || 'N/A'}</td>
              <td style={tdStyle}>{pop.brand || 'N/A'}</td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={() => onEdit(pop, 'pops')} style={{ padding: '4px 6px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => onDelete(pop._id, 'pops')} style={{ padding: '4px 6px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Delete</button>
                </div>
              </td>
            </tr>
            {/* APs under this POP with their stations */}
            {aps.filter(ap => ap.pop?._id === pop._id).map(ap => (
              <React.Fragment key={ap._id}>
                <tr style={{ background: '#f0f8ff' }}>
                  <td style={{ ...tdStyle, paddingLeft: '20px', color: '#0066cc' }}>
                    AP
                  </td>
                  <td style={tdStyle}>{ap.name}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: ap.status === 'active' ? '#d4edda' : '#f8d7da',
                      color: ap.status === 'active' ? '#155724' : '#721c24'
                    }}>
                      {ap.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={tdStyle}>{ap.address || 'N/A'}</td>
                  <td style={tdStyle}>{ap.macAddress || 'N/A'}</td>
                  <td style={tdStyle}>{ap.brand || 'N/A'}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={() => onEdit(ap, 'aps')} style={{ padding: '4px 6px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => onDelete(ap._id, 'aps')} style={{ padding: '4px 6px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
                {/* Stations under this AP */}
                {stations.filter(s => s.ap._id === ap._id).map(station => (
                  <tr key={station._id} style={{ background: '#fffacd' }}>
                    <td style={{ ...tdStyle, paddingLeft: '40px', color: '#ff6600' }}>
                      Station
                    </td>
                    <td style={tdStyle}>{station.name}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 12,
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: station.status === 'active' ? '#d4edda' : '#f8d7da',
                        color: station.status === 'active' ? '#155724' : '#721c24'
                      }}>
                        {station.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>{station.address || 'N/A'}</td>
                    <td style={tdStyle}>{station.macAddress || 'N/A'}</td>
                    <td style={tdStyle}>{station.brand || 'N/A'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => onEdit(station, 'stations')} style={{ padding: '4px 6px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => onDelete(station._id, 'stations')} style={{ padding: '4px 6px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {/* Backbones connected to this POP */}
            {backbones.filter(bb => bb.pops?.some(p => p._id === pop._id)).map(backbone => (
              <tr key={backbone._id} style={{ background: '#ffe4e1' }}>
                <td style={{ ...tdStyle, paddingLeft: '20px', color: '#8b0000' }}>
                  Backbone
                </td>
                <td style={tdStyle}>{backbone.type.toUpperCase()} Backbone</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: 12,
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: backbone.status === 'active' ? '#d4edda' : '#f8d7da',
                    color: backbone.status === 'active' ? '#155724' : '#721c24'
                  }}>
                    {backbone.status.toUpperCase()}
                  </span>
                </td>
                <td style={tdStyle}>N/A</td>
                <td style={tdStyle}>N/A</td>
                <td style={tdStyle}>{backbone.details}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => onEdit(backbone, 'backbones')} style={{ padding: '4px 6px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => onDelete(backbone._id, 'backbones')} style={{ padding: '4px 6px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}