import React from "react";
import Navbar from "./Navbar";
const HeroSection = () => {
  return (
    <>
    <div className=" overflow-x-hidden">
     <Navbar />
    <div className="relative h-screen bg-cover bg-center"style={{ backgroundImage: "url('hero.jpg')" }}>
      
      <div className="container mx-auto text-center py-20 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white">Let's Make Your Dream Vacation</h1>
        <div className="mt-6 flex justify-center space-x-4">
          <button className="px-6 py-2 bg-yellow-500 text-white rounded-md">Explore Now</button>
        </div>
      </div>
    </div>
    </div>
      </>
  );
};

export default HeroSection;
