import React from "react";
import Navbar from "./Navbar";
const HeroSection = () => {
  return (
    <>
      <div className=" overflow-x-hidden">
        <Navbar />
        <div className="relative h-screen w-full">
          <div className="flex w-full justify-between mt-10 px-20">
            <div className="flex flex-col gap-6 justify-center items-start">
              <h1 className="text-4xl md:text-4xl font-bold">
              Unveiling Nature's Hidden Paradise
              </h1>
              <p className="w-[40vw]">Let Misty Mountains be your escape to unspoiled wilderness. Discover trails, waterfalls, and a sense of serenity like never before.</p>
              <div className="mt-6 flex justify-center space-x-4">
                <button className="px-6 py-2 bg-yellow-500 text-white rounded-md">
                  Explore Now
                </button>
              </div>
            </div>
            <div className="image flex gap-4 justify-center items-center">
              <div className="h-[25vw] w-[10vw] rounded-full overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="/hero.jpg"
                  alt=""
                />
              </div>
              <div className="h-[30vw] w-[10vw] rounded-full overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="/Pic2.jpg"
                  alt=""
                />
              </div>
              <div className="h-[25vw] w-[10vw] rounded-full overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="/Pic3.jpg"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
