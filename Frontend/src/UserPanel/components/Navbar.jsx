import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";
import NotificationSystem from "../../components/NotificationSystem";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="w-full flex justify-center">
      <nav className="border-black rounded-full m-2 border w-[86vw]">
        <div className="container mx-auto flex items-center justify-between pl-6 pr-2 py-2">
          <h1 className="text-2xl font-bold text-indigo-900">
            Misty<span className="text-yellow-300">Mounts</span>
          </h1>
          
          {user ? (
            // Show navigation links only when user is logged in
            <ul className="hidden md:flex space-x-8">
              <li>
                <Link to="/user" className="hover:text-yellow-300">Home</Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-yellow-300">Destinations</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-yellow-300">About</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-yellow-300">Contact</Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-yellow-300">Feedback</Link>
              </li>
            </ul>
          ) : (
            // Show login button when user is not logged in
            <div className="hidden md:block">
              <Link to="/" className="bg-yellow-300 text-black px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors duration-200">
                Login
              </Link>
            </div>
          )}
          
          {user ? (
            <div className="flex items-center space-x-4">
              <NotificationSystem />
              <ProfileDropdown />
            </div>
          ) : (
            <div className="md:hidden">
              <Link to="/" className="bg-yellow-300 text-black px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors duration-200">
                Login
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
