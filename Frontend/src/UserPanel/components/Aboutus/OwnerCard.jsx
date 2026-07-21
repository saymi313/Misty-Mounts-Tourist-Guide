import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const OwnerCard = ({ name, role, bio, image, github, linkedin }) => {
  return (
    <div className="group flex flex-col items-center rounded-3xl bg-white dark:bg-abyss-900 p-7 text-center shadow-card ring-1 ring-abyss-900/10 dark:ring-frost-50/10 transition-all duration-300 ease-editorial hover:-translate-y-1 hover:shadow-lift">
      <img
        src={image}
        alt={name}
        className="h-28 w-28 rounded-full object-cover ring-4 ring-glacier-500/20 dark:ring-glacier-400/20"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <h3 className="mt-5 font-display text-lg font-semibold text-abyss-900 dark:text-frost-50">{name}</h3>
      <p className="text-sm font-medium text-glacier-700 dark:text-glacier-300">{role}</p>
      <p className="mt-3 text-sm leading-relaxed text-frost-600 dark:text-frost-300">{bio}</p>
      <div className="mt-5 flex gap-2">
        <a href={github} target="_blank" rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-frost-100 text-frost-600 hover:bg-glacier-500 hover:text-abyss-950 dark:bg-abyss-800 dark:text-frost-300 transition-colors">
          <FaGithub className="h-4 w-4" />
        </a>
        <a href={linkedin} target="_blank" rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-frost-100 text-frost-600 hover:bg-glacier-500 hover:text-abyss-950 dark:bg-abyss-800 dark:text-frost-300 transition-colors">
          <FaLinkedin className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default OwnerCard;
