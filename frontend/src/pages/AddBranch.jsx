import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AddBranch() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    branchCode: '',
    name: '',
    address: '',
    maxShift1Therapists: 3,
    genderRestricted: false,
    weekendOnlyMale: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: parseInt(value, 10) || 0
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.branchCode.trim()) {
      setError('Branch code is required');
      return false;
    }
    
    if (!formData.name.trim()) {
      setError('Branch name is required');
      return false;
    }
    
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    
    // Branch code format validation (example: alphanumeric, uppercase, 5-10 chars)
    const branchCodeRegex = /^[A-Z0-9]{5,10}$/;
    if (!branchCodeRegex.test(formData.branchCode)) {
      setError('Branch code must be 5-10 uppercase alphanumeric characters');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await api.branches.create(formData);
      
      if (result.success) {
        setSuccessMessage('Branch created successfully!');
        
        // Clear form or redirect after short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.error || 'Failed to create branch');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error creating branch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Add New Branch</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
          </div>
          <p className="text-gray-600 mt-1">Create a new branch location for your spa</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Branch Basic Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="branchCode">
                      Branch Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="branchCode"
                      name="branchCode"
                      value={formData.branchCode}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. BRANCH01"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      5-10 uppercase alphanumeric characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Main Street Branch"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Address */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Location</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full street address"
                    rows="3"
                    required
                  ></textarea>
                </div>
              </div>
              
              {/* Operational Settings */}
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-4">Operational Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="maxShift1Therapists">
                      Maximum Shift 1 Therapists
                    </label>
                    <input
                      type="number"
                      id="maxShift1Therapists"
                      name="maxShift1Therapists"
                      value={formData.maxShift1Therapists}
                      onChange={handleNumberChange}
                      min="1"
                      max="10"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      The maximum number of therapists that can be assigned to the morning shift
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="genderRestricted"
                        name="genderRestricted"
                        checked={formData.genderRestricted}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="genderRestricted" className="font-medium text-gray-700">
                        Gender Restricted
                      </label>
                      <p className="text-gray-500">
                        Enable if this branch has gender-specific service restrictions
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="weekendOnlyMale"
                        name="weekendOnlyMale"
                        checked={formData.weekendOnlyMale}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="weekendOnlyMale" className="font-medium text-gray-700">
                        Weekend Only Male
                      </label>
                      <p className="text-gray-500">
                        Enable if male therapists are scheduled only on weekends at this branch
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    'Create Branch'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddBranch;