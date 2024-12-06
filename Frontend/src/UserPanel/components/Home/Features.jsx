import React from 'react';

const Features = () => {
  const features = [
    { title: "Feature One", description: "Description of feature one." },
    { title: "Feature Two", description: "Description of feature two." },
    { title: "Feature Three", description: "Description of feature three." },
  ];

  return (
    <section id="features" className="bg-white py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          Amazing Features
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-100 p-6 rounded-md shadow-md">
              <h3 className="text-xl font-semibold text-gray-700">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
