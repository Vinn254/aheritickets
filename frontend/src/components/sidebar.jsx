import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import { motion } from 'framer-motion';

export default function Sidebar({ showSidebar, setShowSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role;

  const go = (path) => {
    navigate(path);
  };

  const isActiveRoute = (path) => location.pathname === path;

  const MenuIcon = ({ icon }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={icon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );

  const menuItemStyle = (isActive) => ({
    padding: '12px 16px',
    cursor: 'pointer',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '500',
    color: isActive ? '#fff' : '#1b5e20',
    marginBottom: '8px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: isActive ? '#43a047' : 'transparent',
    borderLeft: isActive ? '4px solid #2d7a3e' : '4px solid transparent',
    paddingLeft: isActive ? '12px' : '16px',
    position: 'relative',
  });

  const logoutStyle = {
    padding: '12px 16px',
    cursor: 'pointer',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#d32f2f',
    marginTop: '30px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'transparent',
    borderLeft: '4px solid transparent',
  };

  const sidebarVariants = {
    open: { width: 280, opacity: 1 },
    closed: { width: 0, opacity: 0 }
  };

  const contentVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -10 }
  };

  return (
    <motion.div
      animate={showSidebar ? 'open' : 'closed'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        height: 'calc(100vh - 64px - 70px)',
        background: 'linear-gradient(180deg, #f0f7f0 0%, #e0f2e0 100%)',
        borderRight: '1px solid #c8e6c9',
        boxShadow: showSidebar ? '4px 0 12px rgba(67, 160, 71, 0.08)' : 'none',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={showSidebar ? 'open' : 'closed'}
        variants={contentVariants}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: 'column', 
          minWidth: 280,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingTop: '24px'
        }}
      >
        {/* Header */}
        <div style={{ paddingBottom: '24px', borderBottom: '1px solid #c8e6c9' }}>
          <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #43a047 0%, #2d7a3e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '700',
                fontSize: '18px',
                boxShadow: '0 4px 8px rgba(67, 160, 71, 0.2)'
              }}>
                A
              </div>
              <div>
                <h3 style={{ margin: '0 0 2px 0', color: '#1b5e20', fontSize: '16px', fontWeight: '700' }}>AHERI</h3>
                <p style={{ margin: 0, color: '#43a047', fontSize: '11px', fontWeight: '500' }}>Ticket</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              padding: '16px',
              margin: '16px',
              backgroundColor: '#e8f5e9',
              borderRadius: '10px',
              border: '1px solid #c8e6c9'
            }}
          >
            <p style={{ margin: '0 0 4px 0', color: '#1b5e20', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {user.role}
            </p>
            <p style={{ margin: 0, color: '#2d7a3e', fontSize: '14px', fontWeight: '600' }}>
              {user.name || user.email}
            </p>
          </motion.div>
        )}

        {/* Menu Items */}
        <motion.div
          variants={{}}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ padding: '16px', flex: 1 }}
        >
          {role === 'customer' && (
            <>
              <motion.div
                style={menuItemStyle(isActiveRoute('/tickets'))}
                onClick={() => go('/tickets')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M20 6h-8l-2-2H6c-1.1 0-1.99.9-1.99 2L4 18c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6zm0 12H6V6h5.17l2 2H20v10z" />
                <span>My Tickets</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/tickets/create'))}
                onClick={() => go('/tickets/create')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M12 5v14M5 12h14" />
                <span>Create Ticket</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/request-installation'))}
                onClick={() => go('/request-installation')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <span>Request Installation</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/quotations'))}
                onClick={() => go('/quotations')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                <span>My Quotations</span>
              </motion.div>
            </>
          )}

          {role === 'csr' && (
            <>
              <motion.div
                style={menuItemStyle(isActiveRoute('/dashboard/csr'))}
                onClick={() => go('/dashboard/csr')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <span>Dashboard</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/analytics'))}
                onClick={() => go('/analytics')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M3 3v18h18M3 12h18M3 6h18M3 18h18" />
                <span>Analytics</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/quotations'))}
                onClick={() => go('/quotations')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                <span>Quotations</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/invoices'))}
                onClick={() => go('/invoices')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                <span>Invoices</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/manage-installation-requests'))}
                onClick={() => go('/manage-installation-requests')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <span>Installation Requests</span>
              </motion.div>
            </>
          )}

          {role === 'technician' && (
            <>
              <motion.div
                style={menuItemStyle(isActiveRoute('/dashboard/technician'))}
                onClick={() => go('/dashboard/technician')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <span>Dashboard</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/my-installations'))}
                onClick={() => go('/my-installations')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <span>My Installations</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/planning'))}
                onClick={() => go('/planning')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                <span>Planning</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/customers'))}
                onClick={() => go('/customers')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                <span>Customers</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/network'))}
                onClick={() => go('/network')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <span>Network Mgmt</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/inventory'))}
                onClick={() => go('/inventory')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M20 6h-8l-2-2H6c-1.1 0-1.99.9-1.99 2L4 18c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6z" />
                <span>Inventory</span>
              </motion.div>
            </>
          )}

          {role === 'admin' && (
            <>
              <motion.div
                style={menuItemStyle(isActiveRoute('/manage-users'))}
                onClick={() => go('/manage-users')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M16 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                <span>Manage Users</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/customers'))}
                onClick={() => go('/customers')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                <span>Customers</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/analytics'))}
                onClick={() => go('/analytics')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M3 3v18h18M3 12h18M3 6h18M3 18h18" />
                <span>Analytics</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/quotations'))}
                onClick={() => go('/quotations')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                <span>Quotations</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/invoices'))}
                onClick={() => go('/invoices')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                <span>Invoices</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/network'))}
                onClick={() => go('/network')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <span>Network Mgmt</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/inventory'))}
                onClick={() => go('/inventory')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M20 6h-8l-2-2H6c-1.1 0-1.99.9-1.99 2L4 18c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6z" />
                <span>Inventory</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/manage-installation-requests'))}
                onClick={() => go('/manage-installation-requests')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <span>Installation Requests</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/reports'))}
                onClick={() => go('/reports')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                <span>Reports</span>
              </motion.div>
              <motion.div
                style={menuItemStyle(isActiveRoute('/planning'))}
                onClick={() => go('/planning')}
                whileHover={{ backgroundColor: '#43a047', paddingLeft: '12px' }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuIcon icon="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                <span>Planning</span>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            padding: '0 16px',
            borderTop: '1px solid #c8e6c9',
            paddingTop: '16px'
          }}
        >
          <motion.div
            style={logoutStyle}
            onClick={logout}
            whileHover={{ 
              backgroundColor: '#ffebee',
              paddingLeft: '12px',
              color: '#c62828'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <MenuIcon icon="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5m0 0l-5-5m5 5H9" />
            <span>Logout</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}