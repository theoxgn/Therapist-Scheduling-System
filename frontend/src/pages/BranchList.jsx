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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm relative">
            <span className="block sm:inline font-medium">{error}</span>
            <button
              className="absolute top-4 right-4 text-red-400 hover:text-red-600"
              onClick={() => setError(null)}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Branch Management</h1>
            <button
              onClick={() => navigate('/branches/new')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Branch</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No branches found</h3>
            <p className="text-gray-600 mb-6">Click the "Add Branch" button to create your first branch.</p>
            <button
              onClick={() => navigate('/branches/new')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New Branch</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BranchList;