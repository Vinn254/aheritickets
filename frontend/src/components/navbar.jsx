// src/components/Navbar.js
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ isAuthenticated }) {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const role = user?.role;

  const go = (path) => { setOpen(false); navigate(path); };

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

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            <div style={{ position: 'relative' }}>
              <motion.button
                onClick={() => setOpen(!open)}
                style={{ background: 'rgba(19, 97, 97, 1)', color: '#2d7a3e', padding: '6px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.9)' }}
                whileTap={{ scale: 0.95 }}
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.15 }}
              >
                Menu ⏷
              </motion.button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{ position: 'absolute', right: 0, marginTop: 8, background: 'white', color: '#333', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)', minWidth: 200, zIndex: 100, originY: 0 }}
                  >
                    <div style={{ padding: 8 }}>
                      {/* Dashboard removed from menu; user lands on dashboard by default after login */}
                      {role === 'customer' && <motion.div style={menuItem} onClick={() => go('/tickets')} whileHover={{ backgroundColor: '#f0f0f0', scale: 1.02 }} whileTap={{ scale: 0.98 }}>My Tickets</motion.div>}
                      {role === 'customer' && <motion.div style={menuItem} onClick={() => go('/tickets/create')} whileHover={{ backgroundColor: '#f0f0f0', scale: 1.02 }} whileTap={{ scale: 0.98 }}>Create Ticket</motion.div>}
                      {role === 'csr' && <motion.div style={menuItem} onClick={() => go('/dashboard/csr')} whileHover={{ backgroundColor: '#f0f0f0', scale: 1.02 }} whileTap={{ scale: 0.98 }}>CSR - Open Tickets</motion.div>}
                      {role === 'technician' && <motion.div style={menuItem} onClick={() => go('/dashboard/technician')} whileHover={{ backgroundColor: '#f0f0f0', scale: 1.02 }} whileTap={{ scale: 0.98 }}>Tech - Assigned</motion.div>}
                      {role === 'admin' && <motion.div style={menuItem} onClick={() => go('/manage-users')} whileHover={{ backgroundColor: '#f0f0f0', scale: 1.02 }} whileTap={{ scale: 0.98 }}>Manage Users</motion.div>}
                      {role === 'admin' && <motion.div style={menuItem} onClick={() => go('/analytics')} whileHover={{ backgroundColor: '#f0f0f0', scale: 1.02 }} whileTap={{ scale: 0.98 }}>Analytics</motion.div>}
                      {role === 'csr' && <motion.div style={menuItem} onClick={() => go('/analytics')} whileHover={{ backgroundColor: '#f0f0f0', scale: 1.02 }} whileTap={{ scale: 0.98 }}>Analytics</motion.div>}
                      {(role === 'admin' || role === 'technician') && <motion.div style={menuItem} onClick={() => go('/network')} whileHover={{ backgroundColor: '#f0f0f0', scale: 1.02 }} whileTap={{ scale: 0.98 }}>Network Management</motion.div>}
                      {(role === 'admin' || role === 'technician') && <motion.div style={menuItem} onClick={() => go('/inventory')} whileHover={{ backgroundColor: '#f0f0f0', scale: 1.02 }} whileTap={{ scale: 0.98 }}>Inventory</motion.div>}
                      <div style={{ height: 1, background: '#eee', margin: '8px 0' }} />
                      <motion.div style={menuItem} onClick={logout} whileHover={{ backgroundColor: '#ffebee', scale: 1.02 }} whileTap={{ scale: 0.98 }}>Logout</motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
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
