import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BranchCard from '../components/BranchCard';
import api from '../services/api';

function BranchList() {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setIsLoading(true);
    const result = await api.branches.getAll();
    
    if (result.success) {
      setBranches(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleDeleteBranch = async (branchCode) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) {
      return;
    }

    const result = await api.branches.delete(branchCode);
    
    if (result.success) {
      setBranches(branches.filter(branch => branch.branchCode !== branchCode));
      setError(null);
    } else {
      setError(result.error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Branch Management</h1>
        <button
          onClick={() => navigate('/branches/new')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(branch => (
          <BranchCard
            key={branch.branchCode}
            branch={branch}
            onScheduleClick={() => navigate(`/schedule/${branch.branchCode}`)}
            onTherapistsClick={() => navigate(`/therapists/${branch.branchCode}`)}
            onDelete={() => handleDeleteBranch(branch.branchCode)}
          />
        ))}
      </div>

      {branches.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No branches found</p>
          <p className="mt-2">Click the "Add Branch" button to create your first branch.</p>
        </div>
      )}
    </div>
  );
}

export default BranchList;