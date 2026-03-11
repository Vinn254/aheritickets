import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  style = {},
  ...props
}) => {
  return (
    <motion.div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        ...style
      }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0']
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }}
      {...props}
    />
  );
};

const SkeletonCard = ({ style = {}, ...props }) => {
  return (
    <div
      style={{
        padding: 24,
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e8f5e9',
        boxShadow: '0 4px 16px rgba(39, 174, 96, 0.1)',
        ...style
      }}
      {...props}
    >
      <SkeletonLoader width="60%" height="24px" style={{ marginBottom: 16 }} />
      <SkeletonLoader width="100%" height="16px" style={{ marginBottom: 8 }} />
      <SkeletonLoader width="80%" height="16px" style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 12 }}>
        <SkeletonLoader width="80px" height="32px" borderRadius="16px" />
        <SkeletonLoader width="100px" height="32px" borderRadius="16px" />
      </div>
    </div>
  );
};

export { SkeletonLoader, SkeletonCard };
export default SkeletonLoader;