// src/pages/Landing.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const Package = ({ speed, price, speedUnit, color, index, features, popular }) => (
    <motion.div
      className={`package-card package-${index}`}
      style={{
        background: `linear-gradient(145deg, ${color}15 0%, ${color}25 100%)`,
        borderRadius: 20,
        boxShadow: popular ? `0 16px 48px ${color}40` : '0 8px 32px rgba(46,125,50,0.15)',
        padding: '40px 28px',
        minWidth: 260,
        maxWidth: 280,
        textAlign: 'center',
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        color: '#1b5e20',
        border: popular ? `3px solid ${color}` : '1px solid rgba(46,125,50,0.1)',
        position: 'relative',
        transform: popular ? 'scale(1.05)' : 'scale(1)',
        zIndex: popular ? 10 : 1
      }}
      whileHover={{
        y: -12,
        boxShadow: `0 20px 56px ${color}50`,
        transition: { duration: 0.25 }
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5, ease: 'easeOut' }}
      onClick={() => navigate('/login')}
    >
      {popular && (
        <div style={{
          position: 'absolute',
          top: -14,
          left: '50%',
          transform: 'translateX(-50%)',
          background: color,
          color: 'white',
          padding: '6px 20px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 1,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          Most Popular
        </div>
      )}
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        boxShadow: `0 8px 24px ${color}40`
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 14C12 8 20 8 26 14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M10 19C13.5 16 18.5 16 22 19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="16" cy="25" r="2.5" fill="white" />
        </svg>
      </div>
      <div style={{ fontWeight: 800, fontSize: 42, marginBottom: 4, letterSpacing: 1, color: '#1b5e20' }}>{speed}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#2e7d32', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>{speedUnit}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: color, marginBottom: 24 }}>KSh {price.toLocaleString()}<span style={{ fontSize: 16, fontWeight: 500, color: '#666' }}>/mo</span></div>
      
      <div style={{ width: '100%', borderTop: '1px solid rgba(46,125,50,0.1)', marginBottom: 20 }} />
      
      {features && features.map((feature, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: '#2e7d32' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
            <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 6L7 10.5 4.5 8l1-1L7 8.5 10.5 5l1 1z" />
          </svg>
          {feature}
        </div>
      ))}
      
      <motion.button
        style={{
          marginTop: 16,
          padding: '14px 32px',
          background: color,
          color: 'white',
          border: 'none',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
          boxShadow: `0 4px 16px ${color}40`,
          width: '100%'
        }}
        whileHover={{ scale: 1.02, boxShadow: `0 6px 20px ${color}60` }}
        whileTap={{ scale: 0.98 }}
      >
        Get Started
      </motion.button>
    </motion.div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: '#1a5c2e', // Fallback background color
    }}>
      {/* Background image */}
      {!imageError && (
        <img 
          src="/IMG 4.PNG" 
          alt="ISP" 
          onError={() => setImageError(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: 0,
            filter: 'brightness(0.7)'
          }} 
        />
      )}
      {/* RGBA overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: imageError 
          ? 'linear-gradient(135deg, #1a5c2e 0%, #2d7a3e 50%, #43e97b 100%)' 
          : 'rgba(34, 62, 60, 0.55)',
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
          background: 'rgba(148, 230, 196, 0.85)',
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

      {/* Packages Section */}
      <section className="landing-packages" style={{
        background: 'linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 100%)',
        padding: '80px 0 72px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 2,
        borderTop: '3px solid #2d7a3e',
        borderBottom: '3px solid #2d7a3e'
      }}>
        <h2 style={{ color: '#1b5e20', fontWeight: 800, fontSize: 36, marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Packages We Offer</h2>
        <p style={{ color: '#2e7d32', fontSize: 18, marginBottom: 48, maxWidth: 600, textAlign: 'center' }}>Choose the perfect internet plan for your needs. All packages include free installation and 24/7 support.</p>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1200 }}>
          <Package speed="10" price="2000" speedUnit="Mbps" color="#43e97b" index={0} features={['Unlimited Data', '24/7 Support']} />
          <Package speed="15" price="2600" speedUnit="Mbps" color="#38f9d7" index={1} features={['Unlimited Data', '24/7 Support', 'Priority Support']} popular />
          <Package speed="20" price="3000" speedUnit="Mbps" color="#ffc107" index={2} features={['Unlimited Data', '24/7 Support']} />
          <Package speed="30" price="5400" speedUnit="Mbps" color="#e91e63" index={3} features={['Unlimited Data', 'Premium Router', '24/7 Support', 'Static IP', 'Priority Support']} />
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" style={{
        background: 'white',
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

      {/* About Us Section */}
      <section className="landing-about" style={{
        background: 'linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%)',
        padding: '64px 40px 56px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(46,125,50,0.15)',
        border: '3px solid #2d7a3e',
        borderRadius: 24,
        margin: '40px',
        zIndex: 2
      }}>
        <h2 style={{ color: '#2d7a3e', fontWeight: 700, fontSize: 30, marginBottom: 32 }}>About Us</h2>
        <div style={{ color: '#444', fontSize: 18, lineHeight: 1.6, maxWidth: 800, textAlign: 'center' }}>
          <p style={{ marginBottom: 20 }}>
            At AheriNET, we're more than just an internet service provider – we're your trusted partner in connecting Kisumu to the digital world. Based right here in Kisumu, we specialize in delivering lightning-fast wireless and fiber optic internet solutions to every corner of our vibrant city.
          </p>
          <p style={{ marginBottom: 20 }}>
            Our commitment to excellence means reliable service, exceptional customer support, and innovative technology that keeps you ahead. Join thousands of satisfied customers who choose AheriNET for their connectivity needs.
          </p>
          <p>
            Experience the difference – seamless, secure, and super-fast internet tailored for Kisumu's dynamic lifestyle. Choose AheriNET and stay connected like never before!
          </p>
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
          animation: fadeIn 0.5s ease-out;
        }
        .landing-hero {
          animation: slideInUp 0.5s ease-out 0.15s both;
        }
        .landing-features {
          animation: fadeIn 0.5s ease-out 0.3s both;
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
.package-card:nth-child(1) { animation: float1 4s ease-in-out infinite; }
.package-card:nth-child(2) { animation: float2 5s ease-in-out infinite; }
.package-card:nth-child(3) { animation: float3 6s ease-in-out infinite; }
.landing-packages { animation: fadeIn 0.5s ease-out 0.4s both; }
.landing-about { animation: fadeIn 0.5s ease-out 0.5s both; }

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
  .landing-packages, .landing-about {
    padding: 32px 0 28px 0;
  }
  .landing-packages h2, .landing-about h2 {
    font-size: 24px;
    margin-bottom: 16px;
  }
  .landing-about {
    padding: 32px 20px 28px 20px;
    margin: 20px;
  }
  .package-card {
    min-width: 180px;
    max-width: 200px;
    padding: 24px 20px;
  }
  .package-card div:first-child {
    font-size: 20px;
  }
  .package-card div:last-child {
    font-size: 16px;
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
