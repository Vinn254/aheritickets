// src/components/Navbar.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import { motion } from 'framer-motion';

export default function Navbar({ isAuthenticated, showSidebar, setShowSidebar }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div style={{
      background: '#2d7a3e',
      color: 'white',
      padding: '6px 14px',
      minHeight: 44,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      marginTop: 0,
      borderTop: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Hamburger Menu Icon */}
        {isAuthenticated && showSidebar !== undefined && (
          <motion.button
            onClick={() => setShowSidebar(!showSidebar)}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
            title={showSidebar ? 'Hide Menu' : 'Show Menu'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        )}
        
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/') }>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: '#2d7a3e', marginRight: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Modern green WiFi icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.5 9.5C7.5 6 14.5 6 18.5 9.5" stroke="#27ae60" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M6.5 12.5C9 10.5 13 10.5 15.5 12.5" stroke="#43e97b" strokeWidth="2.2" strokeLinecap="round"/>
              <circle cx="11" cy="16" r="1.7" fill="#27ae60" />
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>AheriNET</h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {!user && (
          <>
            <button onClick={() => navigate('/login')} style={ghostBtn}>Login</button>
            <button onClick={() => navigate('/register')} style={ghostBtn}>Register</button>
          </>
        )}
      </div>
    </div>
  );
}

const menuItem = { padding: '6px 8px', cursor: 'pointer', borderRadius: 5, fontSize: 14 };
const ghostBtn = { background: 'white', color: '#2d7a3e', padding: '6px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 14 };
