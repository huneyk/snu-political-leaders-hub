import React from 'react';

interface SpinnerProps {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className = '' }) => {
  return (
    <div className={`animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary ${className}`} />
  );
}; 