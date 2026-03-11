import React, { useState, useEffect } from 'react';

function ErrorBoundary({ children, componentName }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (err, errorInfo) => {
      console.error('ErrorBoundary caught:', err, errorInfo);
      setHasError(true);
      setError(err);
    };

    // Set up error boundary
    return () => {};
  }, []);

  if (hasError) {
    const name = componentName || 'this component';
    return (
      <div style={{ color: 'red', padding: 16 }}>
        Something went wrong in {name}.<br />
        {String(error)}
      </div>
    );
  }

  return children;
}

export default ErrorBoundary;
