import React from 'react';
import { Github, Linkedin } from 'lucide-react';

const OwnerCard = ({ name, role, bio, image, github, linkedin }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <img className="w-full h-64 object-cover object-center" src={image} alt={name} />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
        <p className="text-sm text-indigo-600 mb-2">{role}</p>
        <p className="text-gray-600 mb-4">{bio}</p>
        <div className="flex justify-start space-x-4">
          <a href={github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600">
            <Github className="h-6 w-6" />
          </a>
          <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600">
            <Linkedin className="h-6 w-6" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default OwnerCard;

