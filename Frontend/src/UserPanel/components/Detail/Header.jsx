import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <Link to="/" className="text-xl font-bold text-gray-800">Tourist Guide</Link>
      </nav>
    </header>
  );
};

export default Header;

