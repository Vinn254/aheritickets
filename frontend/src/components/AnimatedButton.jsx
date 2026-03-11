import React from 'react';
import { motion } from 'framer-motion';

const AnimatedButton = ({
  children,
  onClick,
  style = {},
  variant = 'primary',
  size = 'medium',
  ...props
}) => {
  const baseStyles = {
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  };

  const variants = {
    primary: {
      background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
      color: '#2d7a3e',
      boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)',
    },
    secondary: {
      background: '#fff',
      color: '#2d7a3e',
      border: '2px solid #43e97b',
      boxShadow: '0 2px 8px rgba(67, 233, 123, 0.1)',
    },
    danger: {
      background: '#ffebee',
      color: '#d32f2f',
      border: '2px solid #ffcdd2',
      boxShadow: '0 2px 8px rgba(211, 47, 47, 0.1)',
    }
  };

  const sizes = {
    small: { padding: '8px 16px', fontSize: 14 },
    medium: { padding: '12px 24px', fontSize: 16 },
    large: { padding: '16px 32px', fontSize: 18 }
  };

  const buttonStyle = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size]
  };

  return (
    <motion.button
      style={buttonStyle}
      onClick={onClick}
      whileHover={{
        scale: 1.05,
        boxShadow: variant === 'primary'
          ? '0 6px 16px rgba(67, 233, 123, 0.4)'
          : variant === 'secondary'
          ? '0 4px 12px rgba(67, 233, 123, 0.2)'
          : '0 4px 12px rgba(211, 47, 47, 0.2)',
        transition: { duration: 0.15 }
      }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;