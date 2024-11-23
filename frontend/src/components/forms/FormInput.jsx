import React from 'react';
import PropTypes from 'prop-types';

export function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required,
  placeholder,
  error,
  containerClassName,
  labelClassName,
  inputClassName,
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label && (
        <label 
          htmlFor={name}
          className={labelClassName}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`${inputClassName} ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

FormInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  containerClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string
};

FormInput.defaultProps = {
  type: 'text',
  required: false,
  containerClassName: '',
  labelClassName: '',
  inputClassName: ''
};