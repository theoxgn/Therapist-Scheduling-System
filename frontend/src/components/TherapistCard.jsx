import React from 'react';
import api from '../services/api';

function TherapistCard({ therapist, onUpdate }) {
  const toggleStatus = async () => {
    try {
      await api.put(`/therapists/${therapist.id}`, {
        ...therapist,
        isActive: !therapist.isActive
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating therapist:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{therapist.name}</h3>
        <button
          onClick={toggleStatus}
          className={`px-3 py-1 rounded ${
            therapist.isActive ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {therapist.isActive ? 'Active' : 'Inactive'}
        </button>
      </div>
      <p className="text-gray-600">Gender: {therapist.gender}</p>
      <p className="text-gray-600">Branch: {therapist.Branch?.name}</p>
    </div>
  );
}

export default TherapistCard;