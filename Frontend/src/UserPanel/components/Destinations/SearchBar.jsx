import React from 'react';

const SearchBar = ({ placeholder }) => {
  return (
    <div className="relative flex justify-center mt-[-50px]">
      <input
        type="text"
        placeholder={placeholder}
        className="rounded-r-none w-3/4 md:w-2/4 lg:w-1/3 py-4 px-6 border border-gray-300 rounded-lg shadow-lg focus:outline-none"
      />
      <button className=" rounded-l-none bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
        Search
      </button>
    </div>
  );
};

export default SearchBar;
