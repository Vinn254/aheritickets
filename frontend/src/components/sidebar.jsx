import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_CONFIG, ROLES } from '../utils/permissions';

export default function Sidebar({ showSidebar, setShowSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || localStorage.getItem('role');

  // State for collapsible categories
  const [expandedCategories, setExpandedCategories] = useState(
    MENU_CONFIG.reduce((acc, cat) => ({ ...acc, [cat.category]: true }), {})
  );

  const go = (path) => {
    navigate(path);
  };

  const isActiveRoute = (path) => location.pathname === path;

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const MenuIcon = ({ icon }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={icon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );

  const categoryIconMap = {
    'Dashboard': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    'User Management': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M16 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    'Network Operations': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
    'Finance': 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    'Procurement': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    'Reports': 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    'Settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
  };

  const menuItemStyle = (isActive) => ({
    padding: '10px 16px',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: isActive ? '#fff' : '#1b5e20',
    marginBottom: '4px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: isActive ? '#43a047' : 'transparent',
    borderLeft: isActive ? '3px solid #2d7a3e' : '3px solid transparent',
    paddingLeft: isActive ? '13px' : '16px',
    position: 'relative',
  });

  const categoryStyle = (isExpanded) => ({
    padding: '12px 16px',
    cursor: 'pointer',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    backgroundColor: '#e8f5e9',
    borderLeft: '3px solid #43a047',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
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

  // Get role display name
  const getRoleDisplayName = (role) => {
    const roleNames = {
      superadmin: 'Super Admin',
      admin: 'Admin',
      hr: 'HR',
      csr: 'CRS',
      technician: 'Technician',
      customer: 'Customer',
      contractor: 'Contractor'
    };
    return roleNames[role] || role;
  };

  // Get dashboard path based on role
  const getDashboardPath = () => {
    switch(role) {
      case ROLES.ADMIN:
      case ROLES.SUPER_ADMIN:
      case ROLES.HR:
        return '/manage-users';
      case ROLES.CRS:
        return '/dashboard/csr';
      case ROLES.TECHNICIAN:
        return '/dashboard/technician';
      case ROLES.CUSTOMER:
        return '/dashboard/customer';
      case ROLES.CONTRACTOR:
        return '/dashboard/contractor';
      default:
        return '/dashboard';
    }
  };

  // Filter menu config based on role
  const filteredMenuConfig = MENU_CONFIG.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.roles.includes(role)
    )
  })).filter(category => category.items.length > 0);

  return (
    <motion.div
      animate={showSidebar ? 'open' : 'closed'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        left: 0,
        top: 64,
        zIndex: 1000,
        background: 'linear-gradient(180deg, #f0f7f0 0%, #e0f2e0 100%)',
        borderRight: '1px solid #c8e6c9',
        boxShadow: showSidebar ? '4px 0 12px rgba(67, 160, 71, 0.08)' : 'none',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
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
          overflowX: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid #c8e6c9' }}>
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
              padding: '12px 16px',
              margin: '12px 16px',
              backgroundColor: '#e8f5e9',
              borderRadius: '10px',
              border: '1px solid #c8e6c9'
            }}
          >
            <p style={{ margin: '0 0 4px 0', color: '#1b5e20', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {getRoleDisplayName(role)}
            </p>
            <p style={{ margin: 0, color: '#2d7a3e', fontSize: '13px', fontWeight: '600' }}>
              {user.name || user.email}
            </p>
          </motion.div>
        )}

        {/* Menu Items */}
        <motion.div
          variants={{}}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ padding: '8px 12px', flex: 1 }}
        >
          {/* Dashboard - Always visible */}
          <motion.div
            style={menuItemStyle(location.pathname === getDashboardPath() || location.pathname === '/dashboard')}
            onClick={() => go(getDashboardPath())}
            whileHover={{ backgroundColor: '#43a047', paddingLeft: '13px' }}
            whileTap={{ scale: 0.98 }}
          >
            <MenuIcon icon="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <span>Dashboard</span>
          </motion.div>

          {/* Render filtered menu categories */}
          {filteredMenuConfig.filter(cat => cat.category !== 'Dashboard').map((category, catIndex) => (
            <div key={category.category} style={{ marginBottom: '8px' }}>
              {/* Category Header */}
              <motion.div
                style={categoryStyle(expandedCategories[category.category])}
                onClick={() => toggleCategory(category.category)}
                whileHover={{ backgroundColor: '#c8e6c9' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MenuIcon icon={categoryIconMap[category.category] || 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'} />
                  <span>{category.category}</span>
                </div>
                <motion.div
                  animate={{ rotate: expandedCategories[category.category] ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </motion.div>

              {/* Category Items */}
              <AnimatePresence>
                {expandedCategories[category.category] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden', paddingLeft: '8px' }}
                  >
                    {category.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.path}
                        style={menuItemStyle(isActiveRoute(item.path))}
                        onClick={() => go(item.path)}
                        whileHover={{ backgroundColor: '#43a047', paddingLeft: '13px' }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: itemIndex * 0.05 }}
                      >
                        <span style={{ 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          backgroundColor: isActiveRoute(item.path) ? '#fff' : '#43a047',
                          flexShrink: 0 
                        }} />
                        <span>{item.name}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
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
