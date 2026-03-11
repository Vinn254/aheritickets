// src/context/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // optional: validate token on mount
    if (token && !user) {
      API.get('/api/auth/me').then(res => {
        setUser(res.data.user || res.data);
        localStorage.setItem('user', JSON.stringify(res.data.user || res.data));
      }).catch(() => {
        logout();
      });
    }
    // eslint-disable-next-line
  }, []);

  const login = (userObj, jwt) => {
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('role', userObj.role);
    localStorage.setItem('name', userObj.name || userObj.username || userObj.email);
    setUser(userObj);
    setToken(jwt);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
