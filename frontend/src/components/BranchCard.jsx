import React from 'react';

function BranchCard({ branch, onScheduleClick, onTherapistsClick }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-2">{branch.name}</h2>
      <p className="text-gray-600 mb-2">{branch.address}</p>
      <div className="flex justify-between mt-4">
        <button
          onClick={onScheduleClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          View Schedule
        </button>
        <button
          onClick={onTherapistsClick}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Manage Therapists
        </button>
      </div>
    </div>
  );
}

export default BranchCard;
