import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { login } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      
      // Use auth context instead of localStorage
      authLogin(response.user, response.token);
      
      if (response.requiresVerification) {
        navigate('/verify-email', { state: { email: formData.email } });
        return;
      }
      
      if (!response.user.onboarded) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.message === 'Email is not registered') {
        setError('No account found with this email');
      } else if (err.message === 'Incorrect password') {
        setError('Invalid password');
      } else {
        setError(err.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-4xl font-bold text-gray-900 mb-2">Welcome back</h2>
        <p className="text-center text-lg text-gray-600 mb-8">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-xl rounded-xl">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-base font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-base font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-3 block text-base text-gray-900">
                  Remember me
                </label>
              </div>

              <div>
                <Link to="/forgot-password" className="text-base font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              {error && (
                <p className="text-center text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
