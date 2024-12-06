import React from "react";

const SubscribeSection = () => {
  return (
    <div className="py-16 bg-blue-100 text-center">
      <h2 className="text-3xl font-bold mb-4">
        Subscribe to get information, latest news, and other interesting offers about <span className="text-indigo-500 font-bold">ON TRIP Travels</span>
      </h2>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
        <input
          type="email"
          placeholder="Type your email here"
          className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button className="px-6 py-2 bg-indigo-500 text-white text-sm font-bold rounded-md hover:bg-indigo-600">
          Subscribe
        </button>
      </div>
    </div>
  );
};

export default SubscribeSection;
