import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const FormValidation = ({ type = 'error', message, className = '', showIcon = true }) => {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: FaExclamationTriangle,
          iconColor: 'text-red-500'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: FaCheckCircle,
          iconColor: 'text-green-500'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: FaExclamationTriangle,
          iconColor: 'text-yellow-500'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: FaInfoCircle,
          iconColor: 'text-blue-500'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: FaInfoCircle,
          iconColor: 'text-gray-500'
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  if (!message) return null;

  return (
    <div className={`flex items-center p-3 rounded-lg border ${styles.container} ${className} transition-all duration-300`}>
      {showIcon && (
        <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${styles.iconColor}`} />
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// Form field validation component
export const FormField = ({ 
  label, 
  error, 
  required = false, 
  children, 
  className = '',
  helperText = '',
  showValidation = true 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {helperText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
      {showValidation && error && (
        <FormValidation type="error" message={error} className="mt-2" />
      )}
    </div>
  );
};

// Input field with built-in validation
export const ValidatedInput = ({ 
  value, 
  onChange, 
  onBlur, 
  error, 
  label, 
  required = false, 
  type = 'text', 
  placeholder = '', 
  helperText = '',
  validationRules = {},
  className = '',
  leftIcon = null,
  rightIcon = null,
  ...props 
}) => {
  const [touched, setTouched] = React.useState(false);
  const [localError, setLocalError] = React.useState('');

  const validateField = (value) => {
    if (validationRules.required && !value) {
      return `${label || 'This field'} is required`;
    }
    if (validationRules.minLength && value.length < validationRules.minLength) {
      return `${label || 'This field'} must be at least ${validationRules.minLength} characters`;
    }
    if (validationRules.maxLength && value.length > validationRules.maxLength) {
      return `${label || 'This field'} must not exceed ${validationRules.maxLength} characters`;
    }
    if (validationRules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }
    if (validationRules.pattern && value) {
      if (!validationRules.pattern.test(value)) {
        return validationRules.message || 'Invalid format';
      }
    }
    return '';
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalError(validateField(newValue));
    onChange?.(e);
  };

  const handleBlur = (e) => {
    setTouched(true);
    const validationError = validateField(e.target.value);
    setLocalError(validationError);
    onBlur?.(e);
  };

  const displayError = touched ? localError : error;

  return (
    <FormField 
      label={label} 
      error={displayError} 
      required={required} 
      helperText={helperText}
      className={className}
    >
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10">
            {leftIcon}
          </div>
        )}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 z-10">
            {rightIcon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
            leftIcon ? 'pl-12' : ''
          } ${
            rightIcon ? 'pr-12' : ''
          } ${
            displayError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-200 focus:border-blue-500'
          }`}
          {...props}
        />
      </div>
    </FormField>
  );
};

// Select field with built-in validation
export const ValidatedSelect = ({ 
  value, 
  onChange, 
  onBlur, 
  error, 
  label, 
  required = false, 
  options = [], 
  helperText = '',
  className = '',
  placeholder = 'Select an option',
  leftIcon = null,
  ...props 
}) => {
  const [touched, setTouched] = React.useState(false);

  const handleBlur = (e) => {
    setTouched(true);
    onBlur?.(e);
  };

  const displayError = touched ? (required && !value ? `${label || 'This field'} is required` : '') : error;

  return (
    <FormField 
      label={label} 
      error={displayError} 
      required={required} 
      helperText={helperText}
      className={className}
    >
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10">
            {leftIcon}
          </div>
        )}
        <select
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition-all duration-200 ${
            leftIcon ? 'pl-12' : ''
          } ${
            displayError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-200 focus:border-blue-500'
          }`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </FormField>
  );
};

export default FormValidation;
