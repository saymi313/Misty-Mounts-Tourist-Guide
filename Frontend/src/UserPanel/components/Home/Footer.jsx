import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} MyBrand. All rights reserved.</p>
        <div className="mt-4 space-x-4">
          <a href="#privacy" className="text-gray-400 hover:text-white">Privacy Policy</a>
          <a href="#terms" className="text-gray-400 hover:text-white">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
