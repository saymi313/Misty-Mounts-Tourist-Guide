import React from 'react';

const Pagination = () => {
  return (
    <div className="flex justify-center mt-8 space-x-2">
      <button className="px-4 py-2 border rounded-lg bg-gray-200">1</button>
      <button className="px-4 py-2 border rounded-lg bg-gray-200">2</button>
      <button className="px-4 py-2 border rounded-lg bg-gray-200">3</button>
      <button className="px-4 py-2 border rounded-lg bg-gray-200">Next</button>
    </div>
  );
};

export default Pagination;
