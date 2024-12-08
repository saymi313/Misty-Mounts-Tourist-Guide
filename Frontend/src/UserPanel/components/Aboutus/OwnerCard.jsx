import React from 'react';

const OwnerCard = ({ name, role, bio, image, github, linkedin }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:bg-gray-50 text-center">
      <img
        src={image}
        alt={name}
        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover transition-all duration-300 hover:scale-110"
      />
      <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
      <p className="text-gray-500 mb-2">{role}</p>
      <p className="text-gray-600 mb-4">{bio}</p>
      <div className="flex justify-center space-x-4">
        <a href={github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 transition-colors duration-300">
          <i className="fab fa-github"></i>
        </a>
        <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 transition-colors duration-300">
          <i className="fab fa-linkedin"></i>
        </a>
      </div>
    </div>
  );
};

export default OwnerCard;
