import React from 'react';

const Pagination = () => {
  return (
    <div className="flex justify-center mt-8 space-x-2">
      <button className="px-4 py-2 border border-abyss-900/10 rounded-lg bg-frost-100 text-abyss-900 dark:border-frost-50/12 dark:bg-abyss-800 dark:text-frost-50">1</button>
      <button className="px-4 py-2 border border-abyss-900/10 rounded-lg bg-frost-100 text-abyss-900 dark:border-frost-50/12 dark:bg-abyss-800 dark:text-frost-50">2</button>
      <button className="px-4 py-2 border border-abyss-900/10 rounded-lg bg-frost-100 text-abyss-900 dark:border-frost-50/12 dark:bg-abyss-800 dark:text-frost-50">3</button>
      <button className="px-4 py-2 border border-abyss-900/10 rounded-lg bg-frost-100 text-abyss-900 dark:border-frost-50/12 dark:bg-abyss-800 dark:text-frost-50">Next</button>
    </div>
  );
};

export default Pagination;
