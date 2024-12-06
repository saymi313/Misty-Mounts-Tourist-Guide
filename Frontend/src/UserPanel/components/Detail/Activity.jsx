import React from 'react';

const Activity = () => {
  const activities = [
    "Discover London on a classic Routemaster vintage double-decker bus",
    "Cruise down the River Thames",
    "See the Changing of the Guard",
    "Go to Westminster Abbey",
    "Listen to the chimes of Big Ben",
  ];

  return (
    <section className="px-8 py-4">
      <h2 className="text-2xl font-bold mb-4">Activity</h2>
      <ul className="list-disc list-inside text-gray-700">
        {activities.map((activity, index) => (
          <li key={index}>{activity}</li>
        ))}
      </ul>
    </section>
  );
};

export default Activity;
