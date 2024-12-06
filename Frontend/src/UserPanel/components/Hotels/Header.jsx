import React from 'react';

const Header = () => {
  return (
    <header className="flex justify-between items-center px-8 py-4 shadow-md">
      <div className="text-2xl font-bold">MistyMounts</div>
      <nav className="space-x-6">
        <a href="/" className="hover:text-blue-600">Home</a>
        <a href="/hotels" className="hover:text-blue-600">Hotels</a>
        <a href="/rooms" className="hover:text-blue-600">Rooms</a>
        <a href="/about" className="hover:text-blue-600">About</a>
        <a href="/contact" className="hover:text-blue-600">Contact</a>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Login</button>
      </nav>
    </header>
  );
};

export default Header;
