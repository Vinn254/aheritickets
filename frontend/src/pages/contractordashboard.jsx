// src/pages/ContractorDashboard.jsx
import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ContractorDashboard() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = () => {
      API.get('/tickets?assignedTo=' + (JSON.parse(localStorage.getItem('user') || '{}')._id || ''))
        .then(res => {
          let payload = [];
          if (res && Array.isArray(res.tickets)) {
            payload = res.tickets;
          } else if (res && res.data && Array.isArray(res.data.tickets)) {
            payload = res.data.tickets;
          } else if (res && Array.isArray(res.data)) {
            payload = res.data;
          }
          setTickets(payload);
        })
        .catch(console.error);
    };
    fetchTickets();
    let interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter tickets based on search and status
  useEffect(() => {
    let result = tickets;
    
    if (search) {
      result = result.filter(t => 
        (t.customer && t.customer.name && t.customer.name.toLowerCase().includes(search.toLowerCase())) ||
        (t.title && t.title.toLowerCase().includes(search.toLowerCase())) ||
        (t.issue && t.issue.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    setFilteredTickets(result);
  }, [search, statusFilter, tickets]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  React.useEffect(() => {
    if (searchInput === '') setSearch('');
  }, [searchInput]);

  const getStatusColor = (status) => {
    const colors = {
      'open': '#ff6b6b',
      'pending': '#ffd93d',
      'in-progress': '#4ecdc4',
      'closed': '#43a047',
      'resolved': '#43a047'
    };
    return colors[status?.toLowerCase()] || '#999';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      'open': '#ffe8e8',
      'pending': '#fff8e1',
      'in-progress': '#e0f7f6',
      'closed': '#e8f5e9',
      'resolved': '#e8f5e9'
    };
    return colors[status?.toLowerCase()] || '#f5f5f5';
  };

  const statuses = ['open', 'pending', 'in-progress', 'closed', 'resolved'];
  const statusStats = statuses.map(status => ({
    status,
    count: tickets.filter(t => t.status === status).length
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={{
      padding: '20px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eafff3 0%, #f7fff7 100%)',
      boxSizing: 'border-box'
    }}>
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px', textAlign: 'center' }}
      >
        <h1 style={{ 
          color: '#2d7a3e', 
          margin: '0 0 8px 0', 
          fontSize: 'clamp(24px, 5vw, 36px)', 
          fontWeight: '800',
          textShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          Contractor Dashboard
        </h1>
        <p style={{ 
          color: '#4a4a4a', 
          fontSize: 'clamp(14px, 3vw, 16px)', 
          marginTop: '8px', 
          opacity: 0.8,
          margin: '8px 0 0 0'
        }}>
          Manage and track your assigned customer tickets
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginBottom: '32px'
        }}
      >
        {statusStats.map((stat) => (
          <motion.div
            key={stat.status}
            variants={cardVariants}
            onClick={() => setStatusFilter(stat.status)}
            style={{
              background: getStatusBgColor(stat.status),
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              border: `2px solid ${statusFilter === stat.status ? getStatusColor(stat.status) : 'transparent'}`,
              transition: 'all 0.3s ease',
              boxShadow: statusFilter === stat.status ? `0 4px 12px ${getStatusColor(stat.status)}40` : '0 2px 4px rgba(0,0,0,0.05)'
            }}
            whileHover={{ transform: 'translateY(-4px)' }}
          >
            <div style={{ fontSize: '24px', fontWeight: '800', color: getStatusColor(stat.status) }}>
              {stat.count}
            </div>
            <div style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize', marginTop: '4px', fontWeight: '500' }}>
              {stat.status}
            </div>
          </motion.div>
        ))}
        <motion.div
          variants={cardVariants}
          onClick={() => setStatusFilter('all')}
          style={{
            background: '#f0f0f0',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            border: `2px solid ${statusFilter === 'all' ? '#333' : 'transparent'}`,
            transition: 'all 0.3s ease'
          }}
          whileHover={{ transform: 'translateY(-4px)' }}
        >
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>
            {tickets.length}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontWeight: '500' }}>
            All Tickets
          </div>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSearch} 
        style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search by customer name, issue, or title..."
          style={{ 
            padding: '12px 16px', 
            borderRadius: '8px', 
            border: '2px solid #43e97b', 
            fontSize: '14px', 
            background: '#fff', 
            boxShadow: '0 2px 8px rgba(67, 233, 123, 0.1)',
            flex: '1',
            minWidth: '250px',
            fontFamily: 'inherit'
          }}
        />
        <button 
          type="submit" 
          style={{ 
            padding: '12px 24px', 
            background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '14px', 
            fontWeight: '600', 
            boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 16px rgba(67, 233, 123, 0.4)'}
          onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 12px rgba(67, 233, 123, 0.3)'}
        >
          Search
        </button>
      </motion.form>

      {/* Tickets Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}
      >
        {filteredTickets.length > 0 ? (
          filteredTickets.map((t, index) => (
            <motion.div
              key={t._id}
              variants={cardVariants}
              whileHover={{ transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                border: `2px solid ${getStatusBgColor(t.status)}`,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Card Header with Status */}
              <div style={{
                background: getStatusBgColor(t.status),
                padding: '12px 16px',
                borderBottom: `3px solid ${getStatusColor(t.status)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-block',
                    background: getStatusColor(t.status),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {t.status}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: '#2d7a3e',
                  fontSize: '16px',
                  fontWeight: '700',
                  lineHeight: '1.4'
                }}>
                  {t.title || t.issue}
                </h3>

                <p style={{
                  color: '#666',
                  fontSize: '13px',
                  margin: '0 0 12px 0',
                  flex: 1,
                  lineHeight: '1.5'
                }}>
                  {t.description?.slice(0, 100)}
                  {t.description && t.description.length > 100 ? '...' : ''}
                </p>

                {/* Customer Info */}
                <div style={{
                  background: '#f9f9f9',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '12px',
                  color: '#555'
                }}>
                  <strong>Customer:</strong> {t.customer?.name || 'N/A'}
                </div>

                {/* Footer with Action */}
                <button
                  onClick={() => navigate(`/tickets/${t._id}`)}
                  style={{
                    marginTop: 'auto',
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #2d7a3e 0%, #43a047 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 12px rgba(45, 122, 62, 0.3)'}
                  onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 20px',
              color: '#999'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>
              No tickets found matching your criteria
            </p>
            {search || statusFilter !== 'all' ? (
              <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
                Try adjusting your search or filters
              </p>
            ) : null}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
