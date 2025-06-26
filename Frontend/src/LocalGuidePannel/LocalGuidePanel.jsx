import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import LocalGuideRoutes from './routes/LocalGuideRoutes';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LocalGuidePanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Local Guide Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <Link 
              to="/local-guide" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                isActive('/local-guide') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              Tourist Spots
            </Link>
            <Link 
              to="/local-guide/natural-disasters" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                isActive('/local-guide/natural-disasters') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              Natural Disasters
            </Link>
            <Link 
              to="/local-guide/feedback" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                isActive('/local-guide/feedback') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              Feedback
            </Link>
            <Link 
              to="/local-guide/messages" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                isActive('/local-guide/messages') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              Messages
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Routes>
            {LocalGuideRoutes()}
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default LocalGuidePanel; 