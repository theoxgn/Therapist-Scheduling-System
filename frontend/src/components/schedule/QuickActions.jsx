import React from 'react';
import { Settings } from 'lucide-react';

const QuickActions = ({ onClearDay, onClearAllSchedules, onCopyPrevious, onExportPDF, onOpenSettings }) => (
  <div className="grid grid-cols-5 gap-4 mb-6 mx-4">
    <button
      onClick={onClearDay}
      className="flex flex-col items-center justify-center gap-2 p-4 border rounded hover:bg-gray-50 transition-colors"
    >
      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="text-sm font-medium">Clear Day</span>
    </button>
    <button
      onClick={onClearAllSchedules}
      className="flex flex-col items-center justify-center gap-2 p-4 border rounded hover:bg-gray-50 transition-colors"
    >
      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="text-sm font-medium text-red-500">Clear All</span>
    </button>
    <button
      onClick={onCopyPrevious}
      className="flex flex-col items-center justify-center gap-2 p-4 border rounded hover:bg-gray-50 transition-colors"
    >
      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
      <span className="text-sm font-medium">Copy Previous Week</span>
    </button>
    <button
      onClick={onExportPDF}
      className="flex flex-col items-center justify-center gap-2 p-4 border rounded hover:bg-gray-50 transition-colors"
    >
      <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-sm font-medium text-blue-500">Export PDF</span>
    </button>
    <button
      onClick={onOpenSettings}
      className="flex flex-col items-center justify-center gap-2 p-4 border rounded hover:bg-gray-50 transition-colors"
    >
      <Settings className="w-6 h-6 text-gray-600" />
      <span className="text-sm font-medium">Settings</span>
    </button>
  </div>
);

export default QuickActions;
