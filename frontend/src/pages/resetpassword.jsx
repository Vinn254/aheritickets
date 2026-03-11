import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import { motion } from 'framer-motion';
import { FaTicketAlt } from 'react-icons/fa';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-30px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .reset-form {
        animation: fadeIn 0.4s ease-out;
      }
      .reset-input {
        animation: slideInLeft 0.3s ease-out both;
        animation-delay: calc(var(--index) * 0.05s);
      }
      .reset-button {
        animation: slideInLeft 0.3s ease-out 0.15s both;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await API.authPost('/api/auth/reset-password', {
        token,
        password,
        passwordConfirm
      });
      setSuccess(true);
      // Auto-redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e9f5ee 0%, #f7fff7 100%)',
      padding: 24
    }}>
      <motion.form
        onSubmit={handleSubmit}
        className="reset-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: 450,
          margin: '0 auto',
          background: 'white',
          padding: 40,
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          border: '1px solid #e8f5e9'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <FaTicketAlt size={60} color="#2d7a3e" style={{ marginBottom: 16 }} />
          <h2 style={{ margin: 0, color: '#2d7a3e', fontSize: 32, fontWeight: 700 }}>Create New Password</h2>
          <p style={{ color: '#666', fontSize: 16, marginTop: 8 }}>Enter a new password for your account</p>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              color: '#1b5e20',
              marginBottom: 20,
              padding: '16px',
              background: '#e8f5e9',
              borderRadius: 10,
              border: '1px solid #c8e6c9',
              textAlign: 'center',
              fontWeight: 600
            }}
          >
            ✓ Password reset successful! Redirecting to login...
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              color: '#d32f2f',
              marginBottom: 20,
              padding: '12px 16px',
              background: '#ffebee',
              borderRadius: 10,
              border: '1px solid #ffcdd2',
              textAlign: 'center',
              fontWeight: 600
            }}
          >
            ✕ {error}
          </motion.div>
        )}

        {!success ? (
          <>
            <motion.input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              required
              disabled={loading}
              className="reset-input"
              style={{
                ...inputStyle,
                '--index': 0,
                border: '2px solid #e8f5e9',
                marginBottom: 16,
                opacity: loading ? 0.6 : 1
              }}
              whileFocus={{
                borderColor: '#43e97b',
                boxShadow: '0 4px 12px rgba(67, 233, 123, 0.2)'
              }}
              transition={{ duration: 0.15 }}
            />

            <motion.input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm Password"
              required
              disabled={loading}
              className="reset-input"
              style={{
                ...inputStyle,
                '--index': 1,
                border: '2px solid #e8f5e9',
                marginBottom: 20,
                opacity: loading ? 0.6 : 1
              }}
              whileFocus={{
                borderColor: '#43e97b',
                boxShadow: '0 4px 12px rgba(67, 233, 123, 0.2)'
              }}
              transition={{ duration: 0.15 }}
            />

            <motion.button
              type="submit"
              disabled={loading}
              className="reset-button"
              style={{
                ...primaryBtn,
                width: '100%',
                background: loading ? '#ccc' : 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(67, 233, 123, 0.3)',
                borderRadius: 10,
                fontSize: 18,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              whileHover={!loading ? { y: -2, boxShadow: '0 6px 20px rgba(67, 233, 123, 0.4)' } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              transition={{ duration: 0.15 }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </motion.button>
          </>
        ) : null}

        <p style={{ marginTop: 24, textAlign: 'center', color: '#666' }}>
          <Link
            to="/login"
            style={{
              color: '#2d7a3e',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'color 0.3s ease'
            }}
            onMouseOver={(e) => (e.target.style.color = '#43e97b')}
            onMouseOut={(e) => (e.target.style.color = '#2d7a3e')}
          >
            Back to Login
          </Link>
        </p>

        <p style={{ marginTop: 16, textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              color: '#666',
              textDecoration: 'none',
              transition: 'color 0.3s ease'
            }}
            onMouseOver={(e) => (e.target.style.color = '#2d7a3e')}
            onMouseOut={(e) => (e.target.style.color = '#666')}
          >
            &#8592; Back to Home
          </Link>
        </p>
      </motion.form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: 14,
  borderRadius: 10,
  border: '2px solid #e0e0e0',
  fontSize: 16,
  background: '#fafafa',
  outline: 'none'
};
const primaryBtn = {
  padding: 16,
  color: 'white',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  fontSize: 18,
  fontWeight: 600
};
