import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center px-4 mx-auto">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M17.8 19.2L16 11l3.5-3.5a2.1 2.1 0 0 0 0-3 2.1 2.1 0 0 0-3 0L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
          </svg>
          <span>TravelEase</span>
        </Link>
        <div className="ml-auto flex gap-4">
          <Link to="/hotels" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Hotels</Link>
          <Link to="/flights" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Flights</Link>
          <Link to="/activities" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Activities</Link>
          <Link to="/account" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md">My Account</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

