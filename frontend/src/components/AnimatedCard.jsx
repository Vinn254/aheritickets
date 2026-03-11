import React from 'react';
import { motion } from 'framer-motion';

const AnimatedCard = ({
  children,
  onClick,
  style = {},
  hoverEffect = 'lift',
  ...props
}) => {
  const baseStyles = {
    background: 'linear-gradient(135deg, #fff 0%, #f7fff7 100%)',
    borderRadius: 16,
    border: '1px solid #e8f5e9',
    boxShadow: '0 4px 16px rgba(39, 174, 96, 0.1)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    ...style
  };

  const hoverEffects = {
    lift: {
      y: -4,
      boxShadow: '0 8px 24px rgba(39, 174, 96, 0.15)',
    },
    glow: {
      boxShadow: '0 8px 24px rgba(39, 174, 96, 0.2), 0 0 20px rgba(67, 233, 123, 0.1)',
    },
    scale: {
      scale: 1.02,
      boxShadow: '0 8px 24px rgba(39, 174, 96, 0.15)',
    }
  };

  return (
    <motion.div
      style={baseStyles}
      onClick={onClick}
      whileHover={hoverEffects[hoverEffect]}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;