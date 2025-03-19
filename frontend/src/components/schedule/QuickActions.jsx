import React from 'react';
import { Settings, FileDown, Copy, Trash, Trash2 } from 'lucide-react';

const QuickActions = ({ onClearDay, onClearAllSchedules, onCopyPrevious, onExportPDF, onOpenSettings }) => (
  <div className="mb-6">
    <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Quick Actions</h2>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <button
        onClick={onClearDay}
        className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Trash className="w-4 h-4 text-gray-600" />
        </div>
        <span className="text-sm font-medium">Clear Day</span>
      </button>
      
      <button
        onClick={onClearAllSchedules}
        className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <Trash2 className="w-4 h-4 text-red-600" />
        </div>
        <span className="text-sm font-medium text-red-600">Clear All</span>
      </button>
      
      <button
        onClick={onCopyPrevious}
        className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Copy className="w-4 h-4 text-green-600" />
        </div>
        <span className="text-sm font-medium">Copy Previous</span>
      </button>
      
      <button
        onClick={onExportPDF}
        className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <FileDown className="w-4 h-4 text-blue-600" />
        </div>
        <span className="text-sm font-medium text-blue-600">Export PDF</span>
      </button>
      
      <button
        onClick={onOpenSettings}
        className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <Settings className="w-4 h-4 text-purple-600" />
        </div>
        <span className="text-sm font-medium">Settings</span>
      </button>
    </div>
  </div>
);

export default QuickActions;