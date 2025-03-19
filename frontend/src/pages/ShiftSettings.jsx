import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Component for input field with label
const LabeledInput = ({ label, value, onChange, min = 0, max = 99, disabled = false }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type="number"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      disabled={disabled}
      className={`border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
    />
  </div>
);

// Card component for shift settings
const ShiftCard = ({ title, timeRange, minValue, maxValue, onMinChange, onMaxChange }) => (
  <div className="p-4 border rounded-lg">
    <h3 className="font-medium mb-3">{title} ({timeRange})</h3>
    <div className="space-y-3">
      <LabeledInput
        label="Minimum Therapists"
        value={minValue}
        onChange={(e) => onMinChange(parseInt(e.target.value))}
      />
      <LabeledInput
        label="Maximum Therapists"
        value={maxValue}
        onChange={(e) => onMaxChange(parseInt(e.target.value))}
      />
    </div>
  </div>
);

const ShiftSettings = () => {
  const { branchCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [branch, setBranch] = useState(null);
  const [settingsExist, setSettingsExist] = useState(false);
  const [settings, setSettings] = useState({
    weekday: {
      shift1: { min: 2, max: 3 },
      shiftMiddle: { min: 2, max: 3 },
      shift2: { min: 2, max: 3 }
    },
    weekend: {
      shift1: { min: 4, max: 5 },
      shiftMiddle: { min: 4, max: 5 },
      shift2: { min: 4, max: 5 }
    },
    off: {
      maxPerDay: 2,
      maxConsecutive: 2,
      maxPerWeek: 1
    }
  });

  // Fetch branch details and settings
  const fetchBranchAndSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch branch details
      const branchResult = await api.branches.getOne(branchCode);
      if (!branchResult.success) {
        throw new Error(branchResult.error || 'Failed to fetch branch details');
      }
      setBranch(branchResult.data);

      // Fetch shift settings
      const settingsResult = await api.shiftSettings.get(branchCode);
      console.log(settingsResult.data.settings.type)
      if (settingsResult.success) {
        if (settingsResult.data.settings.type == 'default') {
          setSettings(settingsResult.data);
          setSettingsExist(false);
        } else {
          // Settings don't exist yet, but we'll use the default values already set
          setSettingsExist(true);
        }
      }

    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [branchCode]);

  useEffect(() => {
    fetchBranchAndSettings();
  }, [fetchBranchAndSettings]);

  // Handle weekday shift changes
  const handleWeekdayChange = (shift, type, value) => {
    setSettings(prev => ({
      ...prev,
      weekday: {
        ...prev.weekday,
        [shift]: {
          ...prev.weekday[shift],
          [type]: value
        }
      }
    }));
  };

  // Handle weekend shift changes
  const handleWeekendChange = (shift, type, value) => {
    setSettings(prev => ({
      ...prev,
      weekend: {
        ...prev.weekend,
        [shift]: {
          ...prev.weekend[shift],
          [type]: value
        }
      }
    }));
  };

  // Handle off day settings changes
  const handleOffChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      off: {
        ...prev.off,
        [field]: value
      }
    }));
  };

  // Validate settings
  const validateSettings = () => {
    // Validate weekday settings
    for (const shift of ['shift1', 'shiftMiddle', 'shift2']) {
      const weekdayShift = settings.weekday[shift];
      const weekendShift = settings.weekend[shift];

      if (weekdayShift.min > weekdayShift.max) {
        throw new Error(`Weekday ${shift}: Minimum cannot be greater than maximum`);
      }
      if (weekendShift.min > weekendShift.max) {
        throw new Error(`Weekend ${shift}: Minimum cannot be greater than maximum`);
      }
      if (weekdayShift.min < 0 || weekendShift.min < 0) {
        throw new Error('Minimum values cannot be negative');
      }
    }

    // Validate off day settings
    if (settings.off.maxPerDay < 1) {
      throw new Error('Maximum off days per day must be at least 1');
    }
    if (settings.off.maxConsecutive < 1) {
      throw new Error('Maximum consecutive off days must be at least 1');
    }
    if (settings.off.maxPerWeek < 1) {
      throw new Error('Maximum off days per week must be at least 1');
    }
    if (settings.off.maxConsecutive > settings.off.maxPerWeek) {
      throw new Error('Maximum consecutive off days cannot exceed maximum off days per week');
    }
  };

  // Save settings
  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(false);
      
      // Validate settings
      validateSettings();

      let result;
      
      // Use POST to create new settings or PUT to update existing ones
      if (!settingsExist) {
        // Create new settings
        result = await api.shiftSettings.create(branchCode, settings);
        if (result.success) {
          setSettingsExist(true);
        }
      } else {
        // Update existing settings
        result = await api.shiftSettings.update(branchCode, settings);
      }
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error saving settings:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Shift Settings</h1>
            {branch && (
              <p className="text-gray-600 mt-1">
                {branch.name} ({branchCode})
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!settingsExist && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>No shift settings exist for this branch yet. The form is pre-filled with default values. Click Save to create settings.</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Weekday Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Weekday Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ShiftCard
              title="Shift 1"
              timeRange="09:00 - 18:00"
              minValue={settings.weekday.shift1.min}
              maxValue={settings.weekday.shift1.max}
              onMinChange={(value) => handleWeekdayChange('shift1', 'min', value)}
              onMaxChange={(value) => handleWeekdayChange('shift1', 'max', value)}
            />
            <ShiftCard
              title="Middle Shift"
              timeRange="11:30 - 20:30"
              minValue={settings.weekday.shiftMiddle.min}
              maxValue={settings.weekday.shiftMiddle.max}
              onMinChange={(value) => handleWeekdayChange('shiftMiddle', 'min', value)}
              onMaxChange={(value) => handleWeekdayChange('shiftMiddle', 'max', value)}
            />
            <ShiftCard
              title="Shift 2"
              timeRange="13:00 - 22:00"
              minValue={settings.weekday.shift2.min}
              maxValue={settings.weekday.shift2.max}
              onMinChange={(value) => handleWeekdayChange('shift2', 'min', value)}
              onMaxChange={(value) => handleWeekdayChange('shift2', 'max', value)}
            />
          </div>
        </div>

        {/* Weekend Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Weekend Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ShiftCard
              title="Shift 1"
              timeRange="09:00 - 18:00"
              minValue={settings.weekend.shift1.min}
              maxValue={settings.weekend.shift1.max}
              onMinChange={(value) => handleWeekendChange('shift1', 'min', value)}
              onMaxChange={(value) => handleWeekendChange('shift1', 'max', value)}
            />
            <ShiftCard
              title="Middle Shift"
              timeRange="11:30 - 20:30"
              minValue={settings.weekend.shiftMiddle.min}
              maxValue={settings.weekend.shiftMiddle.max}
              onMinChange={(value) => handleWeekendChange('shiftMiddle', 'min', value)}
              onMaxChange={(value) => handleWeekendChange('shiftMiddle', 'max', value)}
            />
            <ShiftCard
              title="Shift 2"
              timeRange="13:00 - 22:00"
              minValue={settings.weekend.shift2.min}
              maxValue={settings.weekend.shift2.max}
              onMinChange={(value) => handleWeekendChange('shift2', 'min', value)}
              onMaxChange={(value) => handleWeekendChange('shift2', 'max', value)}
            />
          </div>
        </div>

        {/* Off Day Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Off Day Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <div className="space-y-3">
                <LabeledInput
                  label="Maximum Off Days Per Day"
                  value={settings.off.maxPerDay}
                  onChange={(e) => handleOffChange('maxPerDay', parseInt(e.target.value))}
                />
                <LabeledInput
                  label="Maximum Consecutive Off Days"
                  value={settings.off.maxConsecutive}
                  onChange={(e) => handleOffChange('maxConsecutive', parseInt(e.target.value))}
                />
                <LabeledInput
                  label="Maximum Off Days Per Week"
                  value={settings.off.maxPerWeek}
                  onChange={(e) => handleOffChange('maxPerWeek', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {settingsExist ? 'Update Settings' : 'Create Settings'}
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Settings {settingsExist ? 'updated' : 'created'} successfully</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftSettings;