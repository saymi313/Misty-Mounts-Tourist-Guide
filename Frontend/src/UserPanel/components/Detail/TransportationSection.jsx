import React from 'react';
import { Car, Bus, Train, Plane } from 'lucide-react';

const TransportationSection = ({ transportationData }) => {
  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'car':
        return <Car className="w-6 h-6" />;
      case 'bus':
        return <Bus className="w-6 h-6" />;
      case 'train':
        return <Train className="w-6 h-6" />;
      case 'plane':
        return <Plane className="w-6 h-6" />;
      default:
        return <Car className="w-6 h-6" />;
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-semibold mb-6">Transportation Options</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {transportationData.map((transport) => (
          <div key={transport._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              {getIcon(transport.transportType)}
              <h3 className="text-xl font-semibold ml-2">{transport.transportType}</h3>
            </div>
            <p className="text-gray-600">Number available: {transport.Number}</p>
            <p className={`mt-2 ${transport.availability ? 'text-green-600' : 'text-red-600'}`}>
              {transport.availability ? 'Available' : 'Not Available'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TransportationSection;

