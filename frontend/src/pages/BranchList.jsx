import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BranchCard from '../components/BranchCard';
import api from '../services/api';

function BranchList() {
  const [branches, setBranches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get('/branches');
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Branches</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(branch => (
          <BranchCard 
            key={branch.branchCode}
            branch={branch}
            onScheduleClick={() => navigate(`/schedule/${branch.branchCode}`)}
            onTherapistsClick={() => navigate(`/therapists/${branch.branchCode}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default BranchList;