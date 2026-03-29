// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { motion } from 'framer-motion';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  // Common email extensions to support
  const emailExtensions = ['.com', '.net', '.org', '.co.ke', '.ke', '.io', '.co', '.info', '.biz', '.gov', '.ac.ke'];

  const validateEmail = (email) => {
    // Allow multiple domain extensions
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    // Clear email error when user types
    if (emailError) {
      setEmailError('');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setEmailError('');

    // Validate email
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f1fbe9 0%, #e8f5e9 100%)', 
        padding: 24 
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: 420, background: 'white', padding: 32, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #43a047 0%, #2d7a3e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(67, 160, 71, 0.3)'
            }}>
              <span style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>A</span>
            </div>
            <h2 style={{ margin: 0, color: '#2d7a3e', fontSize: 24, fontWeight: '700' }}>Create Account</h2>
            <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: 14 }}>Join AHERI Tickets Platform</p>
          </div>
          
          {err && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ 
                background: '#ffebee', 
                color: '#c62828', 
                padding: '12px 16px', 
                borderRadius: 8, 
                marginBottom: 16,
                fontSize: 14
              }}
            >
              {err}
            </motion.div>
          )}
          
          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#333', fontSize: 14, fontWeight: '500' }}>Full Name *</label>
              <input 
                value={name} 
                onChange={e=>setName(e.target.value)} 
                placeholder="Enter your full name" 
                required 
                style={inputStyle} 
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#333', fontSize: 14, fontWeight: '500' }}>Phone Number *</label>
              <input 
                value={phone} 
                onChange={e=>setPhone(e.target.value)} 
                placeholder="e.g., +254712345678" 
                required 
                style={inputStyle} 
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#333', fontSize: 14, fontWeight: '500' }}>Email Address *</label>
              <input 
                value={email} 
                onChange={handleEmailChange} 
                type="text"
                placeholder="e.g., user@company.com" 
                required 
                style={{ 
                  ...inputStyle, 
                  borderColor: emailError ? '#f44336' : '#ddd' 
                }} 
              />
              {emailError && (
                <span style={{ color: '#f44336', fontSize: 12, marginTop: 4, display: 'block' }}>{emailError}</span>
              )}
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#999' }}>Supported extensions:</span>
                {emailExtensions.slice(0, 5).map(ext => (
                  <span key={ext} style={{ fontSize: 10, color: '#666', background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{ext}</span>
                ))}
                <span style={{ fontSize: 10, color: '#666' }}>+more</span>
              </div>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#333', fontSize: 14, fontWeight: '500' }}>Password *</label>
              <input 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                type="password" 
                placeholder="Create a strong password" 
                required 
                minLength={6}
                style={inputStyle} 
              />
              <span style={{ fontSize: 11, color: '#999', marginTop: 4, display: 'block' }}>Minimum 6 characters</span>
            </div>
            
            <button 
              type="submit" 
              style={{ 
                ...primaryBtn, 
                width: '100%',
                padding: 14,
                fontSize: 16
              }}
            >
              Create Account
            </button>
          </form>
          
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <span style={{ color: '#666', fontSize: 14 }}>Already have an account? </span>
            <a 
              href="/login" 
              style={{ color: '#43a047', fontSize: 14, fontWeight: '600', textDecoration: 'none' }}
            >
              Sign In
            </a>
          </div>
        </motion.div>
      </div>
    </>
  );
}

const inputStyle = { 
  width: '100%', 
  padding: 12, 
  marginBottom: 0, 
  borderRadius: 8, 
  border: '1px solid #ddd',
  fontSize: 14,
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

const primaryBtn = { 
  padding: 12, 
  background: 'linear-gradient(135deg, #43a047 0%, #2d7a3e 100%)', 
  color: 'white', 
  border: 'none', 
  borderRadius: 8, 
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: 14,
  transition: 'transform 0.2s, box-shadow 0.2s'
};
