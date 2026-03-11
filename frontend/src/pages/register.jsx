// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
  const res = await API.post('/api/auth/register', { name, phone, email, password });
      // backend may return token+user; if so we can auto-login. To be safe, just go to login.
      navigate('/login');
    } catch (error) {
      setErr(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', background: '#f1fbe9', padding: 24 }}>
        <form onSubmit={submit} style={{ width: 420, background: 'white', padding: 24, borderRadius: 10, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, color: '#2d7a3e' }}>Register (Customer)</h2>
          {err && <div style={{ color: 'red', marginBottom: 8 }}>{err}</div>}
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" required style={inputStyle} />
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone number" required style={inputStyle} />
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" required style={inputStyle} />
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" required style={inputStyle} />
          <button type="submit" style={{ ...primaryBtn, width: '100%' }}>Create account</button>
        </form>
      </div>
    </>
  );
}

const inputStyle = { width: '100%', padding: 10, marginBottom: 10, borderRadius: 6, border: '1px solid #ddd' };
const primaryBtn = { padding: 10, background: '#2d7a3e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' };
