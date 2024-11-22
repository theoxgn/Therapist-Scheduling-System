import React from 'react';

export const ErrorHandler = ({ error, onRetry }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <p>{error.message || 'An error occurred'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-500 text-white px-4 py-2 rounded mt-2"
        >
          Retry
        </button>
      )}
    </div>
  );
};