import React from 'react';
import PropTypes from 'prop-types';

function QuickActions({ onAction, disabled }) {
  const actions = [
    {
      label: 'Clear Day',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      action: 'clearDay'
    },
    {
      label: 'Copy Previous Week',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      action: 'copyPreviousWeek'
    },
    {
      label: 'Optimize Schedule',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      action: 'optimizeSchedule'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-4">
        {actions.map(({ label, icon, action }) => (
          <button
            key={action}
            onClick={() => onAction(action)}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-3 rounded border ${
              disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'hover:bg-blue-50 hover:border-blue-300 text-gray-700'
            }`}
          >
            {icon}
            <span className="text-sm mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

QuickActions.propTypes = {
  onAction: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default QuickActions;