import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TherapistCard from '../components/TherapistCard';
import AddTherapistModal from '../components/AddTherapistModal';
import api from '../services/api';

function TherapistManagement() {
  const [therapists, setTherapists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { branchCode } = useParams();

  useEffect(() => {
    fetchTherapists();
  }, [branchCode]);

  const fetchTherapists = async () => {
    try {
      const response = await api.get(`/therapists?branchCode=${branchCode}`);
      setTherapists(response.data);
    } catch (error) {
      console.error('Error fetching therapists:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Therapists</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Therapist
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {therapists.map(therapist => (
          <TherapistCard
            key={therapist.id}
            therapist={therapist}
            onUpdate={fetchTherapists}
          />
        ))}
      </div>
      <AddTherapistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={fetchTherapists}
        branchCode={branchCode}
      />
    </div>
  );
}

export default TherapistManagement;