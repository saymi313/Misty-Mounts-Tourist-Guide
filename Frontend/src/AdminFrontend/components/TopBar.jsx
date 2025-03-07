// TopBar.js
import React from "react";

const TopBar = ({ NavOpen, IsNavOpen }) => {
  return (
    <div className="topBar px-5 md:px-10 py-5 bg-white flex items-center justify-between w-full fixed z-20">
      <div className="hidden sm:block z-50 bg-transparent">
        <a href="#_" onClick={() => IsNavOpen(!NavOpen)}>
          <img className="h-5 w-5" src="/hamburger.png" alt="" />
        </a>
      </div>
      <div className="flex gap-12 md:mr-16">
        <div>
          <div className="md:flex items-center bg-blue-100 rounded-3xl px-3 py-2.5 hidden border-transparent border-2 group focus-within:border-[#09D7C9]">
            <img className="h-5 w-5" src="/search.png" alt="search" />
            <input
              type="text"
              placeholder="Search.."
              className="bg-transparent px-4 focus:outline-none group"
            />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <a href="#_" className="md:hidden">
            <img src="/search.png" alt="searchicon" />
          </a>
          <a href="#_">
            <img src="/assets/travelagency-admin/bell.svg" alt="" />
          </a>
          <a href="#_">
            <img className="h-8 w-8" src="/manager.png" alt="profileicon" />
          </a>
          <a href="#_" onClick={() => IsNavOpen(!NavOpen)}>
            <img src="/hamburger.png" alt="" className="sm:hidden" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
