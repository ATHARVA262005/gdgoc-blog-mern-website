import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../../services/authService';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const message = location.state?.message;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPassword(email, otpString, formData.password);
      navigate('/login', {
        state: { message: 'Password reset successful. Please login with your new password.' }
      });
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">Reset your password</h2>
        {message && (
          <p className="mt-2 text-center text-gray-600">{message}</p>
        )}
        <p className="mt-2 text-center text-gray-600">
          Please enter your new password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* OTP Fields */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1 flex space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[index] = e.target.value;
                      setOtp(newOtp);
                      if (e.target.value && index < 5) {
                        inputRefs.current[index + 1]?.focus();
                      }
                    }}
                    ref={(el) => (inputRefs.current[index] = el)}
                  />
                ))}
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword.password ? 'text' : 'password'}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword({ ...showPassword, password: !showPassword.password })}
                >
                  {showPassword.password ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <PasswordStrengthMeter password={formData.password} />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword.confirm ? 'text' : 'password'}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                >
                  {showPassword.confirm ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
