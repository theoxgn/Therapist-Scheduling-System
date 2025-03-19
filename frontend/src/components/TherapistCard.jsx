import React, { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';
import { Trash2, Shield } from 'lucide-react';

function TherapistCard({ therapist, onUpdate, onDelete }) {
  const [isLoading, setIsLoading] = useState(false);

  const toggleStatus = async () => {
    try {
      setIsLoading(true);
      await api.therapists.update(therapist.id, {
        ...therapist,
        isActive: !therapist.isActive
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating therapist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get badge color based on gender
  const getGenderColor = (gender) => {
    return gender === 'male' 
      ? 'bg-blue-100 text-blue-700' 
      : 'bg-pink-100 text-pink-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium ${
            therapist.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
          }`}>
            {therapist.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{therapist.name}</h3>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className={`px-2 py-0.5 rounded-full ${getGenderColor(therapist.gender)}`}>
                {therapist.gender === 'male' ? 'Male' : 'Female'}
              </span>
              <span className={`px-2 py-0.5 rounded-full ${
                therapist.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {therapist.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">{therapist.branchCode}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 grid grid-cols-2 gap-2">
        <button
          onClick={toggleStatus}
          disabled={isLoading}
          className={`flex items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
            therapist.isActive 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          ) : (
            <>
              <Shield size={16} />
              <span>{therapist.isActive ? 'Deactivate' : 'Activate'}</span>
            </>
          )}
        </button>
        <button
          onClick={() => onDelete(therapist.id)}
          className="flex items-center justify-center gap-1 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

TherapistCard.propTypes = {
  therapist: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
    isActive: PropTypes.bool,
    branchCode: PropTypes.string
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default TherapistCard;