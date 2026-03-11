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

export default function NetworkManagement() {
  const { user } = useContext(AuthContext);
  const [pops, setPops] = useState([]);
  const [aps, setAps] = useState([]);
  const [stations, setStations] = useState([]);
  const [backbones, setBackbones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [deviceType, setDeviceType] = useState('pop');

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const type = deviceType + 's';
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
    setDeviceType(type.replace('s', ''));
    setFormData({ ...item });
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

  const handleStatusUpdate = async (id, type, status) => {
    try {
      await API.put(`/network/${type}/${id}`, { status });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: 32, background: 'linear-gradient(90deg, #e8f5e9 0%, #f7fff7 100%)', minHeight: '100vh', marginTop: '56px' }}>
      {/* Add Device Form */}
      <div style={{ marginBottom: 30, padding: 20, background: '#eafff3', borderRadius: 12, boxShadow: '0 4px 12px rgba(67, 233, 123, 0.1)', border: '1.5px solid #43e97b', maxWidth: 800, marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 style={{ color: '#186a3b', marginBottom: 18, fontWeight: 700 }}>Add/Edit Device</h2>
        
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

        <form onSubmit={handleSubmit}>
          {deviceType === 'pop' && (
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e' }}>Name</label>
              <input
                type="text"
                placeholder="Enter POP name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={inputStyle}
              />
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e', marginTop: 10 }}>MAC Address</label>
              <input
                type="text"
                placeholder="Enter MAC address"
                value={formData.macAddress || ''}
                onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                style={inputStyle}
              />
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e', marginTop: 10 }}>Address</label>
              <input
                type="text"
                placeholder="Enter address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
          )}

          {deviceType === 'ap' && (
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e' }}>Name</label>
              <input
                type="text"
                placeholder="Enter AP name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={inputStyle}
              />
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e', marginTop: 10 }}>MAC Address</label>
              <input
                type="text"
                placeholder="Enter MAC address"
                value={formData.macAddress || ''}
                onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                style={inputStyle}
              />
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e', marginTop: 10 }}>Address</label>
              <input
                type="text"
                placeholder="Enter address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                style={inputStyle}
              />
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e', marginTop: 10 }}>POP</label>
              <select
                value={formData.pop || ''}
                onChange={(e) => setFormData({ ...formData, pop: e.target.value })}
                required
                style={selectStyle}
              >
                <option value="">Select POP</option>
                {pops.map(pop => <option key={pop._id} value={pop._id}>{pop.name}</option>)}
              </select>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e', marginTop: 10 }}>Brand/Model</label>
              <input
                type="text"
                placeholder="Enter brand/model"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
          )}

          {deviceType === 'station' && (
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e' }}>Name</label>
              <input
                type="text"
                placeholder="Enter station name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={inputStyle}
              />
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e', marginTop: 10 }}>IP Address</label>
              <input
                type="text"
                placeholder="Enter IP address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={inputStyle}
              />
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e', marginTop: 10 }}>MAC Address</label>
              <input
                type="text"
                placeholder="Enter MAC address"
                value={formData.macAddress || ''}
                onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                style={inputStyle}
              />
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e', marginTop: 10 }}>Connected AP</label>
              <select
                value={formData.ap || ''}
                onChange={(e) => setFormData({ ...formData, ap: e.target.value })}
                required
                style={selectStyle}
              >
                <option value="">Select AP</option>
                {aps.map(ap => <option key={ap._id} value={ap._id}>{ap.name}</option>)}
              </select>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e', marginTop: 10 }}>Brand/Model</label>
              <input
                type="text"
                placeholder="Enter brand/model"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
          )}

          {deviceType === 'backbone' && (
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e' }}>Type</label>
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
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e', marginTop: 10 }}>Details</label>
              <input
                type="text"
                placeholder="Enter details"
                value={formData.details || ''}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                style={inputStyle}
              />
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#2d7a3e', marginTop: 10 }}>Connected POPs</label>
              <select
                multiple
                value={formData.pops || []}
                onChange={(e) => setFormData({ ...formData, pops: Array.from(e.target.selectedOptions, option => option.value) })}
                style={{ ...selectStyle, minHeight: 80 }}
              >
                {pops.map(pop => <option key={pop._id} value={pop._id}>{pop.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="submit" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
              {editing ? 'Update' : 'Add'} {deviceType.toUpperCase()}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setFormData({}); }} style={{ padding: '12px 24px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Network Table View */}
      <div style={{ background: '#eafff3', borderRadius: 12, boxShadow: '0 4px 12px rgba(67, 233, 123, 0.1)', border: '1.5px solid #43e97b', overflow: 'hidden' }}>
        <div style={{ padding: 20, background: '#43e97b', color: '#fff' }}>
          <h2 style={{ margin: 0 }}>Network Devices</h2>
        </div>

        <div style={{ padding: 20 }}>
          {/* POPs Table */}
          <div style={{ marginBottom: 30 }}>
            <h3 style={{ color: '#2d7a3e', marginBottom: 15 }}>POPs ({pops.length})</h3>
            {pops.length === 0 ? (
              <p style={{ color: '#666' }}>No POPs found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Name</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Address</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>MAC Address</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pops.map(pop => (
                    <tr key={pop._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: 12 }}>{pop.name}</td>
                      <td style={{ padding: 12 }}>{pop.address}</td>
                      <td style={{ padding: 12 }}>{pop.macAddress || 'N/A'}</td>
                      <td style={{ padding: 12 }}>
                        <button onClick={() => handleEdit(pop, 'pop')} style={{ marginRight: 8, padding: '6px 12px', background: '#43e97b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(pop._id, 'pops')} style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* APs Table */}
          <div style={{ marginBottom: 30 }}>
            <h3 style={{ color: '#2d7a3e', marginBottom: 15 }}>Access Points ({aps.length})</h3>
            {aps.length === 0 ? (
              <p style={{ color: '#666' }}>No APs found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Name</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Address</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Brand</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {aps.map(ap => (
                    <tr key={ap._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: 12 }}>{ap.name}</td>
                      <td style={{ padding: 12 }}>{ap.address}</td>
                      <td style={{ padding: 12 }}>{ap.brand || 'N/A'}</td>
                      <td style={{ padding: 12 }}>
                        <button onClick={() => handleEdit(ap, 'ap')} style={{ marginRight: 8, padding: '6px 12px', background: '#43e97b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(ap._id, 'aps')} style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Stations Table */}
          <div style={{ marginBottom: 30 }}>
            <h3 style={{ color: '#2d7a3e', marginBottom: 15 }}>Stations ({stations.length})</h3>
            {stations.length === 0 ? (
              <p style={{ color: '#666' }}>No stations found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Name</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>IP Address</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Brand</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map(station => (
                    <tr key={station._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: 12 }}>{station.name}</td>
                      <td style={{ padding: 12 }}>{station.address || 'N/A'}</td>
                      <td style={{ padding: 12 }}>{station.brand || 'N/A'}</td>
                      <td style={{ padding: 12 }}>
                        <button onClick={() => handleEdit(station, 'station')} style={{ marginRight: 8, padding: '6px 12px', background: '#43e97b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(station._id, 'stations')} style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Backbones Table */}
          <div>
            <h3 style={{ color: '#2d7a3e', marginBottom: 15 }}>Backbones ({backbones.length})</h3>
            {backbones.length === 0 ? (
              <p style={{ color: '#666' }}>No backbones found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Type</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Details</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #43e97b' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backbones.map(bb => (
                    <tr key={bb._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: 12 }}>{bb.type}</td>
                      <td style={{ padding: 12 }}>{bb.details || 'N/A'}</td>
                      <td style={{ padding: 12 }}>
                        <button onClick={() => handleEdit(bb, 'backbone')} style={{ marginRight: 8, padding: '6px 12px', background: '#43e97b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(bb._id, 'backbones')} style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
