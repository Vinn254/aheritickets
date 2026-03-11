
import React, { useState, useContext } from 'react';


export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  let user = undefined;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      if (parsed && typeof parsed === 'object') {
        user = parsed;
      }
    }
  } catch (e) {
    user = undefined;
  }

  const phone = import.meta.env.VITE_WHATSAPP_NUMBER || '254735555660'; // change
  let prefill = 'Hello, I need help';
  if (user && (typeof user.name === 'string' || typeof user.email === 'string')) {
    prefill = `Hello, I need help with my ticket system. User: ${user.name || user.email}`;
  }
  prefill = encodeURIComponent(prefill);

  return (
    <>
      {localStorage.getItem('token') && (
        <div>
          {open && (
            <div style={{
              position: 'fixed', right: 90, bottom: 90, width: 300, background: 'white', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 16, zIndex: 2000
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ color: '#2d7a3e' }}>Contact Support</strong>
                <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
              </div>
              <p style={{ margin: '8px 0', color: '#333' }}>Tap the button to open WhatsApp and contact support.</p>
              <a href={`https://wa.me/${phone}?text=${prefill}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '10px 14px', background: '#25d366', color: 'white', borderRadius: 8, textDecoration: 'none' }}>
                Open WhatsApp
              </a>
            </div>
          )}

          <button
            onClick={() => setOpen(v => !v)}
            title="Contact support on WhatsApp"
            style={{
              position: 'fixed',
              right: 20,
              bottom: 20,
              width: 56,
              height: 56,
              borderRadius: 56,
              background: '#25d366',
              border: 'none',
              boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              zIndex: 2000,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: 2 }}>
              <path d="M20 2H4C2.89 2 2 2.89 2 4v16l4-4h14c1.1 0 2-0.9 2-2V4c0-1.11-0.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
