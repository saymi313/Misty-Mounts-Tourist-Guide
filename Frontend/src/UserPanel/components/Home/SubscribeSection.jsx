import React from "react";

const SubscribeSection = () => {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <h2 className="text-center text-xl font-bold mb-4 w-[50vw]">
        Subscribe to get information, latest news, and other interesting offers about on trip travels
      </h2>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
        <input
          type="email"
          placeholder="Type your email here"
          className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button className="px-6 py-2 border border-black text-sm rounded-full hover:bg-yellow-300 hover:border-none">
          Subscribe
        </button>
      </div>
    </div>
  );
};

export default SubscribeSection;
