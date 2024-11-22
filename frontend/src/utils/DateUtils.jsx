import React from 'react';

export const DateFormatter = ({ date, format = 'default' }) => {
  const formatDate = () => {
    switch (format) {
      case 'withDay':
        return new Date(date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      case 'short':
        return new Date(date).toLocaleDateString();
      default:
        return new Date(date).toISOString().split('T')[0];
    }
  };

  return <span>{formatDate()}</span>;
};
