import React from 'react';

const SearchBar = ({ placeholder }) => {
  return (
    <div className="relative flex justify-center mt-[-50px]">
      <input
        type="text"
        placeholder={placeholder}
        className="rounded-r-none w-3/4 md:w-2/4 lg:w-1/3 py-4 px-6 border border-abyss-900/12 bg-white text-abyss-900 placeholder-frost-400 rounded-lg shadow-lg focus:outline-none dark:border-frost-50/15 dark:bg-abyss-800 dark:text-frost-50"
      />
      <button className=" rounded-l-none bg-glacier-400 text-abyss-950 px-4 py-2 rounded-lg hover:bg-glacier-500">
        Search
      </button>
    </div>
  );
};

export default SearchBar;
