// src/components/Footer.js
import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      width: '100%',
      background: 'linear-gradient(90deg, #1b5e20 0%, #388e3c 100%)',
      color: 'white',
      padding: '24px 0 12px 0',
      textAlign: 'center',
      position: 'relative',
      fontSize: 16,
      letterSpacing: 1,
      boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
      marginTop: 'auto',
      zIndex: 99,
      flexShrink: 0
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ marginBottom: 8 }}>
          <strong>AheriNET System</strong> &nbsp;|&nbsp; <a href="mailto:support@aheri.net" style={{ color: '#27ae60', textDecoration: 'none' }}>Contact Support</a>
        </div>
  <div>© {new Date().getFullYear()} AheriNET. All rights reserved.</div>
      </div>
    </footer>
  );
}
