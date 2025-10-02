// src/pages/Landing.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';



export default function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Background image */}
      <img src="/IMG 4.PNG" alt="ISP" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        zIndex: 0,
        filter: 'brightness(0.7)'
      }} />
      {/* RGBA overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(34, 62, 60, 0.55)',
        zIndex: 1
      }} />

      {/* Floating Background Elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(67, 233, 123, 0.1)',
          zIndex: 2
        }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(56, 249, 215, 0.15)',
          zIndex: 2
        }}
        animate={{
          y: [0, 15, 0],
          x: [0, -10, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '20%',
          width: 80,
          height: 80,
          borderRadius: '20px',
          background: 'rgba(67, 233, 123, 0.08)',
          zIndex: 2
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 90, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
      />

      {/* Header */}
      <header className="landing-header" style={{
        background: '#2d7a3e',
        color: 'white',
        padding: '24px 40px 12px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 12px rgba(46,125,50,0.08)',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/') }>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#2d7a3e', marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Modern green WiFi icon */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 14C12 8 20 8 26 14" stroke="#27ae60" strokeWidth="2.8" strokeLinecap="round"/>
              <path d="M10 19C13.5 16 18.5 16 22 19" stroke="#43e97b" strokeWidth="2.8" strokeLinecap="round"/>
              <circle cx="16" cy="25" r="2.5" fill="#27ae60" />
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: 1, fontWeight: 700 }}>AheriNET</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero" style={{
        flex: 1,
        minHeight: 530,
        padding: 0,
        margin: 0,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
      }}>
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 900,
          width: '100%',
          background: 'white',
          borderRadius: 18,
          padding: '64px 56px',
          boxShadow: '0 12px 40px rgba(46,125,50,0.13)',
          textAlign: 'center',
          margin: 0,
        }}>
          <h1 style={{ color: '#2d7a3e', fontSize: 38, fontWeight: 800, marginBottom: 12, letterSpacing: 1 }}>Welcome to AheriNET Customer Support</h1>
          <p style={{ color: '#444', fontSize: 20, lineHeight: 1.6, marginBottom: 32 }}>
            Report technical issues, follow progress in real time, and receive timely support from our technicians.<br />
            Create, assign, and resolve tickets — all in one simple system.
          </p>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 18 }}>
            <motion.button
              onClick={() => navigate('/register')}
              style={{ padding: '16px 36px', background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#2d7a3e', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 18, boxShadow: '0 4px 16px rgba(46,125,50,0.2)', cursor: 'pointer', letterSpacing: 1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(46,125,50,0.3)', transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
            <motion.button
              onClick={() => navigate('/login')}
              style={{ padding: '16px 36px', background: 'transparent', color: '#2d7a3e', border: '2px solid #2d7a3e', borderRadius: 10, fontWeight: 700, fontSize: 18, cursor: 'pointer', letterSpacing: 1 }}
              whileHover={{ scale: 1.05, backgroundColor: '#2d7a3e', color: 'white', transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" style={{
        background: 'rgba(255,255,255,0.85)',
        padding: '64px 0 56px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 -2px 12px rgba(46,125,50,0.06)',
        minHeight: 320,
        zIndex: 2
      }}>
        <h2 style={{ color: '#2d7a3e', fontWeight: 700, fontSize: 30, marginBottom: 32 }}>Why Choose Us?</h2>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Feature icon="🛠️" title="Easy Ticketing" desc="Create and track support tickets in seconds." index={0} />
          <Feature icon="⚡" title="Real-Time Updates" desc="Stay informed with instant ticket status changes." index={1} />
          <Feature icon="🤝" title="Expert Support" desc="Get help from experienced technicians and CSRs." index={2} />
        </div>
      </section>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float1 {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float2 {
          0% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float3 {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .landing-header {
          animation: fadeIn 1s ease-out;
        }
        .landing-hero {
          animation: slideInUp 1s ease-out 0.3s both;
        }
        .landing-features {
          animation: fadeIn 1s ease-out 0.6s both;
        }
        .feature-card:nth-child(1) {
          animation: float1 4s ease-in-out infinite;
        }
        .feature-card:nth-child(2) {
          animation: float2 5s ease-in-out infinite;
        }
        .feature-card:nth-child(3) {
           animation: float3 6s ease-in-out infinite;
         }

         @media (max-width: 768px) {
           .landing-hero {
             min-height: auto;
           }
           .landing-hero h1 {
             font-size: 18px;
             margin-bottom: 8px;
             word-wrap: break-word;
           }
           .landing-hero p {
             font-size: 10px;
             margin-bottom: 16px;
             line-height: 1.2;
             word-wrap: break-word;
           }
           .landing-hero div[style*="background: rgba(255,255,255,0.7)"] {
             padding: 16px 12px;
             max-width: 95vw;
             word-wrap: break-word;
           }
           .landing-hero div[style*="marginTop: 24"] {
             margin-top: 16px;
           }
           .landing-hero div[style*="display: flex"][style*="justify-content: center"] {
             flex-direction: column;
             gap: 12px;
           }
           .landing-hero button {
             padding: 10px 20px;
             font-size: 12px;
             word-wrap: break-word;
           }
         }
       `}</style>
    </div>
  );
}

function Feature({ icon, title, desc, index }) {
  return (
    <motion.div
      className={`feature-card feature-${index}`}
      style={{
        background: index === 0 ? 'rgba(67, 233, 123, 0.2)' : index === 1 ? 'rgba(56, 249, 215, 0.2)' : 'rgba(255, 193, 7, 0.2)',
        borderRadius: 14,
        boxShadow: '0 4px 16px rgba(46,125,50,0.1)',
        padding: '32px 28px',
        minWidth: 220,
        maxWidth: 260,
        textAlign: 'center',
        marginBottom: 18,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      whileHover={{
        y: -5,
        boxShadow: '0 8px 24px rgba(46,125,50,0.15)',
        backgroundColor: 'rgba(67, 233, 123, 0.1)',
        transition: { duration: 0.15 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <motion.div
        style={{ fontSize: 38, marginBottom: 12 }}
        animate={{
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3 + index
        }}
      >
        {icon}
      </motion.div>
      <div style={{ fontWeight: 700, color: '#2d7a3e', fontSize: 20, marginBottom: 8 }}>{title}</div>
      <div style={{ color: '#444', fontSize: 16 }}>{desc}</div>
    </motion.div>
  );
}
