import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaPlus, FaChartBar, FaUser, FaCog, FaExclamationTriangle } from 'react-icons/fa';
import { getAllTouristSpots } from '../api/touristSpotApi';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [spots, setSpots] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const response = await getAllTouristSpots();
      setSpots(response.data);
    } catch (error) {
      console.error('Error fetching spots:', error);
    }
  };

  const navigation = [
    { name: 'Tourist Spots', href: '/local-guide', icon: FaMapMarkerAlt },
    { name: 'Add Tourist Spot', href: '/local-guide/add-spot', icon: FaPlus },
    { name: 'Natural Disasters', href: '/local-guide/natural-disasters', icon: FaExclamationTriangle },
    { name: 'Feedback', href: '/local-guide/feedback', icon: FaChartBar },
    { name: 'Messages', href: '/local-guide/messages', icon: FaUser }, // This links to the Chatbot
    { name: 'Settings', href: '/local-guide/settings', icon: FaCog },
  ];
  

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-indigo-700 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>
        <Link to="/local-guide" className="text-white flex items-center space-x-2 px-4">
          <FaMapMarkerAlt className="w-8 h-8" />
          <span className="text-2xl font-extrabold">Local Guide</span>
        </Link>
        <nav>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`block py-2.5 px-4 rounded transition duration-200 ${
                location.pathname === item.href ? 'bg-indigo-800' : 'hover:bg-indigo-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center py-4 px-6 bg-white border-b-4 border-indigo-600">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 focus:outline-none md:hidden">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="flex items-center">
            <Link
              to="/local-guide/add-spot"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 mr-2"
            >
              Add Tourist Spot
            </Link>
            <Link
              to="/local-guide/add-natural-disaster"
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
            >
              Report Natural Disaster
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

