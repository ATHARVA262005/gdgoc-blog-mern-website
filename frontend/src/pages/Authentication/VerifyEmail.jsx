import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../../services/authService';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const response = await verifyOTP(email, otpString);
      
      // Store the user data before navigating
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      
      navigate('/onboarding', { 
        state: { userData: response.user },
        replace: true
      });
    } catch (err) {
      setError(err.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']); // Clear OTP fields on error
      inputRefs.current[0]?.focus(); // Focus first input
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    try {
      setError('');
      await resendOTP(email);
      setResendDisabled(true);
      setCountdown(60);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">Verify your email</h2>
        <p className="mt-2 text-center text-gray-600 text-lg">
          We've sent a verification code to {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter verification code
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || otp.some(digit => !digit)}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendDisabled}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendDisabled 
                  ? `Resend code in ${countdown}s` 
                  : "Didn't receive a code? Resend"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
