// frontend/src/pages/inventory.jsx
import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import ErrorBoundary from '../components/ErrorBoundary';

// Style objects
const inputStyle = { padding: 8, borderRadius: 6, border: '1px solid #ddd' };
const primaryBtn = { padding: '8px 12px', background: '#2d7a3e', color: 'white', border: 'none', borderRadius: 6 };
const th = { padding: 10, border: '1px solid #eee' };
const td = { padding: 10, border: '1px solid #eee' };

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [counts, setCounts] = useState([]);
  const [deviceType, setDeviceType] = useState('AP');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState('in stock');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterDeviceType, setFilterDeviceType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');

  useEffect(() => {
    fetchInventory();
    fetchCounts();
  }, []);

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams();
      if (filterDeviceType) params.append('deviceType', filterDeviceType);
      if (filterCategory) params.append('category', filterCategory);
      if (filterBrand) params.append('brand', filterBrand);
      const data = await API.get(`/inventory?${params}`);
      setInventory(data.inventory || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCounts = async () => {
    try {
      const data = await API.get('/inventory/counts');
      setCounts(data.counts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const payload = { deviceType, brand, model, serialNumber, category, location, notes };
      await API.post('/inventory', payload);
      setMsg('Item added');
      resetForm();
      fetchInventory();
      fetchCounts();
    } catch (err) {
      setMsg('Failed to add item');
    }
  };

  const resetForm = () => {
    setDeviceType('AP');
    setBrand('');
    setModel('');
    setSerialNumber('');
    setCategory('in stock');
    setLocation('');
    setNotes('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await API.delete(`/inventory/${id}`);
      setMsg('Item deleted');
      fetchInventory();
      fetchCounts();
    } catch (err) {
      setMsg('Failed to delete item');
    }
  };

  const filteredInventory = inventory.filter(item =>
    (!search || item.serialNumber.toLowerCase().includes(search.toLowerCase()) || item.brand.toLowerCase().includes(search.toLowerCase())) &&
    (!filterDeviceType || item.deviceType === filterDeviceType) &&
    (!filterCategory || item.category === filterCategory) &&
    (!filterBrand || item.brand.toLowerCase().includes(filterBrand.toLowerCase()))
  );

  return (
    <ErrorBoundary componentName="Inventory">
      <div style={{ padding: 32, background: 'linear-gradient(90deg, #e8f5e9 0%, #f7fff7 100%)', minHeight: '60vh', marginTop: 56 }}>
        <h2 style={{ color: '#186a3b', fontWeight: 700, fontSize: 28, marginBottom: 18, letterSpacing: 1 }}>Inventory Management</h2>

        {/* Counts Display */}
        <div style={{ marginBottom: 20 }}>
          <h3>Inventory Counts</h3>
          {counts.map(count => (
            <div key={count._id} style={{ marginBottom: 10 }}>
              <strong>{count._id}:</strong> Total {count.total}
              {count.categories.map(cat => (
                <span key={cat.category} style={{ marginLeft: 10 }}>
                  {cat.category}: {cat.count}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by serial number or brand..."
            style={{ ...inputStyle, minWidth: 200 }}
          />
          <button type="submit" style={primaryBtn}>Search</button>
        </form>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <select value={filterDeviceType} onChange={e => setFilterDeviceType(e.target.value)} style={inputStyle}>
            <option value="">All Device Types</option>
            <option value="AP">AP</option>
            <option value="Backbone">Backbone</option>
            <option value="POP">POP</option>
            <option value="Station">Station</option>
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={inputStyle}>
            <option value="">All Categories</option>
            <option value="deployed">Deployed</option>
            <option value="in stock">In Stock</option>
            <option value="spoiled">Spoiled</option>
          </select>
          <input
            type="text"
            value={filterBrand}
            onChange={e => setFilterBrand(e.target.value)}
            placeholder="Filter by brand"
            style={inputStyle}
          />
          <button onClick={fetchInventory} style={primaryBtn}>Apply Filters</button>
        </div>

        {/* Add Form */}
        <form onSubmit={addItem} style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 10,
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          padding: 20,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(44, 130, 89, 0.18)',
          alignItems: 'center',
        }}>
          <select value={deviceType} onChange={e => setDeviceType(e.target.value)} style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }}>
            <option value="AP">AP</option>
            <option value="Backbone">Backbone</option>
            <option value="POP">POP</option>
            <option value="Station">Station</option>
          </select>
          <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Brand" required style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
          <input value={model} onChange={e => setModel(e.target.value)} placeholder="Model" style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
          <input value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="Serial Number" required style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }}>
            <option value="deployed">Deployed</option>
            <option value="in stock">In Stock</option>
            <option value="spoiled">Spoiled</option>
          </select>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes" style={{ ...inputStyle, minWidth: 120, flex: 1, background: '#eafff3', border: '1.5px solid #43e97b', color: '#186a3b', fontWeight: 600 }} />
          <button type="submit" style={{ ...primaryBtn, minWidth: 90, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', fontWeight: 700, boxShadow: '0 2px 8px rgba(44,130,89,0.18)' }}>Add</button>
        </form>

        {msg && (
          <div style={{
            marginBottom: 12,
            padding: '8px 16px',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 14,
            background: msg.includes('added') || msg.includes('deleted') ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' : 'linear-gradient(90deg, #ff5252 0%, #ffb199 100%)',
            color: '#fff',
            boxShadow: msg.includes('added') || msg.includes('deleted') ? '0 2px 6px rgba(44,130,89,0.15)' : '0 2px 6px rgba(255,82,82,0.15)',
            textAlign: 'center',
            letterSpacing: 0.5,
            maxWidth: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {msg}
          </div>
        )}

        {/* Inventory Table */}
        <div style={{
          background: 'linear-gradient(135deg, #eafff3 0%, #f7fff7 100%)',
          borderRadius: 14,
          boxShadow: '0 4px 24px rgba(44, 130, 89, 0.13)',
          padding: 18,
          marginTop: 20,
          maxWidth: 1200,
          marginLeft: 'auto',
          marginRight: 'auto',
          overflowX: 'auto',
        }}>
          <h3 style={{ color: '#186a3b', fontWeight: 700, marginBottom: 18 }}>Inventory Items</h3>
          <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', fontSize: 14, color: '#1a2d1a', fontWeight: 500 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', fontWeight: 800 }}>
                <th style={th}>Device Type</th>
                <th style={th}>Brand</th>
                <th style={th}>Model</th>
                <th style={th}>Serial Number</th>
                <th style={th}>Category</th>
                <th style={th}>Location</th>
                <th style={th}>Notes</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, i) => (
                <tr key={item._id} style={{ background: i % 2 === 0 ? '#e8f5e9' : '#fff' }}>
                  <td style={td}>{item.deviceType}</td>
                  <td style={td}>{item.brand}</td>
                  <td style={td}>{item.model || '-'}</td>
                  <td style={td}>{item.serialNumber}</td>
                  <td style={td}>{item.category}</td>
                  <td style={td}>{item.location || '-'}</td>
                  <td style={td}>{item.notes || '-'}</td>
                  <td style={td}>
                    <EditItem item={item} onUpdate={() => { fetchInventory(); fetchCounts(); }} />
                    <button onClick={() => handleDelete(item._id)} style={{ ...primaryBtn, background: '#ff5252', padding: '4px 8px', fontSize: 13, marginLeft: 8 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Edit Item Component
function EditItem({ item, onUpdate }) {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    deviceType: item.deviceType,
    brand: item.brand,
    model: item.model || '',
    serialNumber: item.serialNumber,
    category: item.category,
    location: item.location || '',
    notes: item.notes || ''
  });
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setMsg('');
    try {
      await API.put(`/inventory/${item._id}`, formData);
      setMsg('Updated');
      setShow(false);
      onUpdate();
    } catch (err) {
      setMsg('Failed');
    }
  };

  return show ? (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, maxWidth: 600, width: '90%' }}>
        <h4>Edit Inventory Item</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <select name="deviceType" value={formData.deviceType} onChange={handleChange} style={inputStyle}>
            <option value="AP">AP</option>
            <option value="Backbone">Backbone</option>
            <option value="POP">POP</option>
            <option value="Station">Station</option>
          </select>
          <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand" style={inputStyle} />
          <input name="model" value={formData.model} onChange={handleChange} placeholder="Model" style={inputStyle} />
          <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="Serial Number" style={inputStyle} />
          <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
            <option value="deployed">Deployed</option>
            <option value="in stock">In Stock</option>
            <option value="spoiled">Spoiled</option>
          </select>
          <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" style={inputStyle} />
          <input name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" style={inputStyle} />
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={handleSave} style={primaryBtn}>Save</button>
          <button onClick={() => setShow(false)} style={{ ...primaryBtn, background: '#aaa' }}>Cancel</button>
        </div>
        {msg && <div style={{ marginTop: 10, color: msg === 'Updated' ? 'green' : 'red' }}>{msg}</div>}
      </div>
    </div>
  ) : (
    <button onClick={() => setShow(true)} style={{ ...primaryBtn, padding: '4px 8px', fontSize: 13 }}>Edit</button>
  );
}