import React from "react";

const Navbar = () => {
  return (
    <nav className="border-black rounded-full m-2 border-b-2">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-indigo-900">
          Misty<span className="text-yellow-500">Mounts</span>
        </h1>
        <ul className="hidden md:flex space-x-8">
          <li><a href="#" className="hover:text-yellow-500">Home</a></li>
          <li><a href="#" className="hover:text-yellow-500">Destinations</a></li>
          <li><a href="#" className="hover:text-yellow-500">Packages</a></li>
          <li><a href="#" className="hover:text-yellow-500">About</a></li>
          <li><a href="#" className="hover:text-yellow-500">Contact</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
