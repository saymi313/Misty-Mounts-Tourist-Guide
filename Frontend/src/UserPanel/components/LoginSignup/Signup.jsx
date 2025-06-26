import React, { useState } from 'react';
import {
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaLock, 
  FaUser, 
  FaList,
  FaMountain,
  FaArrowRight,
  FaGoogle,
  FaGithub
} from 'react-icons/fa';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!type) {
      setError('Please select a user type');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/user/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess('Signup successful! You can now log in.');
      setEmail('');
      setUsername('');
      setPassword('');
      setType('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full mb-4 shadow-lg">
              <FaMountain className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Join Adventure</h2>
            <p className="text-slate-400 text-sm">Create your account and start exploring</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-green-300">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="h-4 w-4 text-slate-400" />
                </div>
                <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-slate-400 transition-all duration-300"
                  placeholder="Enter your email"
        required
      />
              </div>
            </div>
            
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-slate-400 transition-all duration-300"
                  placeholder="Choose a username"
        required
      />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-slate-400" />
                </div>
                <input
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-slate-400 transition-all duration-300"
                  placeholder="Create a password"
        required
                />
                <button
                  type="button"
                onClick={handleClickShowPassword}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-300 transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {/* User Type Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">User Type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaList className="h-4 w-4 text-slate-400" />
                </div>
                <select
        value={type}
        onChange={(e) => setType(e.target.value)}
                  className="block w-full pl-12 pr-10 py-3.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-slate-400 transition-all duration-300 appearance-none cursor-pointer"
        required
      >
                  <option value="" className="bg-gray-800 text-slate-400">Select user type</option>
                  <option value="user" className="bg-gray-800 text-white">Tourist</option>
                  <option value="local guide" className="bg-gray-800 text-white">Local Guide</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 text-slate-400 bg-gray-800 border-gray-600 rounded focus:ring-slate-400 focus:ring-2"
                required
              />
              <label className="ml-2 text-sm text-slate-400">
                I agree to the{' '}
                <button
                  type="button"
                  className="text-slate-300 hover:text-white underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  className="text-slate-300 hover:text-white underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>
            
            {/* Submit Button */}
            <button
        type="submit"
        disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <FaArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
    </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Social Signup Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center px-4 py-3 border border-gray-600/50 rounded-xl text-slate-300 hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-300 group"
            >
              <FaGoogle className="w-4 h-4 mr-2 group-hover:text-white transition-colors duration-200" />
              <span className="text-sm group-hover:text-white transition-colors duration-200">Google</span>
            </button>
            
            <button
              type="button"
              className="flex items-center justify-center px-4 py-3 border border-gray-600/50 rounded-xl text-slate-300 hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-300 group"
            >
              <FaGithub className="w-4 h-4 mr-2 group-hover:text-white transition-colors duration-200" />
              <span className="text-sm group-hover:text-white transition-colors duration-200">GitHub</span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                className="text-slate-300 hover:text-white font-medium transition-colors duration-200 hover:underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;