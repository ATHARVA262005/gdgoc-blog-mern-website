import React from 'react';

const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
};

const PasswordStrengthMeter = ({ password }) => {
  const strength = getPasswordStrength(password);
  
  const getStrengthText = () => {
    switch (strength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      case 5: return 'Very Strong';
      default: return '';
    }
  };

  const getProgressColor = () => {
    switch (strength) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-green-600';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <div className="text-sm text-gray-500">Password strength:</div>
        <div className={`text-sm font-medium ${getProgressColor().replace('bg-', 'text-')}`}>
          {getStrengthText()}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${getProgressColor()} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${(strength / 5) * 100}%` }}
        ></div>
      </div>
      <div className="mt-2">
        <ul className="text-xs text-gray-500 space-y-1">
          <li className={password.length >= 8 ? 'text-green-600' : ''}>
            • At least 8 characters
          </li>
          <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
            • At least one uppercase letter
          </li>
          <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
            • At least one lowercase letter
          </li>
          <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
            • At least one number
          </li>
          <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>
            • At least one special character
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
