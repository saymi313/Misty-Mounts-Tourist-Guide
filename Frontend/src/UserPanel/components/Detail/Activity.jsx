import React from 'react';

const Activity = () => {
  const activities = [
    "Trek through the majestic mountain ranges",
    "Raft on the fast-flowing rivers",
    "Camp under the starry skies",
    "Explore serene valleys and lakes",
    "Drive the famous Karakoram Highway",
    "Experience traditional festivals and local culture",
    "Go off-roading to remote destinations",
    "Enjoy scenic views from high-altitude passes",
    "Paraglide in breathtaking landscapes",
    "Hike to stunning viewpoints and peaks",
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
