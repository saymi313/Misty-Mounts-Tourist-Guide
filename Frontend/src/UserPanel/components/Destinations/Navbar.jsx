import React from 'react';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-white shadow-md">
      <h1 className="text-2xl font-bold">Tour Guide</h1>
      <ul className="flex space-x-6">
        {['Home', 'About Us', 'Popular Destinations', 'Our Packages', 'Help'].map((item, index) => (
          <li key={index} className="text-gray-700 hover:text-yellow-500 cursor-pointer">
            {item}
          </li>
        ))}
      </ul>
      <button className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
        Sign In
      </button>
    </nav>
  );
};

export default Navbar;
