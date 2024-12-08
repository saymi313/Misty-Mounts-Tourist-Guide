import React from "react";

const Navbar = () => {
  return (
    <div className="w-full flex justify-center mt-4">
    <nav className="border-black rounded-full m-2 border w-[86vw]">
      <div className="container mx-auto flex items-center justify-between pl-6 pr-2 py-2">
        <h1 className="text-2xl font-bold text-indigo-900">
          Misty<span className="text-yellow-300">Mounts</span>
        </h1>
        <ul className="hidden md:flex space-x-8">
          <li><a href="#" className="hover:text-yellow-300">Home</a></li>
          <li><a href="#" className="hover:text-yellow-300">Destinations</a></li>
          <li><a href="#" className="hover:text-yellow-300">About</a></li>
          <li><a href="#" className="hover:text-yellow-300">Contact</a></li>
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
