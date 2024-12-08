import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const Navbar = () => {
  return (
    <div className="w-full flex justify-center mt-4">
      <nav className="border-black rounded-full m-2 border w-[86vw]">
        <div className="container mx-auto flex items-center justify-between pl-6 pr-2 py-2">
          <h1 className="text-2xl font-bold text-indigo-900">
            Misty<span className="text-yellow-300">Mounts</span>
          </h1>
          <ul className="hidden md:flex space-x-8">
            <li>
              <Link to="/" className="hover:text-yellow-300">Home</Link> {/* Link for Home */}
            </li>
            <li>
              <Link to="/destinations" className="hover:text-yellow-300">Destinations</Link> {/* Link for Destinations */}
            </li>
            <li>
              <Link to="/about" className="hover:text-yellow-300">About</Link> {/* Link for About */}
            </li>
            <li>
              <Link to="/contact" className="hover:text-yellow-300">Contact</Link> {/* Link for Contact */}
            </li>
          </ul>
          <button className="bg-yellow-300 text-black px-4 py-2 rounded-full w-20">
            Login
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
