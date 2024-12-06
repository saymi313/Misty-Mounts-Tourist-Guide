import React from 'react';

const Header = () => {
  return (
    <header className="flex justify-between items-center px-8 py-4 shadow-md">
      <div className="text-2xl font-bold">Tour Guide</div>
      <nav className="space-x-4">
        <a href="/" className="hover:underline">Home</a>
        <a href="/about" className="hover:underline">About Us</a>
        <a href="/destinations" className="hover:underline">Popular Destinations</a>
        <a href="/packages" className="hover:underline">Our Packages</a>
        <a href="/help" className="hover:underline">Help</a>
        <button className="bg-yellow-400 text-white px-4 py-2 rounded">Sign In</button>
      </nav>
    </header>
  );
};

export default Header;
