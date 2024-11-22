import React from 'react';

export const FormCheckbox = ({ 
  label, 
  name, 
  checked, 
  onChange, 
  error 
}) => {
  return (
    <div className="mb-4">
      <label className="flex items-center">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
        <span className="ml-2 text-gray-700">{label}</span>
      </label>
      {error && <p className="text-red-500 text-xs italic">{error}</p>}
    </div>
  );
};