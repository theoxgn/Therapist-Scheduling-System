import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TherapistCard from '../components/TherapistCard';
import AddTherapistModal from '../components/AddTherapistModal';
import api from '../services/api';
import { Search, Plus, RefreshCw, ArrowLeft } from 'lucide-react';

function TherapistManagement() {
  const [therapists, setTherapists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [branch, setBranch] = useState(null);
  const { branchCode } = useParams();
  const navigate = useNavigate();

  const fetchBranch = useCallback(async () => {
    try {
      const result = await api.branches.getOne(branchCode);
      if (result.success) {
        setBranch(result.data);
      }
    } catch (err) {
      console.error('Error fetching branch:', err);
    }
  }, [branchCode]);

  const fetchTherapists = useCallback(async () => {
    setIsLoading(true);
    const result = await api.therapists.getByBranch(branchCode);
    
    if (result.success) {
      setTherapists(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [branchCode]);

  useEffect(() => {
    fetchBranch();
    fetchTherapists();
  }, [fetchBranch, fetchTherapists]);

  const handleDeleteTherapist = async (therapistId) => {
    if (!window.confirm('Are you sure you want to delete this therapist?')) {
      return;
    }

    const result = await api.therapists.delete(therapistId);
    if (result.success) {
      fetchTherapists();
    } else {
      setError(result.error);
    }
  };

  // Filter therapists based on search query and active filter
  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'active') return matchesSearch && therapist.isActive;
    if (activeFilter === 'inactive') return matchesSearch && !therapist.isActive;
    
    return matchesSearch;
  });

  // Count therapists by gender
  const maleTherapists = therapists.filter(t => t.gender === 'male').length;
  const femaleTherapists = therapists.filter(t => t.gender === 'female').length;
  const activeTherapists = therapists.filter(t => t.isActive).length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Error Alert */}
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

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Therapist Management</h1>
        </div>
        {branch && (
          <p className="text-gray-600">{branch.name} ({branchCode})</p>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-500 mb-1">Total Therapists</div>
          <div className="text-2xl font-bold">{therapists.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-500 mb-1">Active Therapists</div>
          <div className="text-2xl font-bold">{activeTherapists}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-500 mb-1">Male Therapists</div>
          <div className="text-2xl font-bold">{maleTherapists}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-pink-500">
          <div className="text-sm text-gray-500 mb-1">Female Therapists</div>
          <div className="text-2xl font-bold">{femaleTherapists}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search therapists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search size={18} />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {/* Filter Buttons */}
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                    activeFilter === 'all'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('active')}
                  className={`px-4 py-2 text-sm font-medium border-t border-b ${
                    activeFilter === 'active'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveFilter('inactive')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                    activeFilter === 'inactive'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Inactive
                </button>
              </div>
              
              {/* Refresh and Add Button */}
              <button
                onClick={fetchTherapists}
                className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                title="Refresh"
              >
                <RefreshCw size={18} />
              </button>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={18} />
                <span>Add Therapist</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Therapist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTherapists.map(therapist => (
          <TherapistCard
            key={therapist.id}
            therapist={therapist}
            onDelete={() => handleDeleteTherapist(therapist.id)}
            onUpdate={fetchTherapists}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTherapists.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No therapists found</h3>
          {searchQuery || activeFilter !== 'all' ? (
            <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
          ) : (
            <p className="text-gray-600 mb-6">Get started by adding therapists to this branch.</p>
          )}
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>Add New Therapist</span>
          </button>
        </div>
      )}

      {/* Add Therapist Modal */}
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