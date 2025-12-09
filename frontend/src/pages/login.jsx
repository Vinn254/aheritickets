import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { AuthContext } from '../context/authcontext';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
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
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      .login-form {
        animation: fadeIn 0.4s ease-out;
      }
      .login-input {
        animation: slideInLeft 0.3s ease-out both;
        animation-delay: calc(var(--index) * 0.05s);
      }
      .login-button {
        animation: slideInLeft 0.3s ease-out 0.15s both;
      }
      .error-shake {
        animation: shake 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

    const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await API.authPost('/auth/login', { email, password });
      console.log("Login response:", res); // debug output

      const token = res.token;
      const user = res.user;
      login(user, token); // save in context
      // Redirect to the correct dashboard for the user's role
      if (user.role === 'customer') {
        navigate('/dashboard/customer');
      } else if (user.role === 'csr') {
        navigate('/dashboard/csr');
      } else if (user.role === 'technician') {
        navigate('/dashboard/technician');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error);
      setErr(error.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #e9f5ee 0%, #f7fff7 100%)', padding: 24 }}>
      <form onSubmit={submit} className="login-form" style={{ width: '100%', maxWidth: 400, margin: '0 auto', background: 'white', padding: 32, borderRadius: 16, boxShadow: '0 12px 32px rgba(0,0,0,0.1)', border: '1px solid #e8f5e9' }}>
        <h2 style={{ marginTop: 0, color: '#2d7a3e', textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Login</h2>
        {err && <div className="error-shake" style={{ color: '#d32f2f', marginBottom: 16, padding: '8px 12px', background: '#ffebee', borderRadius: 8, border: '1px solid #ffcdd2', textAlign: 'center', fontWeight: 600 }}>{err}</div>}
        <motion.input
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          placeholder="Email"
          required
          className="login-input"
          style={{ ...inputStyle, '--index': 0, border: '2px solid #e8f5e9' }}
          whileFocus={{
            borderColor: '#43e97b',
            boxShadow: '0 4px 12px rgba(67, 233, 123, 0.2)',
            scale: 1.02
          }}
          transition={{ duration: 0.15 }}
        />
        <motion.input
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          placeholder="Password"
          required
          className="login-input"
          style={{ ...inputStyle, '--index': 1, border: '2px solid #e8f5e9' }}
          whileFocus={{
            borderColor: '#43e97b',
            boxShadow: '0 4px 12px rgba(67, 233, 123, 0.2)',
            scale: 1.02
          }}
          transition={{ duration: 0.15 }}
        />
        <motion.button
          type="submit"
          className="login-button"
          style={{ ...primaryBtn, width: '100%', background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', boxShadow: '0 4px 16px rgba(67, 233, 123, 0.3)' }}
          whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(67, 233, 123, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          Sign in
        </motion.button>
        <p style={{ marginTop: 20, textAlign: 'center', color: '#666' }}>No account? <Link to="/register" style={{ color: '#2d7a3e', fontWeight: 600, textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseOver={e => e.target.style.color = '#43e97b'} onMouseOut={e => e.target.style.color = '#2d7a3e'}>Register</Link></p>
        <p style={{ marginTop: 12, textAlign: 'center' }}>
          <Link to="/" style={{ color: '#666', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseOver={e => e.target.style.color = '#2d7a3e'} onMouseOut={e => e.target.style.color = '#666'}>&#8592; Back to Landing Page</Link>
        </p>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', padding: 14, marginBottom: 16, borderRadius: 8, border: '2px solid #e8f5e9', fontSize: 16, background: '#fafafa' };
const primaryBtn = { padding: 14, background: '#2d7a3e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 600 };